import expressAsync from 'express-async-handler';
import propertiesServices from '../services/propertiesServices.js';

const createProperty = expressAsync(async (req, res) => {
  try {
    // Handle image upload similar to how tickets handles attachments
    const display_image = req.files && req.files['display_image'] 
      ? req.files['display_image'][0].path 
      : "";

    const payload = { 
      ...req.body, 
      display_image: display_image || req.body.display_image || null
    };

    const response = await propertiesServices.createProperty(payload);
    res.json(response);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ 
      message: error.message || "Failed to create property"
    });
  }
});

const getProperties = expressAsync(async (req, res) => {
  try {
    const response = await propertiesServices.getProperties(req.query);
    res.json(response);
  } catch (error) {
    console.error("Error getting properties:", error);
    res.status(500).json({ 
      message: error.message || "Failed to get properties"
    });
  }
});

const getSinglePropertyById = expressAsync(async (req, res) => {
    try {
        const response = await propertiesServices.getSinglePropertyById(req.params.property_id);
        res.json(response);
    } catch (error) {
        console.error("Error getting property:", error);
        
        if (error.message === "Property not found") {
            res.status(404).json({
                message: "Property not found",
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "Failed to get property",
                error: error.message
            });
        }
    }
});

const editPropertyById = expressAsync(async (req, res) => {
    try {
        // Handle image upload similar to how tickets handles attachments
        const display_image = req.files && req.files['display_image'] 
          ? req.files['display_image'][0].path 
          : "";

        let payload = { ...req.body };
        
        // Only add display_image to payload if a new image was uploaded
        if (display_image) {
            payload.display_image = display_image;
        }

        const response = await propertiesServices.editPropertyById(req.params.property_id, payload);
        res.json(response);
    } catch (error) {
        console.error("Error updating property:", error);
        
        if (error.message === "Property not found") {
            res.status(404).json({
                message: "Property not found",
                error: error.message
            });
        } else if (error.message === "No valid fields to update") {
            res.status(400).json({
                message: "No valid fields to update",
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "Failed to update property",
                error: error.message
            });
        }
    }
});

const deletePropertyById = expressAsync(async (req, res) => {
    try {
        const response = await propertiesServices.deletePropertyById(req.params.property_id);
        res.json(response);
    } catch (error) {
        console.error("Error deleting property:", error);
        
        if (error.message === "Property not found") {
            res.status(404).json({
                message: "Property not found",
                error: error.message
            });
        } else if (error.message === "Cannot delete property with active tenants") {
            res.status(400).json({
                message: "Cannot delete property with active tenants",
                error: error.message
            });
        } else {
            res.status(500).json({
                message: "Failed to delete property",
                error: error.message
            });
        }
    }
});

export {
  createProperty,
  getProperties,
  getSinglePropertyById,
  editPropertyById,
  deletePropertyById
}