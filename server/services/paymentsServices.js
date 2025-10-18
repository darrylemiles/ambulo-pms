import conn from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const pool = await conn();

const computeAndSetChargeStatus = async (
    connHandle,
    chargeId,
    performedBy = null
) => {
    if (!chargeId) return;

    const [sumRows] = await connHandle.execute(
        `SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE charge_id = ? AND (status = 'Confirmed' OR status = 'Completed')`,
        [chargeId]
    );
    const totalPaid = sumRows && sumRows.length ? Number(sumRows[0].total_paid) : 0;

    const [chargeRows] = await connHandle.execute(
        `SELECT amount FROM charges WHERE charge_id = ? LIMIT 1`,
        [chargeId]
    );
    if (!chargeRows || !chargeRows.length) return;

    const chargeAmount = Number(chargeRows[0].amount || 0);
    let newStatus = "Unpaid";
    if (totalPaid <= 0) newStatus = "Unpaid";
    else if (chargeAmount > 0 && totalPaid >= chargeAmount) newStatus = "Paid";
    else newStatus = "Partially Paid";

    const [prevRows] = await connHandle.execute(
        `SELECT status, IFNULL(total_paid, 0) AS total_paid FROM charges WHERE charge_id = ? LIMIT 1`,
        [chargeId]
    );
    const prevStatus = prevRows && prevRows.length ? prevRows[0].status : null;
    const prevTotalPaid = prevRows && prevRows.length ? Number(prevRows[0].total_paid || 0) : 0;

    await connHandle.execute(
        `UPDATE charges SET status = ?, total_paid = ? WHERE charge_id = ?`,
        [newStatus, totalPaid, chargeId]
    );

    if (prevStatus !== newStatus || prevTotalPaid !== totalPaid) {
        try {
            await connHandle.execute(
                `INSERT INTO charge_status_audit (charge_id, old_status, new_status, old_total_paid, new_total_paid, performed_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    chargeId,
                    prevStatus,
                    newStatus,
                    prevTotalPaid,
                    totalPaid,
                    performedBy || null,
                    new Date(),
                ]
            );
        } catch (err) {
            console.error("Failed to write charge_status_audit:", err);
        }
    }
};

const createPayment = async (paymentData = {}, performedBy = null) => {
    const {
        chargeId,
        paymentDate,
        amountPaid,
        paymentMethod,
        notes,
        proofs,
        user_id,
    } = paymentData || {};

    const paymentId = uuidv4();
    const createdAt = new Date();

    const connHandle = await pool.getConnection();
    try {
        await connHandle.beginTransaction();

        const rawStatus = (paymentData.status && String(paymentData.status)) || "Pending";
        const status = rawStatus && rawStatus.toLowerCase() === "confirmed" ? "Confirmed" : rawStatus;
        const userId = user_id || performedBy || null;
        const confirmedBy = status === "Confirmed" ? user_id || null : null;
        const confirmedAt = status === "Confirmed" ? createdAt : null;

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
            const insertProof = `INSERT INTO payment_proof (payment_id, proof_url, uploaded_at) VALUES (?, ?, ?)`;
            for (const url of proofs) {
                await connHandle.execute(insertProof, [paymentId, String(url), createdAt]);
            }
        }

        try {
            await connHandle.execute(
                `INSERT INTO payment_audit (payment_id, action, payload, performed_by, created_at) VALUES (?, ?, ?, ?, ?)`,
                [
                    paymentId,
                    "create",
                    JSON.stringify({ chargeId, amount: amountPaid, paymentMethod, notes, proofs, status, confirmed_by: confirmedBy, confirmed_at: confirmedAt }),
                    performedBy || null,
                    createdAt,
                ]
            );
        } catch (err) {
            console.error("Failed to write payment_audit (create):", err);
        }

        await computeAndSetChargeStatus(connHandle, chargeId, performedBy);
        await connHandle.commit();
        return { message: "Payment created successfully", payment_id: paymentId };
    } catch (error) {
        await connHandle.rollback();
        console.error("Error in createPayment:", error);
        throw error;
    } finally {
        connHandle.release();
    }
};

const getAllPayments = async (filters = {}) => {
    try {
        const { status, payment_method, payment_type, month, q } = filters || {};
        const pageNum = Math.max(1, parseInt(filters.page, 10) || 1);
        const pageLimit = Math.max(1, Math.min(100, parseInt(filters.limit, 10) || 10));
        const offset = (pageNum - 1) * pageLimit;

        const baseFrom = `
            FROM payments pay
            LEFT JOIN charges c ON pay.charge_id = c.charge_id
            LEFT JOIN leases l ON c.lease_id = l.lease_id
            LEFT JOIN users u ON l.user_id = u.user_id
            LEFT JOIN users cb ON pay.confirmed_by = cb.user_id
            LEFT JOIN properties p ON l.property_id = p.property_id
        `;
    const whereClauses = [];
    const params = [];

        if (status) {
            const s = String(status).toLowerCase();
            if (s === "confirmed") {
                whereClauses.push("(pay.status = 'Confirmed' OR pay.status = 'Completed')");
            } else {
                whereClauses.push("pay.status = ?");
                params.push(status);
            }
        }
        
        if (payment_method) {
            whereClauses.push(`LOWER(pay.payment_method) = LOWER(?)`);
            params.push(payment_method);
        }

        
        if (payment_type) {
            whereClauses.push(`LOWER(c.charge_type) = LOWER(?)`);
            params.push(payment_type);
        }

        
        if (month) {
            whereClauses.push(`DATE_FORMAT(pay.created_at, '%Y-%m') = ?`);
            params.push(month);
        }

        
        if (q) {
            whereClauses.push(`(
                CONCAT(u.first_name, ' ', u.last_name, ' ', IFNULL(u.suffix, '')) LIKE ? OR
                p.property_name LIKE ? OR
                c.description LIKE ? OR
                pay.payment_id LIKE ?
            )`);
            const like = `%${q}%`;
            params.push(like, like, like, like);
        }

        const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

        const countSql = `SELECT COUNT(*) AS cnt ${baseFrom} ${whereSql}`;
        const [countRows] = await pool.execute(countSql, params);
        const total = countRows && countRows.length ? Number(countRows[0].cnt || 0) : 0;

        const dataSql = `
            SELECT 
                pay.payment_id,
                pay.charge_id,
                pay.status,
                pay.payment_method,
                pay.notes,
                pay.amount AS amount_paid,
                pay.created_at,
                pay.confirmed_by AS processed_by,
                pay.confirmed_at AS processed_at,
                CONCAT(cb.first_name, ' ', cb.last_name) AS processed_by_name,
                CONCAT(u.first_name, ' ', u.last_name, ' ', u.suffix) AS tenant_name,
                c.description AS charge_description,
                c.charge_type AS charge_type,
                c.due_date AS due_date,
                p.property_name
            ${baseFrom}
            ${whereSql}
            ORDER BY pay.created_at DESC
            LIMIT ${pageLimit} OFFSET ${offset}
        `;
        const [rows] = await pool.execute(dataSql, params);

        (rows || []).forEach((r) => { if (r.status === "Completed") r.status = "Confirmed"; });

        if (!rows || !rows.length) {
            return { rows: rows || [], total, page: pageNum, limit: pageLimit, totalPages: Math.ceil(total / pageLimit) };
        }
        const ids = rows.map((r) => r.payment_id);
        const placeholders = ids.map(() => "?").join(",");
        const [proofRows] = await pool.execute(
            `SELECT payment_id, proof_url FROM payment_proof WHERE payment_id IN (${placeholders}) ORDER BY uploaded_at`,
            ids
        );
        const proofsMap = new Map();
        (proofRows || []).forEach((pr) => {
            if (!proofsMap.has(pr.payment_id)) proofsMap.set(pr.payment_id, []);
            proofsMap.get(pr.payment_id).push({ proof_url: pr.proof_url });
        });
        rows.forEach((r) => { r.proofs = proofsMap.get(r.payment_id) || []; });

        return { rows, total, page: pageNum, limit: pageLimit, totalPages: Math.ceil(total / pageLimit) };
    } catch (error) {
        console.error("Error in getAllPayments:", error);
        throw error;
    }
};

const getPaymentsByUserId = async (userId, { page = 1, limit = 10 } = {}) => {
    if (!userId) return { rows: [], total: 0, page: 1, limit, totalPages: 0 };
    try {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const offset = (pageNum - 1) * pageLimit;

        const countQuery = `
            SELECT COUNT(*) AS cnt
            FROM payments pay
            LEFT JOIN charges c ON pay.charge_id = c.charge_id
            LEFT JOIN leases l ON c.lease_id = l.lease_id
            WHERE (pay.user_id = ? OR l.user_id = ?)
        `;
        const [countRows] = await pool.execute(countQuery, [userId, userId]);
        const total = countRows && countRows.length ? Number(countRows[0].cnt || 0) : 0;

        const query = `
            SELECT 
                pay.payment_id,
                pay.charge_id,
                pay.status,
                pay.payment_method,
                pay.notes,
                pay.amount AS amount_paid,
                pay.created_at,
                pay.confirmed_by AS processed_by,
                pay.confirmed_at AS processed_at,
                CONCAT(cb.first_name, ' ', cb.last_name) AS processed_by_name,
                CONCAT(u.first_name, ' ', u.last_name) AS tenant_name,
                c.description AS charge_description,
                c.charge_type AS charge_type,
                c.due_date AS due_date,
                p.property_name
            FROM payments pay
            LEFT JOIN charges c ON pay.charge_id = c.charge_id
            LEFT JOIN leases l ON c.lease_id = l.lease_id
            LEFT JOIN users u ON l.user_id = u.user_id
            LEFT JOIN users cb ON pay.confirmed_by = cb.user_id
            LEFT JOIN properties p ON l.property_id = p.property_id
            WHERE (pay.user_id = ? OR l.user_id = ?)
            ORDER BY pay.created_at DESC
            LIMIT ${pageLimit} OFFSET ${offset}
        `;
        const [rows] = await pool.execute(query, [userId, userId]);

        (rows || []).forEach((r) => { if (r.status === "Completed") r.status = "Confirmed"; });

        if (!rows || !rows.length) {
            return { rows: rows || [], total, page: pageNum, limit: pageLimit, totalPages: Math.ceil(total / pageLimit) };
        }
        const ids = rows.map((r) => r.payment_id);
        const placeholders = ids.map(() => "?").join(",");
        const [proofRows] = await pool.execute(
            `SELECT payment_id, proof_url FROM payment_proof WHERE payment_id IN (${placeholders}) ORDER BY uploaded_at`,
            ids
        );
        const proofsMap = new Map();
        (proofRows || []).forEach((pr) => {
            if (!proofsMap.has(pr.payment_id)) proofsMap.set(pr.payment_id, []);
            proofsMap.get(pr.payment_id).push({ proof_url: pr.proof_url });
        });
        rows.forEach((r) => { r.proofs = proofsMap.get(r.payment_id) || []; });

        return { rows, total, page: pageNum, limit: pageLimit, totalPages: Math.ceil(total / pageLimit) };
    } catch (error) {
        console.error("Error in getPaymentsByUserId:", error);
        throw error;
    }
};

const getPaymentById = async (id) => {
    try {
        const query = `
            SELECT 
                pay.payment_id,
                pay.charge_id,
                DATE_FORMAT(pay.created_at, '%Y-%m-%d') AS payment_date,
                pay.amount AS amount_paid,
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
    const {
        chargeId,
        paymentDate,
        amountPaid,
        paymentMethod,
        notes,
        proofs,
        status,
    } = payment || {};
    const connHandle = await pool.getConnection();
    try {
        await connHandle.beginTransaction();

        const [currentRows] = await connHandle.execute(
            `SELECT status FROM payments WHERE payment_id = ? LIMIT 1`,
            [id]
        );
        const currentStatus =
            currentRows && currentRows.length ? currentRows[0].status : null;

        const newStatus = status || currentStatus;

        function mapToDbStatus(intent) {
            if (!intent && currentStatus) return currentStatus;
            const s = String(intent || "")
                .trim()
                .toLowerCase();
            if (!s) return currentStatus || "Pending";
            
            if (s.includes("confirm") || s.includes("complete") || s === "confirmed" || s === "completed") return "Confirmed";
            if (s.includes("reject") || s === "rejected") return "Rejected";
            if (s.includes("pending") || s === "pending") return "Pending";

            return currentStatus || "Pending";
        }

        const dbStatus = mapToDbStatus(newStatus);

    const newStatusNorm = String(newStatus || "").toLowerCase();
    const callerIntendsConfirm = newStatusNorm.includes("confirm") || newStatusNorm.includes("complete") || newStatusNorm === "confirmed" || newStatusNorm === "completed";
    const callerIntendsReject = newStatusNorm.includes("reject") || newStatusNorm === "rejected";
    const currentStatusNorm = String(currentStatus || "").toLowerCase();
    const alreadyConfirmed = currentStatusNorm === "confirmed" || currentStatusNorm === "completed";
    const alreadyRejected = currentStatusNorm === "rejected";

    
    
    const processedByUserId = ( (callerIntendsConfirm && !alreadyConfirmed) || (callerIntendsReject && !alreadyRejected) ) ? payment.user_id || null : null;
    const processedAt = ( (callerIntendsConfirm && !alreadyConfirmed) || (callerIntendsReject && !alreadyRejected) ) ? new Date() : null;

        
        const [existingPaymentRows] = await connHandle.execute(
            `SELECT payment_id, charge_id, amount, status, confirmed_by, confirmed_at, notes, payment_method FROM payments WHERE payment_id = ? LIMIT 1`,
            [id]
        );
        const existingPayment = existingPaymentRows && existingPaymentRows.length ? existingPaymentRows[0] : null;

        const updateQuery = `
            UPDATE payments
            SET
                charge_id = COALESCE(?, charge_id),
                created_at = COALESCE(?, created_at),
                amount = COALESCE(?, amount),
                payment_method = COALESCE(?, payment_method),
                notes = COALESCE(?, notes),
                status = ?,
                confirmed_by = COALESCE(confirmed_by, ?),
                confirmed_at = COALESCE(confirmed_at, ?)
            WHERE payment_id = ?
        `;

        await connHandle.execute(updateQuery, [
            chargeId || null,
            paymentDate || null,
            typeof amountPaid !== "undefined" && amountPaid !== null
                ? amountPaid
                : null,
            paymentMethod || null,
            notes || null,
            dbStatus,
            processedByUserId,
            processedAt,
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
            
            const payload = {
                old: existingPayment || null,
                changes: {
                    chargeId: chargeId || (existingPayment && existingPayment.charge_id) || null,
                    paymentDate: paymentDate || null,
                    amountPaid: typeof amountPaid !== "undefined" && amountPaid !== null ? amountPaid : (existingPayment && existingPayment.amount) || null,
                    paymentMethod: paymentMethod || (existingPayment && existingPayment.payment_method) || null,
                    notes: notes || (existingPayment && existingPayment.notes) || null,
                    status: newStatus,
                },
            };

            await connHandle.execute(
                `INSERT INTO payment_audit (payment_id, action, payload, performed_by, created_at) VALUES (?, ?, ?, ?, ?)`,
                [
                    id,
                    "update",
                    JSON.stringify(payload),
                    performedBy || null,
                    new Date(),
                ]
            );
        } catch (err) {
            console.error("Failed to write payment_audit (update):", err);
        }

    if (callerIntendsConfirm && currentStatus !== "Confirmed" && chargeId) {
            let amtToApply = amountPaid;
            if (amtToApply === undefined || amtToApply === null) {
                const [amtRows] = await connHandle.execute(
                    `SELECT amount FROM payments WHERE payment_id = ? LIMIT 1`,
                    [id]
                );
                amtToApply =
                    amtRows && amtRows.length ? Number(amtRows[0].amount || 0) : 0;
            }

            const [cRows] = await connHandle.execute(
                `SELECT amount, total_paid, status FROM charges WHERE charge_id = ? LIMIT 1`,
                [chargeId]
            );
            if (cRows && cRows.length) {
                const currAmount = Number(cRows[0].amount || 0);
                const currPaid = Number(cRows[0].total_paid || 0);
                const newPaid = currPaid + Number(amtToApply || 0);
                let newChargeStatus = "Unpaid";
                if (newPaid <= 0) newChargeStatus = "Unpaid";
                else if (newPaid >= currAmount) newChargeStatus = "Paid";
                else newChargeStatus = "Partially Paid";

                await connHandle.execute(
                    `UPDATE charges SET total_paid = ?, status = ? WHERE charge_id = ?`,
                    [newPaid, newChargeStatus, chargeId]
                );

                try {
                    await connHandle.execute(
                        `INSERT INTO charge_status_audit (charge_id, old_status, new_status, old_total_paid, new_total_paid, performed_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            chargeId,
                            cRows[0].status || null,
                            newChargeStatus,
                            currPaid,
                            newPaid,
                            processedByUserId || performedBy || null,
                            new Date(),
                        ]
                    );
                } catch (e) {
                    console.error("Failed to write charge_status_audit on confirm:", e);
                }
            }
        }

        
        await computeAndSetChargeStatus(
            connHandle,
            chargeId,
            processedByUserId || performedBy
        );
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
            `SELECT * FROM payments WHERE payment_id = ? LIMIT 1`,
            [id]
        );
        const existingPayment = paymentRows && paymentRows.length ? paymentRows[0] : null;
        const chargeId = existingPayment ? existingPayment.charge_id : null;

        await connHandle.execute(`DELETE FROM payment_proof WHERE payment_id = ?`, [
            id,
        ]);
        await connHandle.execute(`DELETE FROM payments WHERE payment_id = ?`, [id]);

        await computeAndSetChargeStatus(connHandle, chargeId, performedBy);

        try {
            await connHandle.execute(
                `INSERT INTO payment_audit (payment_id, action, payload, performed_by, created_at) VALUES (?, ?, ?, ?, ?)`,
                [
                    id,
                    "delete",
                    JSON.stringify({ old: existingPayment || null }),
                    performedBy || null,
                    new Date(),
                ]
            );
        } catch (err) {
            console.error("Failed to write payment_audit (delete):", err);
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
    getPaymentsByUserId,
    updatePaymentById,
    getPaymentById,
    deletePaymentById,
    async searchPaymentsByChargeIds({
        chargeIds = [],
        status = null,
        userId = null,
    } = {}) {
        if (!Array.isArray(chargeIds) || !chargeIds.length) return [];
        const placeholders = chargeIds.map(() => "?").join(",");
        const params = [...chargeIds];
        let sql = `SELECT payment_id, charge_id, amount as amount_paid, status, payment_method, created_at
                   FROM payments
                   WHERE charge_id IN (${placeholders})`;
        if (status) {
            
            if (String(status).toLowerCase() === 'confirmed') {
                sql += ` AND status = ?`;
                params.push('Confirmed');
            } else {
                sql += ` AND status = ?`;
                params.push(status);
            }
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
