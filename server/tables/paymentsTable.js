const paymentsTable = `CREATE TABLE IF NOT EXISTS payments (
	payment_id varchar(255) primary key,
	charge_id int not null, 
	payment_date date not null,
	amount_paid decimal(10,2) not null,
	payment_method enum('Cash', 'Bank Transfer', 'Check', 'Other') not null, 
	notes text,
    
	foreign key (charge_id) references charges(charge_id)
)`;

export default paymentsTable;