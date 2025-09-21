import conn from "../config/db.js";

const pool = await conn();

const getLeaseDefaults = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT setting_id, setting_key, setting_value, description FROM lease_default_values`
    );
    const defaults = {};
    rows.forEach((row) => {
      defaults[row.setting_key] = {
        setting_id: row.setting_id,
        value: row.setting_value,
        description: row.description
      };
    });
    return defaults;
  } catch (error) {
    throw error;
  }
};

const updateLeaseDefaultsById = async (settingId, settingValue, description) => {
  try {
    await pool.query(
      `UPDATE lease_default_values SET setting_value = ?, description = ? WHERE setting_id = ?`,
      [settingValue, description, settingId]
    );
  } catch (error) {
    throw error;
  }
};

export default { 
    getLeaseDefaults, 
    updateLeaseDefaultsById 
};
