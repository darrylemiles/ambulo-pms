const companyInfoTable = `CREATE TABLE IF NOT EXISTS company_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    icon_logo_url VARCHAR(500) NOT NULL,
    alt_logo_url VARCHAR(500) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    alt_phone_number VARCHAR(15),
    business_desc TEXT NOT NULL,
    mission TEXT NOT NULL,
    vision TEXT NOT NULL,
    company_values TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
);`

export default companyInfoTable;