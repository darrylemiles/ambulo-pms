import conn from "./../config/db.js";

const pool = await conn();

const normalizeFrequency = (f) => {
    if (!f) return "Monthly";
    const v = String(f).toLowerCase();
    if (v === "monthly") return "Monthly";
    if (v === "quarterly") return "Quarterly";
    if (v === "semi-annually" || v === "semiannually" || v === "semi_annually")
        return "Semi-annually";
    if (v === "annually" || v === "yearly") return "Annually";
    return "Monthly";
};

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
            auto_generate_until,
            auto_gen_until,
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
        const recurringEnabled =
            is_recurring === 1 ||
            is_recurring === true ||
            is_recurring === "1" ||
            is_recurring === "true";
        if (recurringEnabled) {
            const freqEnum = normalizeFrequency(frequency);
            const autoUntil = auto_generate_until || auto_gen_until || due_date;

            const insertTemplateSql = `
                INSERT INTO recurring_templates
                (lease_id, charge_type, description, amount, frequency, next_due, auto_generate_until, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            `;
            const [tmplRes] = await conn.query(insertTemplateSql, [
                lease_id,
                charge_type,
                description,
                amount,
                freqEnum,
                due_date,
                autoUntil,
            ]);
            template_id = tmplRes.insertId;

            try {
                await conn.query(
                    `UPDATE charges SET template_id = ? WHERE charge_id = ?`,
                    [template_id, charge_id]
                );
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
        const where = [];
        const values = [];

        const q = queryParams.q || queryParams.search || queryParams.term || null;
        const status = queryParams.status || null;
        const chargeType = queryParams.charge_type || queryParams.type || null;
        const dueDate = queryParams.due_date || null;
        const dueFrom = queryParams.due_date_from || null;
        const dueTo = queryParams.due_date_to || null;

        if (q) {
            const like = `%${String(q).trim()}%`;
            where.push(`(
                CONCAT(IFNULL(u.first_name,''),' ',IFNULL(u.last_name,'')) LIKE ?
                OR c.description LIKE ?
                OR p.property_name LIKE ?
            )`);
            values.push(like, like, like);
        }

        if (chargeType) {
            where.push(`LOWER(c.charge_type) = LOWER(?)`);
            values.push(chargeType);
        }

        if (dueDate) {
            where.push(`DATE(c.due_date) = ?`);
            values.push(dueDate);
        } else if (dueFrom && dueTo) {
            where.push(`DATE(c.due_date) BETWEEN ? AND ?`);
            values.push(dueFrom, dueTo);
        } else if (dueFrom) {
            where.push(`DATE(c.due_date) >= ?`);
            values.push(dueFrom);
        } else if (dueTo) {
            where.push(`DATE(c.due_date) <= ?`);
            values.push(dueTo);
        }

        if (status) {
            const s = String(status).toUpperCase();
            if (s === "WAIVED") {
                where.push(`c.status = 'Waived'`);
            } else if (s === "PAID") {
                where.push(`IFNULL(pay_sum.total_paid,0) >= c.amount`);
            } else if (s === "PARTIALLY_PAID" || s === "PARTIAL") {
                where.push(
                    `IFNULL(pay_sum.total_paid,0) > 0 AND IFNULL(pay_sum.total_paid,0) < c.amount`
                );
            } else if (s === "UNPAID") {
                where.push(
                    `IFNULL(pay_sum.total_paid,0) = 0 AND (c.status IS NULL OR c.status != 'Waived')`
                );
            } else if (s === "OVERDUE") {
                where.push(
                    `DATE(c.due_date) < CURDATE() AND IFNULL(pay_sum.total_paid,0) < c.amount AND (c.status IS NULL OR c.status != 'Waived')`
                );
            } else if (s === "DUE-SOON" || s === "DUE_SOON") {
                where.push(
                    `DATE(c.due_date) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY) AND IFNULL(pay_sum.total_paid,0) < c.amount AND (c.status IS NULL OR c.status != 'Waived')`
                );
            } else if (s === "PENDING") {
                where.push(
                    `DATE(c.due_date) > DATE_ADD(CURDATE(), INTERVAL 3 DAY) AND IFNULL(pay_sum.total_paid,0) < c.amount AND (c.status IS NULL OR c.status != 'Waived')`
                );
            } else {
                where.push(`LOWER(c.status) = ?`);
                values.push(String(status).toLowerCase());
            }
        }

        const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

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
            SELECT charge_id, IFNULL(SUM(amount), 0) AS total_paid
            FROM payments
            GROUP BY charge_id
        ) pay_sum ON pay_sum.charge_id = c.charge_id
        LEFT JOIN leases l ON c.lease_id = l.lease_id
        LEFT JOIN users u ON l.user_id = u.user_id
        LEFT JOIN properties p ON l.property_id = p.property_id
        ${whereClause}
        ORDER BY c.charge_date DESC, c.due_date DESC
        `;

        const [rows] = await pool.query(sql, values);
        return rows;
    } catch (error) {
        console.error("Error fetching all charges:", error);
        throw error;
    }
};

const getRecurringTemplateById = async (templateId) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM recurring_templates WHERE template_id = ?",
            [templateId]
        );
        return rows[0] || null;
    } catch (error) {
        console.error(
            `Error fetching recurring template with id ${templateId}:`,
            error
        );
        throw error;
    }
};

const updateRecurringTemplateById = async (templateId, tmpl = {}) => {
    try {
        if (!templateId) throw new Error("templateId is required");

        const fields = [];
        const values = [];

        const {
            frequency,
            amount,
            next_due,
            auto_generate_until,
            auto_gen_until,
            is_active,
            description,
            charge_type,
        } = tmpl || {};

        if (frequency !== undefined) {
            fields.push(`frequency = ?`);
            values.push(normalizeFrequency(frequency));
        }
        if (amount !== undefined) {
            fields.push(`amount = ?`);
            values.push(amount);
        }
        if (next_due !== undefined) {
            fields.push(`next_due = ?`);
            values.push(next_due);
        }
        const autoUntil =
            auto_generate_until !== undefined ? auto_generate_until : auto_gen_until;
        if (autoUntil !== undefined) {
            fields.push(`auto_generate_until = ?`);
            values.push(autoUntil);
        }
        if (is_active !== undefined) {
            fields.push(`is_active = ?`);
            values.push(is_active ? 1 : 0);
        }
        if (description !== undefined) {
            fields.push(`description = ?`);
            values.push(description);
        }
        if (charge_type !== undefined) {
            fields.push(`charge_type = ?`);
            values.push(charge_type);
        }

        if (fields.length === 0) return await getRecurringTemplateById(templateId);

        const sql = `UPDATE recurring_templates SET ${fields.join(
            ", "
        )} WHERE template_id = ?`;
        values.push(templateId);
        await pool.query(sql, values);
        return await getRecurringTemplateById(templateId);
    } catch (error) {
        console.error(
            `Error updating recurring template with id ${templateId}:`,
            error
        );
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
    getRecurringTemplateById,
    updateRecurringTemplateById,
};
