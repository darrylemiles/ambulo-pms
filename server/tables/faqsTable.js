const faqsTable = `CREATE TABLE IF NOT EXISTS faqs (
    faq_id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT,
    answer TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
);`

export default faqsTable;