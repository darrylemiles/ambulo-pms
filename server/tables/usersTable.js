const usersTable = `CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(64),
    last_name VARCHAR(64),
    business_name VARCHAR(64),
    business_type VARCHAR(100),
    avatar VARCHAR(500),
    email VARCHAR(64),
    phone_number CHAR(15),
    password_hash CHAR(60),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);`;

export default usersTable;