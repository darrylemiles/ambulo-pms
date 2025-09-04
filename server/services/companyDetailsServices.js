import conn from "./../config/db.js";

// Create company details and address if not exists
const createCompanyDetails = async (companyData) => {
  const {
    company_name,
    icon_logo_url,
    alt_logo_url,
    email,
    phone_number,
    alt_phone_number,
    business_desc,
    business_hours,
    house_no,
    street_address,
    city,
    province,
    zip_code,
    country,
  } = companyData;

  const pool = await conn();

  // Insert into company_info
  const companyQuery = `
    INSERT INTO company_info (
      company_name, icon_logo_url, alt_logo_url, email, phone_number, alt_phone_number,
      business_desc, business_hours, mission, vision, company_values, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const [companyResult] = await pool.query(companyQuery, [
    company_name,
    icon_logo_url,
    alt_logo_url,
    email,
    phone_number,
    alt_phone_number,
    business_desc,
    business_hours, 
  ]);
  const companyId = companyResult.insertId;

  // Insert into company_address
  const addressQuery = `
    INSERT INTO company_address (
      company_id, house_no, street_address, city, province, zip_code, country
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await pool.query(addressQuery, [
    companyId,
    house_no || "",
    street_address || "",
    city || "",
    province || "",
    zip_code || "",
    country || "",
  ]);

  return companyId;
};

// Get company details and address
const getCompanyDetails = async (companyId) => {
  const pool = await conn();
  const query = `
    SELECT ci.*, ca.house_no, ca.street_address, ca.city, ca.province, ca.zip_code, ca.country
    FROM company_info ci
    LEFT JOIN company_address ca ON ci.id = ca.company_id
    ${companyId ? "WHERE ci.id = ?" : ""}
  `;
  const [rows] = await pool.query(query, companyId ? [companyId] : []);
  return rows;
};

// Update company details and address
const updateCompanyDetails = async (companyId, companyData) => {
  const allowedFields = [
    "company_name",
    "icon_logo_url",
    "alt_logo_url",
    "email",
    "phone_number",
    "alt_phone_number",
    "business_desc",
    "business_hours", 
  ];

  const addressFields = [
    "house_no",
    "street_address",
    "city",
    "province",
    "zip_code",
    "country"
  ];

  const setClauses = [];
  const values = [];

  allowedFields.forEach((field) => {
    if (companyData[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(companyData[field]);
    }
  });

  setClauses.push("updated_at = NOW()");

  const pool = await conn();

  // Update company_info
  if (setClauses.length > 1) {
    const companyQuery = `
      UPDATE company_info SET
        ${setClauses.join(", ")}
      WHERE id = ?
    `;
    values.push(companyId);
    await pool.query(companyQuery, values);
  }

  // Check if address exists
  const [addressRows] = await pool.query(
    "SELECT id FROM company_address WHERE company_id = ?",
    [companyId]
  );

  if (addressRows.length === 0) {
    // Insert new address
    const addressQuery = `
      INSERT INTO company_address (
        company_id, house_no, street_address, city, province, zip_code, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(addressQuery, [
      companyId,
      companyData.house_no || "",
      companyData.street_address || "",
      companyData.city || "",
      companyData.province || "",
      companyData.zip_code || "",
      companyData.country || "",
    ]);
  } else {
    const addressSetClauses = [];
    const addressValues = [];
    addressFields.forEach((field) => {
      if (companyData[field] !== undefined) {
        addressSetClauses.push(`${field} = ?`);
        addressValues.push(companyData[field]);
      }
    });
    if (addressSetClauses.length > 0) {
      const addressUpdateQuery = `
        UPDATE company_address SET
          ${addressSetClauses.join(", ")}
        WHERE company_id = ?
      `;
      addressValues.push(companyId);
      await pool.query(addressUpdateQuery, addressValues);
    }
  }

  return true;
};

export default {
  createCompanyDetails,
  getCompanyDetails,
  updateCompanyDetails,
};