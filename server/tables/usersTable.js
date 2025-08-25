const usersTable = `CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY NOT NULL,
    first_name VARCHAR(64),
    middle_name VARCHAR(64),
    last_name VARCHAR(64),
    suffix VARCHAR(10),
    birthdate DATE,
    gender ENUM('Male', 'Female', 'Other'),
    business_name VARCHAR(64),
    business_type VARCHAR(100),
    avatar VARCHAR(500),
    email VARCHAR(64),
    phone_number CHAR(15),
    alt_phone_number CHAR(15),
    user_address_id INT,
    password_hash CHAR(60),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'INACTIVE', 'BANNED') DEFAULT 'ACTIVE'
);`;

export default usersTable;