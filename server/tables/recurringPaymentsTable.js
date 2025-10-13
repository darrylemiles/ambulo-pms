const recurringPaymentsTable = `CREATE TABLE IF NOT EXISTS recurring_templates (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    lease_id VARCHAR(255) NOT NULL,
    charge_type ENUM('Rent', 'Utility', 'Maintenance', 'Late Fee', 'Others') NOT NULL,
    description VARCHAR(500),
    amount DECIMAL(10,2) NOT NULL,
    frequency ENUM('Monthly', 'Quarterly', 'Semi-annually', 'Annually') DEFAULT 'Monthly',
    next_due DATE NOT NULL,
    auto_generate_until DATE NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
) ENGINE=InnoDB;`;

export default recurringPaymentsTable;