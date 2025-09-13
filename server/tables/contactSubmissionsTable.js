const contactSubmissionsTable = `CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100),
    phone_number VARCHAR(15),
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP()
);`;

export default contactSubmissionsTable;