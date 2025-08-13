const propertiesTable = `
CREATE TABLE IF NOT EXISTS properties (
    property_id VARCHAR(255) PRIMARY KEY NOT NULL,
    property_name VARCHAR(255),
    floor_area_sqm DECIMAL(10,2),
    description TEXT,
    display_image VARCHAR(255),
    property_status VARCHAR(50) DEFAULT 'Available',
    base_rent DECIMAL(10,2),
    property_taxes_quarterly DECIMAL(10,2),
    security_deposit_months DECIMAL(10,2),
    minimum_lease_term_months INT DEFAULT 24,
    address_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_properties_address
        FOREIGN KEY (address_id) REFERENCES addresses(address_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;
`;


export default propertiesTable;
