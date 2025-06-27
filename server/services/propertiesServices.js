const createProperty = async (propertyData = {}) => {
    try {
        return {
            message: "Property has been successfully created!",
            propertyData,
        };
    } catch (error) {
        console.error("Error creating property:", error);
        throw new Error(error.message || "Failed to create property");
        
    }
}

const getProperties = async (queryObj = {}) => {
    try {
        return {
            message: "Properties retrieved successfully",
            properties: [], 
        };
    } catch (error) {
        console.error("Error getting properties:", error);
        throw new Error(error.message || "Failed to get properties");
        
    }
};

const getSinglePropertyById = async (property_id = "") => {
    try {
        return {
            message: "Property retrieved successfully",
            property_id,
        };
    } catch (error) {
        console.error("Error getting property:", error);
        throw new Error(error.message || "Failed to get property");
        
    }
};

const editPropertyById = async (property_id = "", propertyData = {}) => {
    try {
        return {
            message: `${property_id} has been successfully updated!`,
            propertyData,
        };
    } catch (error) {
        console.error("Error updating property:", error);
        throw new Error(error.message || "Failed to update property");
        
    }
};

const deletePropertyById = async (property_id = "") => {
    try {
        const property = await getSinglePropertyById(property_id);
        return {
            message: `${property_id} has been successfully deleted!`,
            property,
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
    deletePropertyById
};