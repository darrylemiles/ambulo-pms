const ticketRatingsTable = `
CREATE TABLE IF NOT EXISTS ticket_ratings (
	rating_id INT PRIMARY KEY AUTO_INCREMENT,
	ticket_id VARCHAR(255) NOT NULL,
	user_id varchar(255) NOT NULL,
	rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
	feedback TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
	updated_at TIMESTAMP default CURRENT_TIMESTAMP() on update current_timestamp(),
	FOREIGN KEY (ticket_id) references tickets(ticket_id) on delete CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(user_id)
);`;

export default ticketRatingsTable;