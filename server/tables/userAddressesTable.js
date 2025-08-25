const userAddressesTable = `CREATE TABLE IF NOT EXISTS user_addresses (
	user_address_id int auto_increment primary key,
	house_no varchar(10),
	street_address varchar(100),
	city varchar(100),
	province varchar(100),
	zip_code varchar(20),
	country varchar(100),
	created_at DATETIME default CURRENT_TIMESTAMP(),
	updated_at DATETIME default CURRENT_TIMESTAMP() on update CURRENT_TIMESTAMP()
);`;

export default userAddressesTable;