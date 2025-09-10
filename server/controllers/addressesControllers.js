import expressAsync from 'express-async-handler';
import addressesServices from '../services/addressesServices.js';

const createAddress = expressAsync(async (req, res) => {
  const addressData = req.body;
  const result = await addressesServices.createAddress(addressData);
  res.status(201).json({ message: result });
});

const getAllAddresses = expressAsync(async (req, res) => {
  const addresses = await addressesServices.getAllAddresses();
  res.json({ message: addresses });
});

const getSingleAddressById = expressAsync(async (req, res) => {
  const addressId = req.params.id;
  const result = await addressesServices.getSingleAddressById(addressId);
  res.json({ message: result });
});

const updateAddressById = expressAsync(async (req, res) => {
  const addressId = req.params.id;
  const addressData = req.body;
  const result = await addressesServices.updateAddressById(addressId, addressData);
  res.json({ message: result });
});

const deleteAddressById = expressAsync(async (req, res) => {
  const addressId = req.params.id;
  const result = await addressesServices.deleteAddressById(addressId);
  res.json({ message: result });
});

export {
    createAddress,
    getAllAddresses,
    getSingleAddressById,
    updateAddressById,
    deleteAddressById
}