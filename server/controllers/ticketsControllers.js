import expressAsync from "express-async-handler";
import ticketsServices from "../services/ticketsServices.js";

const createTicket = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.createTicket(req.body);
    res.json(response);
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw new Error(error.message || "Failed to create ticket");
  }
});

const getTickets = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.getTickets(req.query);
    res.json(response);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw new Error(error.message || "Failed to fetch tickets");
  }
});

const getSingleTicketById = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.getSingleTicketById(req.params.ticket_id);
    res.json(response);
  } catch (error) {
    console.error("Error getting ticket:", error);
    throw new Error(error.message || "Failed to get ticket");
  }
});

const getTicketsByUserId = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.getTicketsByUserId(req.params.user_id);
    res.json(response);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw new Error(error.message || "Failed to fetch user tickets");
  }
});

const updateTicket = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.updateTicket(req.params.ticket_id, req.body);
    res.json(response);
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw new Error(error.message || "Failed to update ticket");
  }
});

const deleteTicket = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.deleteTicket(req.params.ticket_id);
    res.json(response);
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw new Error(error.message || "Failed to delete ticket");
  }
});

export {
  createTicket,
    getTickets,
    getSingleTicketById,
    getTicketsByUserId,
    updateTicket,
    deleteTicket
};