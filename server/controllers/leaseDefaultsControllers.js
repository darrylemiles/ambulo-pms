import expressAsync from "express-async-handler";
import leaseDefaultsServices from "../services/leaseDefaultsServices.js";

const getLeaseDefaults = expressAsync(async (req, res) => {
  try {
    const defaults = await leaseDefaultsServices.getLeaseDefaults();
    res.status(200).json({defaults});
  } catch (error) {
    console.error("Error getting lease defaults:", error);
    res.status(400).json({ message: error.message || "Failed to get lease defaults" });
  }
});

const updateLeaseDefaults = expressAsync(async (req, res) => {
  try {
    const { settingKey, settingValue } = req.body;
    if (!settingKey || settingValue === undefined) {
      return res.status(400).json({ message: "settingKey and settingValue are required" });
    }
    await leaseDefaultsServices.updateLeaseDefaults(settingKey, settingValue);
    res.status(200).json({ message: "Lease default updated successfully" });
  } catch (error) {
    console.error("Error updating lease default:", error);
    res.status(400).json({ message: error.message || "Failed to update lease default" });
  }
});

export {
  getLeaseDefaults,
  updateLeaseDefaults
};