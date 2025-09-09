import conn from "./../config/db.js";

const pool = await conn();

const createFaq = async (faqData = {}) => {
  const {
    question,
    answer,
    sort_order = 0,
    is_active = 1
  } = faqData || {};

  try {
    const faq_id = undefined; 
    const now = new Date();

    const newFaq = {
      question,
      answer,
      sort_order,
      is_active,
      created_at: now,
      updated_at: now
    };

    Object.keys(newFaq).forEach(
      (key) => newFaq[key] === undefined && delete newFaq[key]
    );

    const fields = Object.keys(newFaq).join(", ");
    const placeholders = Object.keys(newFaq).map(() => "?").join(", ");
    const values = Object.values(newFaq);

    const query = `INSERT INTO faqs (${fields}) VALUES (${placeholders})`;

    const [result] = await pool.query(query, values);

    return {
      faq_id: result.insertId,
      message: "FAQ created successfully",
      faqData: newFaq
    };
  } catch (error) {
    throw error;
  }
};

const getAllFaqs = async () => {
  try {
    const query = `
      SELECT faq_id, question, answer, sort_order, is_active, created_at, updated_at
      FROM faqs
      ORDER BY sort_order ASC, faq_id ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

const getSingleFaqById = async (faqId) => {
  try {
    const query = `
      SELECT faq_id, question, answer, sort_order, is_active, created_at, updated_at
      FROM faqs
      WHERE faq_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [faqId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

const updateFaqById = async (faqId, faqData = {}) => {
  try {
    if (!faqId) throw new Error("FAQ ID is required");
    if (Object.keys(faqData).length === 0) throw new Error("No data provided for update");

    const allowedFields = ["question", "answer", "sort_order", "is_active"];
    const filteredData = {};
    Object.keys(faqData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = faqData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    filteredData.updated_at = new Date();

    Object.keys(filteredData).forEach(
      (key) => filteredData[key] === undefined && delete filteredData[key]
    );

    const fields = Object.keys(filteredData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(filteredData);

    const query = `UPDATE faqs SET ${setClause} WHERE faq_id = ?`;
    const [result] = await pool.query(query, [...values, faqId]);

    if (result.affectedRows === 0) {
      throw new Error("FAQ not found or no changes made");
    }

    return {
      message: "FAQ updated successfully!",
      affectedRows: result.affectedRows
    };
  } catch (error) {
    throw error;
  }
};

const deleteFaqById = async (faqId) => {
  try {
    const query = `
      DELETE FROM faqs
      WHERE faq_id = ?
      LIMIT 1
    `;
    const [result] = await pool.query(query, [faqId]);
    return {
      affectedRows: result.affectedRows,
      message: "FAQ deleted successfully"
    };
  } catch (error) {
    throw error;
  }
};

export default {
  createFaq,
  getAllFaqs,
  getSingleFaqById,
  updateFaqById,
  deleteFaqById,
};