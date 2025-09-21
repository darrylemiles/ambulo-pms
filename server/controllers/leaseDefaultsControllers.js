import expressAsync from "express-async-handler";
import leaseDefaultsServices from "../services/leaseDefaultsServices.js";

const getLeaseDefaults = expressAsync(async (req, res) => {
  try {
    const defaults = await leaseDefaultsServices.getLeaseDefaults(req.query);
    res.status(200).json({defaults});
  } catch (error) {
    console.error("Error getting lease defaults:", error);
    res.status(400).json({ message: error.message || "Failed to get lease defaults" });
  }
});

const updateLeaseDefaultsById = expressAsync(async (req, res) => {
  try {
    const settingId = req.params.setting_id;
    const { settingValue, description } = req.body;
    if (!settingId || settingValue === undefined) {
      return res.status(400).json({ message: "settingId and settingValue are required" });
    }
    await leaseDefaultsServices.updateLeaseDefaultsById(settingId, settingValue, description);
    res.status(200).json({ message: "Lease default updated successfully" });
  } catch (error) {
    console.error("Error updating lease default:", error);
    res.status(400).json({ message: error.message || "Failed to update lease default" });
  }
});

export {
  getLeaseDefaults,
  updateLeaseDefaultsById
};