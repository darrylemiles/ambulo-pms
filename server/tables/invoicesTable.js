const invoicesTable = `CREATE TABLE IF NOT EXISTS invoices (
  invoice_id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id VARCHAR(255) NOT NULL,
  lease_id VARCHAR(255) NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  property_name VARCHAR(255),
  issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  reference_number VARCHAR(255),
  status ENUM('Issued', 'Cancelled') DEFAULT 'Issued',
  notes VARCHAR(500),
  FOREIGN KEY (payment_id) REFERENCES payments(payment_id),
  FOREIGN KEY (lease_id) REFERENCES leases(lease_id)
);`;

export default invoicesTable;