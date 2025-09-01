import conn from "./../config/db.js";

const createCompanyDetails = async (companyData) => {
  const {
    company_name,
    icon_logo_url,
    alt_logo_url,
    email,
    phone_number,
    alt_phone_number,
    business_desc,
    mission,
    vision,
    company_values,
  } = companyData;

  const pool = await conn();
  const query = `
    INSERT INTO company_info (
      company_name, icon_logo_url, alt_logo_url, email, phone_number, alt_phone_number,
      business_desc, mission, vision, company_values, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const [result] = await pool.query(query, [
    company_name,
    icon_logo_url,
    alt_logo_url,
    email,
    phone_number,
    alt_phone_number,
    business_desc,
    mission,
    vision,
    company_values,
  ]);
  return result.insertId;
};

const getCompanyDetails = async (companyId) => {
  const pool = await conn();
  const query = `SELECT * FROM company_info`;
  const [rows] = await pool.query(query);
  return rows;
};

const updateCompanyDetails = async (companyId, companyData) => {
  const {
    company_name,
    icon_logo_url,
    alt_logo_url,
    email,
    phone_number,
    alt_phone_number,
    business_desc,
    mission,
    vision,
    company_values,
  } = companyData;

  const pool = await conn();
  const query = `
    UPDATE company_info SET
      company_name = ?,
      icon_logo_url = ?,
      alt_logo_url = ?,
      email = ?,
      phone_number = ?,
      alt_phone_number = ?,
      business_desc = ?,
      mission = ?,
      vision = ?,
      company_values = ?,
      updated_at = NOW()
    WHERE id = ?
  `;
  const [result] = await pool.query(query, [
    company_name,
    icon_logo_url,
    alt_logo_url,
    email,
    phone_number,
    alt_phone_number,
    business_desc,
    mission,
    vision,
    company_values,
    companyId,
  ]);
  return result.affectedRows > 0;
};

export default {
  createCompanyDetails,
  getCompanyDetails,
  updateCompanyDetails,
};