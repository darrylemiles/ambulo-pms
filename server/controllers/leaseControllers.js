import expressAsync from 'express-async-handler';
import leaseServices from '../services/leaseServices.js';

const createLease = expressAsync(async (req, res) => {
  const leaseData = req.body;
  const result = await leaseServices.createLease(leaseData);
  res.status(201).json({ message: result });
});

const getAllLeases = expressAsync(async (req, res) => {
  const result = await leaseServices.getAllLeases();
  res.status(200).json({ message: result });
});

const getSingleLeaseById = expressAsync(async (req, res) => {
  const leaseId = req.params.id;
  const result = await leaseServices.getSingleLeaseById(leaseId);
  res.status(200).json({ message: result });
});

const getLeaseByUserId = expressAsync(async (req, res) => {
  const userId = req.params.userId;
  const result = await leaseServices.getLeaseByUserId(userId);
  res.status(200).json({ message: result });
});

const updateLeaseById = expressAsync(async (req, res) => {
  const leaseId = req.params.id;
  const leaseData = req.body;
  const result = await leaseServices.updateLeaseById(leaseId, leaseData);
  res.status(200).json({ message: result });
});

const deleteLeaseById = expressAsync(async (req, res) => {
  const leaseId = req.params.id;
  const result = await leaseServices.deleteLeaseById(leaseId);
  res.status(200).json({ message: result });
});

export {
  createLease,
  getAllLeases,
  getSingleLeaseById,
  getLeaseByUserId,
  updateLeaseById,
  deleteLeaseById
};
