import conn from "./../config/db.js";

const pool = await conn();

const createCharge = async (charge = {}) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        let {
            lease_id,
            charge_type,
            description,
            amount,
            charge_date,
            due_date,
            is_recurring,
            status,
            frequency, 
        } = charge || {};

        const insertChargeSql = `
            INSERT INTO charges 
            (lease_id, charge_type, description, amount, charge_date, due_date, is_recurring, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [chargeResult] = await conn.query(insertChargeSql, [
            lease_id,
            charge_type,
            description,
            amount,
            charge_date,
            due_date,
            is_recurring,
            status,
        ]);
        const charge_id = chargeResult.insertId;

        let template_id = null;
        const recurringEnabled = is_recurring === 1 || is_recurring === true || is_recurring === "1" || is_recurring === "true";
        if (recurringEnabled) {
            
            const mapFreq = (f) => {
                if (!f) return 'Monthly';
                const v = String(f).toLowerCase();
                if (v === 'monthly') return 'Monthly';
                if (v === 'quarterly') return 'Quarterly';
                if (v === 'semi-annually' || v === 'semiannually' || v === 'semi_annually') return 'Semi-annually';
                if (v === 'annually' || v === 'yearly') return 'Annually';
                return 'Monthly';
            };
            const freqEnum = mapFreq(frequency);

            const insertTemplateSql = `
                INSERT INTO recurring_templates
                (lease_id, charge_type, description, amount, frequency, next_due, is_active)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            `;
            const [tmplRes] = await conn.query(insertTemplateSql, [
                lease_id,
                charge_type,
                description,
                amount,
                freqEnum,
                due_date, 
            ]);
            template_id = tmplRes.insertId;

            
            try {
                await conn.query(`UPDATE charges SET template_id = ? WHERE charge_id = ?`, [template_id, charge_id]);
            } catch (e) {
                
                throw e;
            }
        }

        await conn.commit();
        conn.release();
        return { charge_id, template_id, ...charge };
    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error("Error creating charge:", error);
        throw error;
    }
};

const getAllCharges = async (queryParams = {}) => {
    try {
        
        
        const sql = `
        SELECT
            c.*, 
            l.lease_id,
            CONCAT(u.first_name, ' ', u.last_name, IFNULL(CONCAT(' ', u.suffix), '')) AS tenant_name,
            p.property_name,
            IFNULL(pay_sum.total_paid, 0) AS total_paid,
            CASE
                WHEN c.status = 'Waived' THEN 'WAIVED'
                WHEN IFNULL(pay_sum.total_paid, 0) >= c.amount THEN 'PAID'
                WHEN IFNULL(pay_sum.total_paid, 0) > 0 THEN 'PARTIALLY_PAID'
                ELSE 'UNPAID'
            END AS canonical_status
        FROM charges c
        LEFT JOIN (
            SELECT charge_id, IFNULL(SUM(amount_paid), 0) AS total_paid
            FROM payments
            GROUP BY charge_id
        ) pay_sum ON pay_sum.charge_id = c.charge_id
        LEFT JOIN leases l ON c.lease_id = l.lease_id
        LEFT JOIN users u ON l.user_id = u.user_id
        LEFT JOIN properties p ON l.property_id = p.property_id
        ORDER BY c.charge_date DESC, c.due_date DESC
        `;

        const [rows] = await pool.query(sql);
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
