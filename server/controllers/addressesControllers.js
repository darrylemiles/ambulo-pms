import expressAsync from 'express-async-handler';
import addressesServices from '../services/addressesServices.js';

const createAddress = expressAsync(async (req, res) => {
  try {
    const addressData = req.body;
    const result = await addressesServices.createAddress(addressData);
    res.status(201).json({ message: result });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({
      message: error.message || "Failed to create address"
    });
  }
});

const getAllAddresses = expressAsync(async (req, res) => {
  try {
    const addresses = await addressesServices.getAllAddresses(req.query);
    res.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch addresses"
    });
  }
});

const getSingleAddressById = expressAsync(async (req, res) => {
  try {
    const addressId = req.params.id;
    const result = await addressesServices.getSingleAddressById(addressId);
    res.json({ address: result });
  } catch (error) {
    console.error("Error fetching address:", error);
    if (error.message === "Address not found") {
      res.status(404).json({
        message: "Address not found",
        error: error.message
      });
    } else {
      res.status(500).json({
        message: "Failed to fetch address",
        error: error.message
      });
    }
  }
});

const updateAddressById = expressAsync(async (req, res) => {
  try {
    const addressId = req.params.id;
    const addressData = req.body;
    const result = await addressesServices.updateAddressById(addressId, addressData);
    res.json({ message: result });
  } catch (error) {
    console.error("Error updating address:", error);
    if (error.message === "Address not found") {
      res.status(404).json({
        message: "Address not found",
        error: error.message
      });
    } else if (error.message === "No valid fields to update") {
      res.status(400).json({
        message: "No valid fields to update",
        error: error.message
      });
    } else {
      res.status(500).json({
        message: "Failed to update address",
        error: error.message
      });
    }
  }
});

const deleteAddressById = expressAsync(async (req, res) => {
  try {
    const addressId = req.params.id;
    const result = await addressesServices.deleteAddressById(addressId);
    res.json({ message: result });
  } catch (error) {
    console.error("Error deleting address:", error);
    if (error.message === "Address not found") {
      res.status(404).json({
        message: "Address not found",
        error: error.message
      });
    } else {
      res.status(500).json({
        message: "Failed to delete address",
        error: error.message
      });
    }
  }
});

export {
  createAddress,
  getAllAddresses,
  getSingleAddressById,
  updateAddressById,
  deleteAddressById
};