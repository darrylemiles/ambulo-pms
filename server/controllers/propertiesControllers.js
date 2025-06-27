import expressAsync from 'express-async-handler';
import propertiesServices from '../services/propertiesServices.js';

const createProperty = expressAsync(async (req, res) => {
  try {
    const response = await propertiesServices.createProperty(req.body);
    res.json(response);
  } catch (error) {
    console.error("Error creating property:", error);
    throw new Error(error.message || "Failed to create property");
  }
});

const getProperties = expressAsync(async (req, res) => {
  try {
    const response = await propertiesServices.getProperties(req.query);
    res.json(response);
  } catch (error) {
    console.error("Error getting properties:", error);
    throw new Error(error.message || "Failed to get properties");
  }
});

const getSinglePropertyById = expressAsync(async (req, res) => {
    try {
        const response = await propertiesServices.getSinglePropertyById(req.params.property_id);
        res.json(response);
    } catch (error) {
        console.error("Error getting property:", error);
        throw new Error(error.message || "Failed to get property");
        
    }
});

const editPropertyById = expressAsync(async (req, res) => {
    try {
        const response = await propertiesServices.editPropertyById(req.params.property_id, req.body);
        res.json(response);
    } catch (error) {
        console.error("Error updating property:", error);
        throw new Error(error.message || "Failed to update property");
        
    }
});

const deletePropertyById = expressAsync(async (req, res) => {
    try {
        const response = await propertiesServices.deletePropertyById(req.params.property_id);
        res.json(response);
    } catch (error) {
        console.error("Error deleting property:", error);
        throw new Error(error.message || "Failed to delete property");
    }
});

export {
  createProperty,
    getProperties,
    getSinglePropertyById,
    editPropertyById,
    deletePropertyById
}