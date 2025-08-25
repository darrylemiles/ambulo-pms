const tenantIdsTable = `CREATE TABLE IF NOT EXISTS tenant_ids (
  id_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255),
  id_url  VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)`;

export default tenantIdsTable;
