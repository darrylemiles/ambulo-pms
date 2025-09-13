const leaseTerminationTable = `CREATE TABLE IF NOT EXISTS lease_termination (
	termination_id int auto_increment primary key,
	lease_id varchar(255) not null,
	termination_date date not null,
	termination_reason enum('Cancellation', 'Non-payment', 'End-of-term', 'Other') not null,
	advance_payment_status enum ('Applied to rent', 'Forfeited', 'Refunded') not null,
	security_deposit_status enum('Refunded', 'Forfeited', 'Held') not null,
	notes TEXT,
	created_at timestamp default current_timestamp(),
    
	foreign key (lease_id) references leases(lease_id)
)`;

export default leaseTerminationTable;
