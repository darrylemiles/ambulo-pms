import conn from "../config/db.js";

const createLease = async (leaseData) => {
  try {
    return "Lease created successfully";
  } catch (error) {
    throw error;
  }
};

const getAllLeases = async () => {
  try {
    return "All Leases retrieved successfully";
  } catch (error) {
    throw error;
  }
};

const getSingleLeaseById = async (leaseId) => {
  try {
    return "Single Lease retrieved successfully";
  } catch (error) {
    throw error;
  }
};

const getLeaseByUserId = async (userId) => {
  try {
    return "Lease retrieved by User ID successfully";
  } catch (error) {
    throw error;
  }
};

const updateLeaseById = async (leaseId, leaseData) => {
  try {
    return "Lease updated successfully";
  } catch (error) {
    throw error;
  }
};

const deleteLeaseById = async (leaseId) => {
  try {
    return "Lease deleted successfully";
  } catch (error) {
    throw error;
  }
};

export default {
  createLease,
  getAllLeases,
  getSingleLeaseById,
  getLeaseByUserId,
  updateLeaseById,
  deleteLeaseById
};
