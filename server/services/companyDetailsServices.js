import conn from "./../config/db.js";

const createCompanyDetails = async (companyData) => {
  try {
    return "Company Details created!"
  } catch (error) {
    throw error;
  }
};

const getCompanyDetails = async (companyId) => {
  try {
    return "Company Details retrieved!"
  } catch (error) {
    throw error;
  }
};

const updateCompanyDetails = async (companyId, companyData) => {
  try {
    return "Company Details updated!";
  } catch (error) {
    throw error;
  }
};

export default {
  createCompanyDetails,
  getCompanyDetails,
  updateCompanyDetails
};
