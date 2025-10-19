const messagesTable = `
CREATE TABLE IF NOT EXISTS messages (
  message_id INT AUTO_INCREMENT primary key,
  conversation_id VARCHAR(255) NOT NULL,
  sender_user_id VARCHAR(255) NOT NULL,
  recipient_user_id VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  foreign key (sender_user_id) references users(user_id),
  foreign key (recipient_user_id) references users(user_id)
);
`

export default messagesTable;