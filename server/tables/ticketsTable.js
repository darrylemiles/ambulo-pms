const ticketsTable = `CREATE TABLE IF NOT EXISTS tickets (
    ticket_id VARCHAR(255) NOT NULL PRIMARY KEY,
    ticket_title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    priority VARCHAR(10) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    assigned_to VARCHAR(100),
    user_id VARCHAR(255) NOT NULL,
    unit_no VARCHAR(100) NOT NULL,
    ticket_status VARCHAR(20) NOT NULL,
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