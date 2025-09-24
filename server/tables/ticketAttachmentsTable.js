const ticketAttachmentsTable = `
CREATE TABLE IF NOT EXISTS ticket_attachments (
	attachment_id int primary key auto_increment,
	ticket_id VARCHAR(255) not NULL,
	url VARCHAR(500) not NULL,
	created_at TIMESTAMP default CURRENT_TIMESTAMP(),
	foreign key (ticket_id) references tickets(ticket_id) on delete CASCADE
	);`;

export default ticketAttachmentsTable;