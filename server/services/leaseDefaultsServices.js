import conn from "../config/db.js";

const pool = await conn();

const getLeaseDefaults = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT setting_key, setting_value FROM lease_default_values`
    );
    const defaults = {};
    rows.forEach((row) => {
      defaults[row.setting_key] = row.setting_value;
    });
    return defaults;
  } catch (error) {
    throw error;
  }
};

const updateLeaseDefaults = async (settingKey, settingValue) => {
  try {
    await pool.query(
      `UPDATE lease_default_values SET setting_value = ? WHERE setting_key = ?`,
      [settingValue, settingKey]
    );
  } catch (error) {
    throw error;
  }
};

export default { 
    getLeaseDefaults, 
    updateLeaseDefaults 
};
