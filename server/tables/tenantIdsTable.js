const tenantIdsTable = `CREATE TABLE IF NOT EXISTS tenant_ids (
  id_id INT PRIMARY KEY,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)`;

export default tenantIdsTable;
