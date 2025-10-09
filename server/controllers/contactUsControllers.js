import expressAsync from "express-async-handler";
import contactUsServices from "../services/contactUsServices.js";

const createContactUsEntry = expressAsync(async (req, res) => {
  try {
    const payload = { ...req.body };
    const response = await contactUsServices.createContactUsEntry(payload);
    res.json(response);
  } catch (error) {
    console.error("Error creating contact us entry:", error);
    throw new Error(error.message || "Failed to create contact us entry");
  }
});

const getAllContactUsEntries = expressAsync(async (req, res) => {
  try {
    const response = await contactUsServices.getAllContactUsEntries(req.query);
    res.json(response);
  } catch (error) {
    console.error("Error fetching contact us entries:", error);
    throw new Error(error.message || "Failed to fetch contact us entries");
  }
});

const getContactUsEntryById = expressAsync(async (req, res) => {
  try {
    const response = await contactUsServices.getContactUsEntryById(req.params.entry_id);
    res.json(response);
  } catch (error) {
    console.error("Error getting contact us entry:", error);
    throw new Error(error.message || "Failed to get contact us entry");
  }
});

const editContactUsEntry = expressAsync(async (req, res) => {
  try {
    const payload = { ...req.body };
    const response = await contactUsServices.editContactUsEntry(req.params.entry_id, payload);
    res.json(response);
    } catch (error) {
    console.error("Error editing contact us entry:", error);
    throw new Error(error.message || "Failed to edit contact us entry");
  }
});

const deleteContactUsEntry = expressAsync(async (req, res) => {
  try {
    const response = await contactUsServices.deleteContactUsEntry(req.params.entry_id);
    res.json(response);
  } catch (error) {
    console.error("Error deleting contact us entry:", error);
    throw new Error(error.message || "Failed to delete contact us entry");
  }
});

export {
    createContactUsEntry,
    getAllContactUsEntries,
    getContactUsEntryById,
    editContactUsEntry,
    deleteContactUsEntry
}