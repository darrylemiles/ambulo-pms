const companyAddressTable = `CREATE TABLE IF NOT EXISTS company_address (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    house_no VARCHAR(50),
    street_address VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    FOREIGN KEY (company_id) REFERENCES company_info(id) ON DELETE CASCADE
);`;

export default companyAddressTable;