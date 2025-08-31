const propertiesPicturesTable = `CREATE TABLE IF NOT EXISTS properties_pictures (
	image_id INT PRIMARY KEY AUTO_INCREMENT,
	property_id VARCHAR(255) NOT NULL,
	image_url VARCHAR(255) NOT NULL,
    image_desc VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);`;

export default propertiesPicturesTable;
