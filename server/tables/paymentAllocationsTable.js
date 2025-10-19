const paymentAllocationsTable = `CREATE TABLE IF NOT EXISTS payment_allocations (
  allocation_id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id VARCHAR(255) NOT NULL,
  charge_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
  FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE,
  FOREIGN KEY (charge_id) REFERENCES charges(charge_id)
)`;

export default paymentAllocationsTable;
