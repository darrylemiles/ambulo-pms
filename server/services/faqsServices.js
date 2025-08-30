import conn from "./../config/db.js";

const createFaq = async (faqData) => {
  try {
    return "FAQ created successfully";
  } catch (error) {
    throw error;
  }
};

const getAllFaqs = async () => {
  try {
    return "All FAQs retrieved successfully";
  } catch (error) {
    throw error;
  }
};

const getSingleFaqById = async (faqId) => {
  try {
    return "Single FAQ retrieved successfully";
  } catch (error) {
    throw error;
  }
};

const updateFaqById = async (faqId, faqData) => {
  try {
    return "FAQ updated successfully";
  } catch (error) {
    throw error;
  }
};

const deleteFaqById = async (faqId) => {
  try {
    return "FAQ deleted successfully";
  } catch (error) {
    throw error;
  }
};

export default {
  createFaq,
  getAllFaqs,
  getSingleFaqById,
  updateFaqById,
  deleteFaqById
};
