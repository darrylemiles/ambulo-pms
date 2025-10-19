const invoiceItemsTable = `
CREATE TABLE IF NOT EXISTS invoice_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  charge_id INT NULL,
  description VARCHAR(500) NOT NULL,
  item_type VARCHAR(50) NULL,
  amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
  FOREIGN KEY (charge_id) REFERENCES charges(charge_id)
) ENGINE=InnoDB;`;

export default invoiceItemsTable;
