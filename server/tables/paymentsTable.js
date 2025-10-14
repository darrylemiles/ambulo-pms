const paymentsTable = `CREATE TABLE IF NOT EXISTS payments (
	payment_id varchar(255) primary key,
	charge_id int not null, 
	user_id varchar(255) not null,
	amount decimal(10,2) not null,
	payment_method enum('Cash', 'Bank Transfer', 'Check', 'Other') not null,
	status enum('Pending', 'Completed', 'Rejected') DEFAULT 'Pending',
	notes text NULL,
	confirmed_by varchar(255) NULL,
	confirmed_at datetime NULL,
	created_at datetime DEFAULT CURRENT_TIMESTAMP(),
    
	foreign key (charge_id) references charges(charge_id),
	foreign key (user_id) references users(user_id)
)`;

export default paymentsTable;