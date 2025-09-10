import conn from "./../config/db.js";

const pool = await conn();

const createAddress = async (addressData = {}) => {
  try {
    const {
      building_name,
      street,
      barangay,
      city,
      province,
      postal_code,
      country = "Philippines",
      latitude,
      longitude,
    } = addressData;

    const [result] = await pool.query(
      `INSERT INTO addresses 
        (building_name, street, barangay, city, province, postal_code, country, latitude, longitude) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        building_name,
        street,
        barangay,
        city,
        province,
        postal_code,
        country,
        latitude,
        longitude,
      ]
    );
    return { address_id: result.insertId, ...addressData };
  } catch (error) {
    throw error;
  }
};

const getAllAddresses = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        address_id,
        building_name,
        street,
        barangay,
        city,
        province,
        postal_code,
        country,
        latitude,
        longitude,
        created_at,
        updated_at
      FROM addresses
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw new Error(error.message || "Failed to fetch addresses");
  }
};

const getSingleAddressById = async (address_id) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        address_id,
        building_name,
        street,
        barangay,
        city,
        province,
        postal_code,
        country,
        latitude,
        longitude,
        created_at,
        updated_at
      FROM addresses WHERE address_id = ?`,
      [address_id]
    );
    if (rows.length === 0) throw new Error("Address not found");
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const updateAddressById = async (address_id, addressData = {}) => {
  try {
    if (!address_id || isNaN(Number(address_id))) {
      throw new Error("Invalid address_id");
    }
    const requiredFields = [
      "building_name", "street", "barangay", "city", "province", "postal_code", "country"
    ];
    for (const field of requiredFields) {
      if (!addressData[field] || addressData[field].toString().trim() === "") {
        throw new Error(`Field '${field}' is required`);
      }
    }

    const {
      building_name,
      street,
      barangay,
      city,
      province,
      postal_code,
      country,
      latitude = null,
      longitude = null,
    } = addressData;

    const [result] = await pool.query(
      `UPDATE addresses SET 
        building_name = ?, 
        street = ?, 
        barangay = ?, 
        city = ?, 
        province = ?, 
        postal_code = ?, 
        country = ?, 
        latitude = ?, 
        longitude = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE address_id = ?`,
      [
        building_name,
        street,
        barangay,
        city,
        province,
        postal_code,
        country,
        latitude === "" ? null : latitude,
        longitude === "" ? null : longitude,
        address_id,
      ]
    );
    if (result.affectedRows === 0)
      throw new Error("Address not found or not updated");
    return { address_id, ...addressData };
  } catch (error) {
    console.error("Update address error:", error);
    throw error;
  }
};

const deleteAddressById = async (address_id) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM addresses WHERE address_id = ?`,
      [address_id]
    );
    if (result.affectedRows === 0)
      throw new Error("Address not found or not deleted");
    return { deleted: true, address_id };
  } catch (error) {
    throw error;
  }
};

export default {
  createAddress,
  getAllAddresses,
  getSingleAddressById,
  updateAddressById,
  deleteAddressById,
};
