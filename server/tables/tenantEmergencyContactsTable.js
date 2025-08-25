const tenantEmergencyContactsTable = `CREATE TABLE IF NOT EXISTS tenant_emergency_contacts (
  contact_id INT PRIMARY KEY,
  user_id VARCHAR(255) ON DELETE CASCADE,
  contact_name VARCHAR(100),
  contact_phone CHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id)
)`;

export default tenantEmergencyContactsTable;