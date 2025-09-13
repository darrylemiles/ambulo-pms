const leaseContractsTable = `CREATE TABLE IF NOT EXISTS lease_contracts (
    lease_contract_id INT auto_increment primary key,
	url VARCHAR(500) not null,
	created_at DATETIME default CURRENT_TIMESTAMP(),
	updated_at DATETIME default CURRENT_TIMESTAMP() on update current_TIMESTAMP()
)`;

export default leaseContractsTable;