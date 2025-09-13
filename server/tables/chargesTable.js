const chargesTable = `CREATE TABLE IF NOT EXISTS charges (
	charge_id int auto_increment primary key,
	lease_id varchar(255) not null,
	charge_type enum('Rent', 'Utility', 'Maintenance', 'Late Fee', 'Others') not null,
	description varchar(500),
	amount decimal(10,2) not null,
	charge_date datetime default CURRENT_TIMESTAMP(),
	due_date date not null,
	is_recurring boolean default false not null,
	status enum('Unpaid', 'Partially Paid', 'Paid') default 'Unpaid' not null,

	foreign key (lease_id) references leases(lease_id)
)`;

export default chargesTable;