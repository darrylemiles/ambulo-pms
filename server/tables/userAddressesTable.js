const userAddressesTable = `CREATE TABLE IF NOT EXISTS user_addresses (
	user_address_id int auto_increment primary key,
	house_no varchar(10) NOT NULL,
	street_address varchar(100) NOT NULL,
	city varchar(100) NOT NULL,
	province varchar(100) NOT NULL,
	zip_code varchar(20),
	country varchar(100) NOT NULL,
	created_at DATETIME default CURRENT_TIMESTAMP(),
	updated_at DATETIME default CURRENT_TIMESTAMP() on update CURRENT_TIMESTAMP()
);`;

export default userAddressesTable;