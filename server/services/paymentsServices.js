import conn from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const pool = await conn();

const computeAndSetChargeStatus = async (connHandle, chargeId, performedBy = null) => {
    if (!chargeId) return;

    const [sumRows] = await connHandle.execute(
        `SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE charge_id = ? AND status != 'Pending'`,
        [chargeId]
    );
    const totalPaid = sumRows && sumRows.length ? Number(sumRows[0].total_paid) : 0;

    const [chargeRows] = await connHandle.execute(
        `SELECT amount FROM charges WHERE charge_id = ? LIMIT 1`,
        [chargeId]
    );
    if (!chargeRows || !chargeRows.length) return; 

    const chargeAmount = Number(chargeRows[0].amount || 0);
    let newStatus = 'Unpaid';
    if (totalPaid <= 0) {
        newStatus = 'Unpaid';
    } else if (chargeAmount > 0 && totalPaid >= chargeAmount) {
        newStatus = 'Paid';
    } else {
        newStatus = 'Partially Paid';
    }

    
    const [prevRows] = await connHandle.execute(
        `SELECT status, IFNULL(total_paid, 0) AS total_paid FROM charges WHERE charge_id = ? LIMIT 1`,
        [chargeId]
    );
    const prevStatus = prevRows && prevRows.length ? prevRows[0].status : null;
    const prevTotalPaid = prevRows && prevRows.length ? Number(prevRows[0].total_paid || 0) : 0;

    
    await connHandle.execute(`UPDATE charges SET status = ?, total_paid = ? WHERE charge_id = ?`, [newStatus, totalPaid, chargeId]);

    
    if (prevStatus !== newStatus || prevTotalPaid !== totalPaid) {
        try {
            await connHandle.execute(
                `INSERT INTO charge_status_audit (charge_id, old_status, new_status, old_total_paid, new_total_paid, performed_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [chargeId, prevStatus, newStatus, prevTotalPaid, totalPaid, performedBy || null, new Date()]
            );
        } catch (err) {
            
            console.error('Failed to write charge_status_audit:', err);
        }
    }
};

const createPayment = async (paymentData = {}, performedBy = null) => {
    const { chargeId, paymentDate, amountPaid, paymentMethod, notes, proofs, user_id } =
        paymentData || {};

    const paymentId = uuidv4();
    const createdAt = new Date();

    const connHandle = await pool.getConnection();
    try {
        await connHandle.beginTransaction();

        // Map incoming fields to payments table schema
        const status = (paymentData.status && String(paymentData.status)) || 'Pending';
        const userId = user_id || performedBy || null;
        const confirmedBy = status === 'Confirmed' ? (performedBy || null) : null;
        const confirmedAt = status === 'Confirmed' ? createdAt : null;

        const insertPayment = `
            INSERT INTO payments (payment_id, charge_id, user_id, amount, payment_method, status, notes, confirmed_by, confirmed_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connHandle.execute(insertPayment, [
            paymentId,
            chargeId || null,
            userId,
            amountPaid || 0,
            paymentMethod || null,
            status,
            notes || null,
            confirmedBy,
            confirmedAt,
            createdAt,
        ]);

        if (proofs && Array.isArray(proofs) && proofs.length) {
            const insertProof = `
                INSERT INTO payment_proof (payment_id, proof_url, uploaded_at)
                VALUES (?, ?, ?)
            `;
            for (const url of proofs) {
                await connHandle.execute(insertProof, [
                    paymentId,
                    String(url),
                    createdAt,
                ]);
            }
        }

        
        try {
                await connHandle.execute(`INSERT INTO payment_audit (payment_id, action, payload, performed_by, created_at) VALUES (?, ?, ?, ?, ?)`, [
                paymentId,
                'create',
                JSON.stringify({ chargeId, amount: amountPaid, paymentMethod, notes, proofs, status }),
                performedBy || null,
                createdAt,
            ]);
        } catch (err) {
            console.error('Failed to write payment_audit (create):', err);
        }

    await computeAndSetChargeStatus(connHandle, chargeId);
    await connHandle.commit();
        return {
            message: "Payment created successfully",
            payment_id: paymentId,
        };
    } catch (error) {
        await connHandle.rollback();
        console.error("Error in createPayment:", error);
        throw error;
    } finally {
        connHandle.release();
    }
};

const getAllPayments = async () => {
    try {
        const query = `
            SELECT DISTINCT
                p.property_name,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                c.status AS charge_status,
                COALESCE(pay.amount_paid, 0.00) AS amount_paid,
                pay.payment_id
            FROM properties p
            INNER JOIN leases l ON p.property_id = l.property_id
            INNER JOIN users u ON l.user_id = u.user_id
            INNER JOIN charges c ON l.lease_id = c.lease_id
            LEFT JOIN payments pay ON c.charge_id = pay.charge_id
            ORDER BY p.property_name, full_name
        `;
        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        console.error("Error in getAllPayments:", error);
        throw error;
    }
};

const getPaymentById = async (id) => {
    try {
        const query = `
            SELECT 
                pay.payment_id,
                pay.charge_id,
                DATE_FORMAT(pay.payment_date, '%Y-%m-%d') AS payment_date,
                pay.amount_paid,
                pay.payment_method,
                pay.notes,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                p.property_name
            FROM payments pay
            LEFT JOIN charges c ON pay.charge_id = c.charge_id
            LEFT JOIN leases l ON c.lease_id = l.lease_id
            LEFT JOIN properties p ON l.property_id = p.property_id
            LEFT JOIN users u ON l.user_id = u.user_id
            WHERE pay.payment_id = ?
            LIMIT 1
        `;
        const [rows] = await pool.execute(query, [id]);
        const payment = rows && rows.length ? rows[0] : null;

        if (payment) {
            const [proofRows] = await pool.execute(
                `SELECT proof_id, proof_url FROM payment_proof WHERE payment_id = ?`,
                [id]
            );
            payment.proofs = proofRows || [];
        }

        return payment;
    } catch (error) {
        console.error("Error in getPaymentById:", error);
        throw error;
    }
};

const updatePaymentById = async (id, payment = {}, performedBy = null) => {
    const { chargeId, paymentDate, amountPaid, paymentMethod, notes, proofs, status } =
        payment || {};
    const connHandle = await pool.getConnection();
    try {
        await connHandle.beginTransaction();

        // Get current status to check if it's changing to Confirmed
        const [currentRows] = await connHandle.execute(
            `SELECT status FROM payments WHERE payment_id = ? LIMIT 1`,
            [id]
        );
        const currentStatus = currentRows && currentRows.length ? currentRows[0].status : null;

        const newStatus = status || currentStatus;
        const confirmedBy = (newStatus === 'Confirmed' && currentStatus !== 'Confirmed') ? performedBy : null;
        const confirmedAt = (newStatus === 'Confirmed' && currentStatus !== 'Confirmed') ? new Date() : null;

        const updateQuery = `
            UPDATE payments
            SET charge_id = ?, payment_date = ?, amount_paid = ?, payment_method = ?, notes = ?, status = ?, confirmed_by = COALESCE(confirmed_by, ?), confirmed_at = COALESCE(confirmed_at, ?)
            WHERE payment_id = ?
        `;
        await connHandle.execute(updateQuery, [
            chargeId || null,
            paymentDate || null,
            amountPaid || 0,
            paymentMethod || null,
            notes || null,
            newStatus,
            confirmedBy,
            confirmedAt,
            id,
        ]);

        if (proofs && Array.isArray(proofs)) {
            await connHandle.execute(
                `DELETE FROM payment_proof WHERE payment_id = ?`,
                [id]
            );
            const insertProof = `INSERT INTO payment_proof (payment_id, proof_url, uploaded_at) VALUES (?, ?, ?)`;
            const now = new Date();
            for (const url of proofs) {
                await connHandle.execute(insertProof, [id, String(url), now]);
            }
        }

            
            try {
                await connHandle.execute(`INSERT INTO payment_audit (payment_id, action, payload, performed_by, created_at) VALUES (?, ?, ?, ?, ?)`, [
                    id,
                    'update',
                    JSON.stringify({ chargeId, paymentDate, amountPaid, paymentMethod, notes, proofs, status: newStatus }),
                    performedBy || null,
                    new Date(),
                ]);
            } catch (err) {
                console.error('Failed to write payment_audit (update):', err);
            }

            await computeAndSetChargeStatus(connHandle, chargeId, performedBy);
            await connHandle.commit();
            return { message: "Payment updated successfully" };
    } catch (error) {
        await connHandle.rollback();
        console.error("Error in updatePaymentById:", error);
        throw error;
    } finally {
        connHandle.release();
    }
};

const deletePaymentById = async (id, performedBy = null) => {
    const connHandle = await pool.getConnection();
    try {
        await connHandle.beginTransaction();

        
        const [paymentRows] = await connHandle.execute(
            `SELECT charge_id FROM payments WHERE payment_id = ? LIMIT 1`,
            [id]
        );
        const chargeId = paymentRows && paymentRows.length ? paymentRows[0].charge_id : null;

        await connHandle.execute(`DELETE FROM payment_proof WHERE payment_id = ?`, [id]);
        await connHandle.execute(`DELETE FROM payments WHERE payment_id = ?`, [id]);

    
    await computeAndSetChargeStatus(connHandle, chargeId, performedBy);

        
        try {
            await connHandle.execute(`INSERT INTO payment_audit (payment_id, action, payload, performed_by, created_at) VALUES (?, ?, ?, ?, ?)`, [
                id,
                'delete',
                JSON.stringify({ deleted_payment_id: id, chargeId }),
                performedBy || null,
                new Date(),
            ]);
        } catch (err) {
            console.error('Failed to write payment_audit (delete):', err);
        }

        await connHandle.commit();
        return { message: "Payment deleted successfully" };
    } catch (error) {
        await connHandle.rollback();
        console.error("Error in deletePaymentById:", error);
        throw error;
    } finally {
        connHandle.release();
    }
};

export default {
    createPayment,
    getAllPayments,
    updatePaymentById,
    getPaymentById,
    deletePaymentById,
    async searchPaymentsByChargeIds({ chargeIds = [], status = null, userId = null } = {}) {
        if (!Array.isArray(chargeIds) || !chargeIds.length) return [];
        const placeholders = chargeIds.map(() => '?').join(',');
        const params = [...chargeIds];
        let sql = `SELECT payment_id, charge_id, amount as amount_paid, status, payment_method, created_at
                   FROM payments
                   WHERE charge_id IN (${placeholders})`;
        if (status) {
            sql += ` AND status = ?`;
            params.push(status);
        }
        if (userId) {
            sql += ` AND user_id = ?`;
            params.push(userId);
        }
        sql += ` ORDER BY created_at DESC`;
        const [rows] = await pool.execute(sql, params);
        return rows || [];
    },
};
