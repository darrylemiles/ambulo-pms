import conn from "../config/db.js";

const pool = await conn();

export async function getInvoiceByPaymentId(paymentId) {
    if (!paymentId) return null;
    
    const sql = `
        SELECT 
            inv.invoice_id,
            inv.issue_date,
            inv.status AS invoice_status,
            inv.total_amount AS invoice_total,
            inv.payment_id,
            inv.lease_id,
            inv.reference_number,
            inv.tenant_name AS invoice_tenant_name,
            inv.property_name AS invoice_property_name,

            pay.amount AS payment_amount,
            pay.payment_method,
            pay.created_at AS payment_date,
            pay.notes AS payment_notes,

            c.charge_id,
            c.description AS charge_description,
            c.charge_type,
            c.amount AS charge_amount,
            (
                (c.amount + CASE
                    WHEN DATEDIFF(CURDATE(), DATE(c.due_date)) > IFNULL(l.grace_period_days, 0)
                        THEN ROUND(c.amount * IFNULL(l.late_fee_percentage, 0) / 100, 2)
                    ELSE 0
                END) - c.amount
            ) AS late_fee_amount,
            c.amount AS original_amount,
            c.due_date,

            l.lease_id AS lease_id_real,
            l.user_id AS tenant_user_id,
            l.property_id,

            u.first_name, u.last_name, u.suffix,

            p.property_name,
            p.address_id,

            a.building_name, a.street, a.barangay, a.city, a.province, a.postal_code, a.country
        FROM invoices inv
        LEFT JOIN payments pay ON inv.payment_id = pay.payment_id
        LEFT JOIN charges c ON pay.charge_id = c.charge_id
        LEFT JOIN leases l ON c.lease_id = l.lease_id
        LEFT JOIN users u ON l.user_id = u.user_id
        LEFT JOIN properties p ON l.property_id = p.property_id
        LEFT JOIN addresses a ON p.address_id = a.address_id
        WHERE inv.payment_id = ?
        LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [paymentId]);
    if (!rows || !rows.length) return null;
    const r = rows[0];

    const tenantName = r.invoice_tenant_name || [r.first_name, r.last_name, r.suffix].filter(Boolean).join(" ");

    const addressParts = [
        r.building_name,
        r.street,
        r.barangay,
        r.city,
        r.province,
        r.postal_code,
        r.country,
    ].filter(Boolean);

    
    let items = [];
    if (r.invoice_id) {
        try {
            const [itemRows] = await pool.execute(
                `SELECT item_id, charge_id, description, item_type, amount FROM invoice_items WHERE invoice_id = ? ORDER BY item_id`,
                [r.invoice_id]
            );
            items = (itemRows || []).map((it) => ({
                id: it.item_id,
                chargeId: it.charge_id,
                description: it.description,
                type: it.item_type,
                amount: Number(it.amount || 0),
            }));
        } catch {}
    }

    return {
        invoice: {
            id: r.invoice_id,
            issueDate: r.issue_date,
            status: r.invoice_status,
            total: Number(r.invoice_total ?? r.payment_amount ?? 0),
        },
        payment: {
            id: r.payment_id,
            method: r.payment_method,
            date: r.payment_date,
            reference: r.reference_number || r.payment_notes,
        },
        charge: {
            id: r.charge_id,
            description: r.charge_description,
            type: r.charge_type,
            amount: Number(r.charge_amount || 0),
            lateFee: Number(r.late_fee_amount || 0),
            originalAmount: r.original_amount !== null && r.original_amount !== undefined
                ? Number(r.original_amount)
                : null,
            dueDate: r.due_date,
        },
        items,
        tenant: {
            id: r.tenant_user_id,
            name: tenantName,
        },
        lease: {
            id: r.lease_id,
        },
        property: {
            id: r.property_id,
            name: r.invoice_property_name || r.property_name,
            address: addressParts.join(", "),
        },
    };
}
