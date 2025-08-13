import { v4 as uuidv4 } from "uuid";
import conn from "./../config/db.js";

const pool = await conn();

const createProperty = async (propertyData = {}) => {
    const {
        property_name,
        floor_area_sqm,
        description,
        display_image,
        property_status,
        base_rent,
        property_taxes_quarterly,
        security_deposit_months,
        minimum_lease_term_months,
        address_id
    } = propertyData || {};

    const property_id = uuidv4();

    try {
        const newProperty = {
            property_id,
            property_name,
            floor_area_sqm: floor_area_sqm ? parseFloat(floor_area_sqm) : null,
            description,
            display_image,
            property_status: property_status || 'Available',
            base_rent: base_rent ? parseFloat(base_rent) : null,
            property_taxes_quarterly: property_taxes_quarterly ? parseFloat(property_taxes_quarterly) : null,
            security_deposit_months: security_deposit_months ? parseFloat(security_deposit_months) : null,
            minimum_lease_term_months: minimum_lease_term_months ? parseInt(minimum_lease_term_months) : 24,
            address_id
        };

        // Remove undefined values
        Object.keys(newProperty).forEach(
            (key) => newProperty[key] === undefined && delete newProperty[key]
        );

        // Build dynamic query
        const fields = Object.keys(newProperty).join(", ");
        const placeholders = Object.keys(newProperty).map(() => "?").join(", ");
        const values = Object.values(newProperty);

        const query = `INSERT INTO properties (${fields}, created_at, updated_at) VALUES (${placeholders}, NOW(), NOW())`;
        const [result] = await pool.query(query, values);

        return {
            message: "Property has been successfully created!",
            propertyId: property_id,
            propertyData: newProperty,
            insertId: result.insertId
        };
    } catch (error) {
        console.error("Error creating property:", error);
        throw new Error(error.message || "Failed to create property");
    }
};

const getProperties = async (queryObj = {}) => {
    try {
        let query = `
            SELECT 
                p.property_id,
                p.property_name,
                p.floor_area_sqm,
                p.description,
                p.display_image,
                p.property_status,
                p.base_rent,
                p.property_taxes_quarterly,
                p.security_deposit_months,
                p.minimum_lease_term_months,
                p.address_id,
                p.created_at,
                p.updated_at,
                a.street_address,
                a.city,
                a.state_province,
                a.postal_code,
                a.country,
                JSON_ARRAYAGG(
                    CASE 
                        WHEN pp.image_url IS NOT NULL 
                        THEN JSON_OBJECT(
                            'image_url', pp.image_url,
                            'property_desc', pp.property_desc
                        )
                        ELSE NULL
                    END
                ) as property_pictures
            FROM properties p
            LEFT JOIN addresses a ON p.address_id = a.address_id
            LEFT JOIN properties_pictures pp ON p.property_id = pp.property_id
            WHERE 1=1
        `;
        
        const values = [];

        // Add filters with parameterized queries
        if (queryObj.property_status) {
            query += ` AND p.property_status = ?`;
            values.push(queryObj.property_status);
        }
        
        if (queryObj.search) {
            query += ` AND (p.property_name LIKE ? OR a.street_address LIKE ? OR a.city LIKE ?)`;
            const searchTerm = `%${queryObj.search}%`;
            values.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (queryObj.min_rent) {
            query += ` AND p.base_rent >= ?`;
            values.push(parseFloat(queryObj.min_rent));
        }
        
        if (queryObj.max_rent) {
            query += ` AND p.base_rent <= ?`;
            values.push(parseFloat(queryObj.max_rent));
        }
        
        if (queryObj.min_area) {
            query += ` AND p.floor_area_sqm >= ?`;
            values.push(parseFloat(queryObj.min_area));
        }
        
        if (queryObj.max_area) {
            query += ` AND p.floor_area_sqm <= ?`;
            values.push(parseFloat(queryObj.max_area));
        }
        
        if (queryObj.city) {
            query += ` AND a.city = ?`;
            values.push(queryObj.city);
        }
        
        // Add GROUP BY before sorting (required for JSON_ARRAYAGG)
        query += ` GROUP BY p.property_id`;
        
        // Add sorting
        const allowedSortFields = ['property_name', 'base_rent', 'floor_area_sqm', 'created_at', 'updated_at'];
        const sortField = allowedSortFields.includes(queryObj.sort_by) ? `p.${queryObj.sort_by}` : 'p.created_at';
        const sortOrder = queryObj.sort_order === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortField} ${sortOrder}`;
        
        // Add pagination
        if (queryObj.limit) {
            const limit = parseInt(queryObj.limit);
            const offset = parseInt(queryObj.offset || 0);
            query += ` LIMIT ? OFFSET ?`;
            values.push(limit, offset);
        }
        
        const [rows] = await pool.query(query, values);
        
        // Process property_pictures to remove null values
        const processedRows = rows.map(row => ({
            ...row,
            property_pictures: row.property_pictures ? 
                row.property_pictures.filter(pic => pic !== null) : []
        }));
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(DISTINCT p.property_id) as total 
            FROM properties p
            LEFT JOIN addresses a ON p.address_id = a.address_id
            WHERE 1=1
        `;
        const countValues = [];
        
        // Rebuild count query with same filters
        if (queryObj.property_status) {
            countQuery += ` AND p.property_status = ?`;
            countValues.push(queryObj.property_status);
        }
        
        if (queryObj.search) {
            countQuery += ` AND (p.property_name LIKE ? OR a.street_address LIKE ? OR a.city LIKE ?)`;
            const searchTerm = `%${queryObj.search}%`;
            countValues.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (queryObj.min_rent) {
            countQuery += ` AND p.base_rent >= ?`;
            countValues.push(parseFloat(queryObj.min_rent));
        }
        
        if (queryObj.max_rent) {
            countQuery += ` AND p.base_rent <= ?`;
            countValues.push(parseFloat(queryObj.max_rent));
        }
        
        if (queryObj.min_area) {
            countQuery += ` AND p.floor_area_sqm >= ?`;
            countValues.push(parseFloat(queryObj.min_area));
        }
        
        if (queryObj.max_area) {
            countQuery += ` AND p.floor_area_sqm <= ?`;
            countValues.push(parseFloat(queryObj.max_area));
        }
        
        if (queryObj.city) {
            countQuery += ` AND a.city = ?`;
            countValues.push(queryObj.city);
        }
        
        const [countResult] = await pool.query(countQuery, countValues);
        
        return {
            message: "Properties retrieved successfully",
            properties: processedRows,
            total: countResult[0].total,
            page: queryObj.page || 1,
            limit: queryObj.limit || processedRows.length
        };
    } catch (error) {
        console.error("Error getting properties:", error);
        throw new Error(error.message || "Failed to get properties");
    }
};

const getSinglePropertyById = async (property_id = "") => {
    try {
        if (!property_id) {
            throw new Error("Property ID is required");
        }
        
        const query = `
            SELECT 
                p.property_id,
                p.property_name,
                p.floor_area_sqm,
                p.description,
                p.display_image,
                p.property_status,
                p.base_rent,
                p.property_taxes_quarterly,
                p.security_deposit_months,
                p.minimum_lease_term_months,
                p.address_id,
                p.created_at,
                p.updated_at,
                a.street_address,
                a.city,
                a.state_province,
                a.postal_code,
                a.country,
                JSON_ARRAYAGG(
                    CASE 
                        WHEN pp.image_url IS NOT NULL 
                        THEN JSON_OBJECT(
                            'image_url', pp.image_url,
                            'property_desc', pp.property_desc
                        )
                        ELSE NULL
                    END
                ) as property_pictures
            FROM properties p
            LEFT JOIN addresses a ON p.address_id = a.address_id
            LEFT JOIN properties_pictures pp ON p.property_id = pp.property_id
            WHERE p.property_id = ?
            GROUP BY p.property_id
        `;
        
        const [rows] = await pool.query(query, [property_id]);
        
        if (rows.length === 0) {
            throw new Error("Property not found");
        }
        
        // Process property_pictures to remove null values
        const property = {
            ...rows[0],
            property_pictures: rows[0].property_pictures ? 
                rows[0].property_pictures.filter(pic => pic !== null) : []
        };
        
        return {
            message: "Property retrieved successfully",
            property: property
        };
    } catch (error) {
        console.error("Error getting property:", error);
        throw new Error(error.message || "Failed to get property");
    }
};

const editPropertyById = async (property_id = "", propertyData = {}) => {
    try {
        if (!property_id) {
            throw new Error("Property ID is required");
        }
        
        // First check if property exists
        await getSinglePropertyById(property_id);
        
        // Build dynamic update query
        const updateFields = [];
        const values = [];
        
        const allowedFields = [
            'property_name',
            'floor_area_sqm',
            'description',
            'display_image',
            'property_status',
            'base_rent',
            'property_taxes_quarterly',
            'security_deposit_months',
            'minimum_lease_term_months',
            'address_id'
        ];
        
        allowedFields.forEach(field => {
            if (propertyData[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                
                // Convert numeric fields appropriately
                if (field === 'base_rent' || field === 'property_taxes_quarterly' || 
                    field === 'security_deposit_months' || field === 'floor_area_sqm') {
                    values.push(propertyData[field] ? parseFloat(propertyData[field]) : null);
                } else if (field === 'minimum_lease_term_months') {
                    values.push(propertyData[field] ? parseInt(propertyData[field]) : null);
                } else {
                    values.push(propertyData[field]);
                }
            }
        });
        
        if (updateFields.length === 0) {
            throw new Error("No valid fields to update");
        }
        
        // Add updated_at timestamp
        updateFields.push('updated_at = NOW()');
        
        const query = `
            UPDATE properties 
            SET ${updateFields.join(', ')} 
            WHERE property_id = ?
        `;
        
        values.push(property_id);
        
        const [result] = await pool.query(query, values);
        
        if (result.affectedRows === 0) {
            throw new Error("Property not found or no changes made");
        }
        
        // Get updated property
        const updatedProperty = await getSinglePropertyById(property_id);
        
        return {
            message: `Property ${property_id} has been successfully updated!`,
            property: updatedProperty.property,
            changedRows: result.changedRows
        };
    } catch (error) {
        console.error("Error updating property:", error);
        throw new Error(error.message || "Failed to update property");
    }
};

const deletePropertyById = async (property_id = "") => {
    try {
        if (!property_id) {
            throw new Error("Property ID is required");
        }
        
        // First get the property to return in response
        const property = await getSinglePropertyById(property_id);
        
        // Check for dependent records
        const dependencyQuery = `
            SELECT COUNT(*) as tenant_count 
            FROM tenants 
            WHERE property_id = ?
        `;
        
        const [dependencyResult] = await pool.query(dependencyQuery, [property_id]);
        
        if (dependencyResult[0].tenant_count > 0) {
            throw new Error("Cannot delete property with active tenants");
        }
        
        // Soft delete - update status instead of actual deletion
        const softDeleteQuery = `
            UPDATE properties 
            SET property_status = 'deleted', updated_at = NOW() 
            WHERE property_id = ?
        `;
        
        const [result] = await pool.query(softDeleteQuery, [property_id]);
        
        if (result.affectedRows === 0) {
            throw new Error("Property not found");
        }
        
        return {
            message: `Property ${property_id} has been successfully deleted!`,
            property: property.property,
            deletedRows: result.affectedRows
        };
    } catch (error) {
        console.error("Error deleting property:", error);
        throw new Error(error.message || "Failed to delete property");
    }
};

export default {
    createProperty,
    getProperties,
    getSinglePropertyById,
    editPropertyById,
    deletePropertyById,
};