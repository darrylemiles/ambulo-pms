import conn from "./../config/db.js";

const pool = await conn();

const createCharge = async (charge ={}) => {
try {
    return "charge created";
} catch (error) {
    console.error("Error creating charge:", error);
    throw error;
}
}

const getAllCharges = async () => {
    try {
        return "all charges";
    } catch (error) {
        console.error("Error fetching all charges:", error);
        throw error;
    }
}

const getChargeById = async (id) => {
    try {
        return `charge with id: ${id}`;
    } catch (error) {
        console.error(`Error fetching charge with id ${id}:`, error);
        throw error;
    }
}

const getChargeByLeaseId = async (leaseId) => {
    try {
        return `charges for lease id: ${leaseId}`;
    } catch (error) {
        console.error(`Error fetching charges for lease id ${leaseId}:`, error);
        throw error;
    }
}

const updateChargeById = async (id, charge = {}) => {
    try {
        return `charge with id ${id} updated`;
    } catch (error) {
        console.error(`Error updating charge with id ${id}:`, error);
        throw error;
    }
}

const deleteChargeById = async (id) => {
    try {
        return `charge with id ${id} deleted`;
    } catch (error) {
        console.error(`Error deleting charge with id ${id}:`, error);
        throw error;
    }
}

export default {
    createCharge,
    getAllCharges,
    getChargeById,
    getChargeByLeaseId,
    updateChargeById,
    deleteChargeById
};