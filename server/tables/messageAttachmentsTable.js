const messageAttachmentsTable = `
CREATE TABLE IF NOT EXISTS message_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  url VARCHAR(1024) NOT NULL,
  filename VARCHAR(255) DEFAULT NULL,
  mime_type VARCHAR(100) DEFAULT NULL,
  size_bytes INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_attachments_message
    FOREIGN KEY (message_id) REFERENCES messages(message_id)
    ON DELETE CASCADE
);
`;

export default messageAttachmentsTable;
