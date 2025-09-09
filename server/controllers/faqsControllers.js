import expressAsync from "express-async-handler";
import faqsServices from "../services/faqsServices.js";

const createFaq = expressAsync(async (req, res) => { 
  const faqData = req.body;
  const result = await faqsServices.createFaq(faqData);
  res.status(201).json({ message: result });
});

const getAllFaqs = expressAsync(async (req, res) => {
  const result = await faqsServices.getAllFaqs();
  res.status(200).json({ message: result });
});

const getSingleFaqById = expressAsync(async (req, res) => {
  const faqId = req.params.id;
  const result = await faqsServices.getSingleFaqById(faqId);
  res.status(200).json({ message: result });
});

const updateFaqById = expressAsync(async (req, res) => {
  const faqId = req.params.id;
  const faqData = req.body;
  const result = await faqsServices.updateFaqById(faqId, faqData);
  res.status(200).json({ message: result });
});

const deleteFaqById = expressAsync(async (req, res) => {
  const faqId = req.params.id;
  const result = await faqsServices.deleteFaqById(faqId);
  res.status(200).json({ message: result });
});

export {
  createFaq,
  getAllFaqs,
  getSingleFaqById,
  updateFaqById,
  deleteFaqById,
};
