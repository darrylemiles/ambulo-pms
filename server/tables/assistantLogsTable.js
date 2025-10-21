const assistantLogsTable = `
CREATE TABLE IF NOT EXISTS assistant_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  path VARCHAR(255) NOT NULL,
  method VARCHAR(16) NOT NULL,
  status INT NOT NULL,
  duration_ms INT NOT NULL,
  user_role VARCHAR(32) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

export default assistantLogsTable;