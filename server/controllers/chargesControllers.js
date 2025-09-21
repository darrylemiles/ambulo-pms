import expressAsync from "express-async-handler";
import chargesServices from "../services/chargesServices.js";

const createCharge = expressAsync(async (req, res) => {
    try {
        const result = await chargesServices.createCharge(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating charge:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to create charge" });
    }
});

const getAllCharges = expressAsync(async (req, res) => {
    try {
        const result = await chargesServices.getAllCharges();
        res.json(result);
    } catch (error) {
        console.error("Error fetching charges:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch charges" });
    }
});

const getChargeById = expressAsync(async (req, res) => {
    try {
        const result = await chargesServices.getChargeById(req.params.id);
        res.json(result);
    } catch (error) {
        console.error("Error fetching charge:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch charge" });
    }
});

const getChargeByUserId = expressAsync(async (req, res) => {
    try {
        const result = await chargesServices.getChargeByUserId(req.params.userId);
        res.json(result);
    } catch (error) {
        console.error("Error fetching user charges:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch user charges" });
    }
});

const getChargeByLeaseId = expressAsync(async (req, res) => {
    try {
        const result = await chargesServices.getChargeByLeaseId(req.params.leaseId);
        res.json(result);
    } catch (error) {
        console.error("Error fetching lease charges:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to fetch lease charges" });
    }
});

const updateChargeById = expressAsync(async (req, res) => {
    try {
        const result = await chargesServices.updateChargeById(
            req.params.id,
            req.body
        );
        res.json(result);
    } catch (error) {
        console.error("Error updating charge:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to update charge" });
    }
});

const deleteChargeById = expressAsync(async (req, res) => {
    try {
        const result = await chargesServices.deleteChargeById(req.params.id);
        res.json(result);
    } catch (error) {
        console.error("Error deleting charge:", error);
        res
            .status(500)
            .json({ message: error.message || "Failed to delete charge" });
    }
});

export {
    createCharge,
    getAllCharges,
    getChargeById,
    getChargeByUserId,
    getChargeByLeaseId,
    updateChargeById,
    deleteChargeById,
};
