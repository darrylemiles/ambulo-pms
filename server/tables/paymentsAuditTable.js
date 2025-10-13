const paymentsAuditTable = `
    CREATE TABLE IF NOT EXISTS payment_audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(255) NULL,
    action VARCHAR(50) NOT NULL,
    payload JSON NULL,
    performed_by VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP()
    ) ENGINE=InnoDB;
`;

export default paymentsAuditTable;
