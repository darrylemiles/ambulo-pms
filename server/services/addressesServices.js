import conn from "./../config/db.js";

const pool = await conn();

const createAddress= async (addressData = {}) => {
    try {
        return "address created"
    } catch (error) {
        throw error;
    }
}

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
        return "single address"
    } catch (error) {
        throw error;
    }
}

const updateAddressById = async (address_id, addressData = {}) => {
    try {
        return "address updated"
    } catch (error) {
        throw error;
    }
}

const deleteAddressById = async (address_id) => {
    try {
        return "address deleted"
    } catch (error) {
        throw error;
    }
}

export default {
    createAddress,
    getAllAddresses,
    getSingleAddressById,
    updateAddressById,
    deleteAddressById
};