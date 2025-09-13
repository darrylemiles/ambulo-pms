const paymentProofTable = `CREATE TABLE IF NOT EXISTS payment_proof (
	proof_id int auto_increment primary key,
	payment_id varchar(255),
	proof_url varchar(255),
	uploaded_at datetime default CURRENT_TIMESTAMP(),
    
	foreign key (payment_id) references payments(payment_id) on delete cascade
)`;

export default paymentProofTable;