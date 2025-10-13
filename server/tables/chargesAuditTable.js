const chargesAuditTable = `
CREATE TABLE IF NOT EXISTS charge_status_audit (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    charge_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    old_total_paid DECIMAL(12,2) DEFAULT NULL,
    new_total_paid DECIMAL(12,2) DEFAULT NULL,
    performed_by VARCHAR(255) DEFAULT NULL,
    reason TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;

export default chargesAuditTable;
