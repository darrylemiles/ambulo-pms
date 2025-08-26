const ticketsTable = `CREATE TABLE IF NOT EXISTS tickets (
    ticket_id VARCHAR(255) NOT NULL PRIMARY KEY,
    ticket_title VARCHAR(100),
    description VARCHAR(500),
    priority VARCHAR(10),
    request_type VARCHAR(50),
    assigned_to VARCHAR(100),
    user_id VARCHAR(255),
    unit_no VARCHAR(20),
    ticket_status VARCHAR(20),
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    attachments VARCHAR(800),
    notes VARCHAR(500),
    maintenance_costs DECIMAL(10, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);`;

export default ticketsTable;