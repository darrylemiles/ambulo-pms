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
        // Handle display image upload
        const display_image = req.files && req.files['display_image'] 
          ? req.files['display_image'][0].path 
          : "";

        // Handle showcase images upload
        const showcase_images = req.files && req.files['showcase_images']
          ? req.files['showcase_images'].map(file => file.path)
          : [];

        let payload = { ...req.body };
        
        // Handle display image - either new image or removal
        if (display_image) {
            payload.display_image = display_image;
        } else if (payload.remove_display_image === 'true') {
            payload.display_image = null; // Set to null to remove
        }

        // Add showcase images if any were uploaded
        if (showcase_images.length > 0) {
            payload.showcase_images = showcase_images;
        }

        // Process showcase descriptions
        if (payload.showcase_descriptions) {
            if (!Array.isArray(payload.showcase_descriptions)) {
                payload.showcase_descriptions = [payload.showcase_descriptions];
            }
        } else {
            payload.showcase_descriptions = [];
        }

        // Process existing image IDs
        if (payload.existing_image_ids) {
            if (!Array.isArray(payload.existing_image_ids)) {
                payload.existing_image_ids = [payload.existing_image_ids];
            }
            // Filter out invalid IDs and convert to integers
            payload.existing_image_ids = payload.existing_image_ids
                .map(id => parseInt(id))
                .filter(id => !isNaN(id) && id > 0);
        } else {
            payload.existing_image_ids = [];
        }

        // Process existing descriptions
        if (payload.existing_descriptions) {
            if (!Array.isArray(payload.existing_descriptions)) {
                payload.existing_descriptions = [payload.existing_descriptions];
            }
        } else {
            payload.existing_descriptions = [];
        }

        // Process deleted image IDs
        if (payload.deleted_image_ids) {
            if (!Array.isArray(payload.deleted_image_ids)) {
                payload.deleted_image_ids = [payload.deleted_image_ids];
            }
            // Filter out invalid deleted IDs and convert to integers
            payload.deleted_image_ids = payload.deleted_image_ids
                .map(id => parseInt(id))
                .filter(id => !isNaN(id) && id > 0);
        } else {
            payload.deleted_image_ids = [];
        }

        const response = await propertiesServices.editPropertyById(req.params.property_id, payload);
        res.json(response);
    } catch (error) {
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