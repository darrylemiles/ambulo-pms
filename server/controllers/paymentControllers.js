import expressAsync from 'express-async-handler';
import paymentServices from '../services/paymentServices.js';

/*
const createPayment = expressAsync(async (req, res) => {
    const payment = req.body;
    const result = await paymentServices.createPayment(payment);
    res.status(201).json(result);
});
*/
const getAllPayments = expressAsync(async (req, res) => {
    const result = await paymentServices.getAllPayments(req.query);
    res.status(200).json(result);
});

const getPaymentById = expressAsync(async (req, res) => {
    const { id } = req.params;
    const result = await paymentServices.getPaymentById(id);
    res.status(200).json(result);
});

const updatePayment = expressAsync(async (req, res) => {
    const { id } = req.params;
    const payment = req.body;
    const result = await paymentServices.updatePayment(id, payment);
    res.status(200).json(result);
});

export {
   // createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment
};
