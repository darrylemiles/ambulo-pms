import conn from "../config/db.js";

const pool = await conn();

/*const createPayment = async (payment ={}) => {
    try {
        const { chargeId, paymentDate, amountPaid, paymentMethod, notes } = paymentData;
        const query = `
            INSERT INTO payments (charge_id, payment_date, amount_paid, payment_method, notes)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [chargeId, paymentDate, amountPaid, paymentMethod, notes]);
        
       
        return result.insertId;
    } catch (error) {
        console.error("Error in createPayment:", error);
        throw error;
    }
};
*/
const getAllPayments = async () => {
    try {

       const query = `
    SELECT DISTINCT
        p.property_name,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        c.status AS charge_status,
        COALESCE(pay.amount_paid, 0.00) AS amount_paid
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
            SELECT DISTINCT
                p.property_name,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                c.status AS charge_status,
                COALESCE(pay.amount_paid, 0.00) AS amount_paid,
                pay.payment_id,
                pay.charge_id,
                DATE_FORMAT(pay.payment_date, '%Y-%m-%d') AS payment_date,
                pay.payment_method,
                pay.notes
            FROM properties p
            INNER JOIN leases l ON p.property_id = l.property_id
            INNER JOIN users u ON l.user_id = u.user_id
            INNER JOIN charges c ON l.lease_id = c.lease_id
            LEFT JOIN payments pay ON c.charge_id = pay.charge_id
            WHERE pay.payment_id = ?
            ORDER BY p.property_name, full_name
        `;
        
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    } catch (error) {
        console.error("Error in getPaymentById:", error);
        throw error;
    }
};

/*
const getPaymentById = async (id) => {
    try {
        const query = `SELECT * FROM payments WHERE payment_id = ?`;
        const [rows] = await pool.execute(query, [id]);

        //return "working successfully";
        return rows[0];
    } catch (error) {
        console.error("Error in getPaymentById:", error);
        throw error;
    }
};
*/
const updatePayment = async (id, payment = {}) => {
    try {
        // Implement the logic to update a payment record by ID in the database
        const { chargeId, paymentDate, amountPaid, paymentMethod, notes } = payment;
        const query = `
            UPDATE payments
            SET charge_id = ?, payment_date = ?, amount_paid = ?, payment_method = ?, notes = ?
            WHERE payment_id = ?
        `;
        await pool.execute(query, [chargeId, paymentDate, amountPaid, paymentMethod, notes, id]);

        return "working successfully";
    } catch (error) {
        console.error("Error in updatePayment:", error);
        throw error;
    }
};


export default {
    //createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
};
