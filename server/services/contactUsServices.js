import conn from '../config/db.js';

const pool = await conn();

const createContactUsEntry = async (contactData = {}) => {
    try {
        return "created";
    } catch (error) {
     throw new Error(error.message || "Failed to create contact us entry");   
    }
}

const getAllContactUsEntries = async () => {
    try {
        return "fetched";
    } catch (error) {
        throw new Error(error.message || "Failed to fetch contact us entries");
    }
}

const getContactUsEntryById = async (entryId) => {
    try {
        return "fetched single";
    } catch (error) {
        throw new Error(error.message || "Failed to fetch contact us entry");
    }
}

const editContactUsEntry = async (entryId, updateData = {}) => {
    try {
        return "updated";
    } catch (error) {
        throw new Error(error.message || "Failed to update contact us entry");
    }
}

const deleteContactUsEntry = async (entryId) => {
    try {
        return "deleted";
    } catch (error) {
        throw new Error(error.message || "Failed to delete contact us entry");
    }
}

export default {
    createContactUsEntry,
    getAllContactUsEntries,
    getContactUsEntryById,
    editContactUsEntry,
    deleteContactUsEntry
};