import conn from "./../config/db.js";

const pool = await conn();

const createCharge = async (charge = {}) => {
    try {
        let {
            lease_id,
            charge_type,
            description,
            amount,
            charge_date,
            due_date,
            is_recurring,
            status,
        } = charge || {}; 

        const query = `
        INSERT INTO charges 
        (lease_id, charge_type, description, amount, charge_date, due_date, is_recurring, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
            lease_id,
            charge_type,
            description,
            amount,
            charge_date,
            due_date,
            is_recurring,
            status,
        ]);
        return { charge_id: result.insertId, ...charge };
    } catch (error) {
        console.error("Error creating charge:", error);
        throw error;
    }
};

const getAllCharges = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM charges");
        return rows;
    } catch (error) {
        console.error("Error fetching all charges:", error);
        throw error;
    }
};

const getChargeById = async (id) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM charges WHERE charge_id = ?",
            [id]
        );
        return rows[0] || null;
    } catch (error) {
        console.error(`Error fetching charge with id ${id}:`, error);
        throw error;
    }
};

const getChargeByUserId = async (userId) => {
    try {
        const query = `
        SELECT c.* FROM charges c
        JOIN leases l ON c.lease_id = l.lease_id
        WHERE l.user_id = ?
        `;

        const [rows] = await pool.query(query, [userId]);
        return rows;
    } catch (error) {
        console.error(`Error fetching charges for user id ${userId}:`, error);
        throw error;
    }
};

const getChargeByLeaseId = async (leaseId) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM charges WHERE lease_id = ?",
            [leaseId]
        );
        return rows;
    } catch (error) {
        console.error(`Error fetching charges for lease id ${leaseId}:`, error);
        throw error;
    }
};

const updateChargeById = async (id, charge = {}) => {
    try {
        const fields = [];
        const values = [];
        Object.entries(charge).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        if (fields.length === 0) return null;
        const query = `UPDATE charges SET ${fields.join(", ")} WHERE charge_id = ?`;
        values.push(id);
        await pool.query(query, values);
        return await getChargeById(id);
    } catch (error) {
        console.error(`Error updating charge with id ${id}:`, error);
        throw error;
    }
};

const deleteChargeById = async (id) => {
    try {
        await pool.query("DELETE FROM charges WHERE charge_id = ?", [id]);
        return { deleted: true, charge_id: id };
    } catch (error) {
        console.error(`Error deleting charge with id ${id}:`, error);
        throw error;
    }
};

export default {
    createCharge,
    getAllCharges,
    getChargeById,
    getChargeByUserId,
    getChargeByLeaseId,
    updateChargeById,
    deleteChargeById,
};
