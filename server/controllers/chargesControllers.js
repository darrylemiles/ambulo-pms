import expressAsync from 'express-async-handler';
import chargesServices from '../services/chargesServices.js';

const createCharge = expressAsync(async (req, res) => {
    const charge = req.body;
    const result = await chargesServices.createCharge(charge);
    res.status(201).json(result);
});

const getAllCharges = expressAsync(async (req, res) => {
    const result = await chargesServices.getAllCharges(req.query); // Pass query parameters for filtering/pagination
    res.status(200).json(result);
});

const getChargeById = expressAsync(async (req, res) => {
    const { id } = req.params;
    const result = await chargesServices.getChargeById(id);
    res.status(200).json(result);
});

const getChargeByUserId = expressAsync(async (req, res) => {
    const { userId } = req.params;
    const result = await chargesServices.getChargeByUserId(userId);
    res.status(200).json(result);
});

const getChargeByLeaseId = expressAsync(async (req, res) => {
    const { leaseId } = req.params;
    const result = await chargesServices.getChargeByLeaseId(leaseId);
    res.status(200).json(result);
});

const updateChargeById = expressAsync(async (req, res) => {
    const { id } = req.params;
    const charge = req.body;
    const result = await chargesServices.updateChargeById(id, charge);
    res.status(200).json(result);
});

const deleteChargeById = expressAsync(async (req, res) => {
    const { id } = req.params;
    const result = await chargesServices.deleteChargeById(id);
    res.status(204).json(result);
});

export {
    createCharge,
    getAllCharges,
    getChargeById,
    getChargeByUserId,
    getChargeByLeaseId,
    updateChargeById,
    deleteChargeById
};