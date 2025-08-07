import expressAsync from "express-async-handler";
import ticketsServices from "../services/ticketsServices.js";

const createTicket = expressAsync(async (req, res) => {
  try {
    console.log('Request session:', req.session);
    console.log('Request user:', req.user);
    console.log('Request body user_id:', req.body.user_id);
    
    const attachments = req.files && req.files['attachments'] 
      ? req.files['attachments'].map(file => file.path).join(',') 
      : "";

    // Get current user ID from authenticated request
    const currentUserId = req.user?.user_id || req.session?.user_id;
    
    if (!currentUserId) {
      return res.status(401).json({ 
        message: "User authentication required. Please log in again." 
      });
    }

    // Use the provided user_id (from tenant selection) or default to current user
    const finalUserId = req.body.user_id || currentUserId;

    const payload = { 
      ...req.body, 
      attachments, 
      user_id: finalUserId // This will be the tenant's ID or current user's ID
    };

    console.log('Final payload being sent to service:', payload);
    console.log('Current user ID:', currentUserId);
    console.log('Final user ID for ticket:', finalUserId);

    const response = await ticketsServices.createTicket(payload, currentUserId);
    res.json(response);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ 
      message: error.message || "Failed to create ticket"
    });
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

const updateTicketStatuses = expressAsync(async (req, res) => {
  try {
    const response = await ticketsServices.updateTicketStatuses();
    res.json(response);
  } catch (error) {
    console.error("Error updating ticket statuses:", error);
    res.status(500).json({ 
      message: error.message || "Failed to update ticket statuses"
    });
  }
});

const updateTicketById = expressAsync(async (req, res) => {
  try {
    const attachments = req.files && req.files['attachments'] 
      ? req.files['attachments'].map(file => file.path).join(',') 
      : "";

    let payload = { ...req.body, attachments };
    
    // Handle status logic for updates - REORDERED for proper priority
    if (req.body.ticket_status === 'CANCELLED') {
      // Manual cancellation takes highest priority
      payload.ticket_status = 'CANCELLED';
      console.log('Manual cancellation requested');
    } else if (req.body.end_time && req.body.end_time.trim() !== '') {
      // If end_time is being set, mark as COMPLETED
      payload.ticket_status = 'COMPLETED';
      payload.end_date = new Date().toISOString().split('T')[0]; // Set end_date to today
      console.log('Setting status to COMPLETED due to end_time');
    } else if (req.body.assigned_to && req.body.assigned_to.trim() !== '' && !req.body.ticket_status) {
      // If assigning to someone and no explicit status provided
      payload.ticket_status = 'ASSIGNED';
      console.log('Setting status to ASSIGNED due to assignment');
    }

    console.log('Final payload ticket_status:', payload.ticket_status);

    const response = await ticketsServices.updateTicketById(req.params.ticket_id, payload);
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
  updateTicketStatuses,
    getTickets,
    getSingleTicketById,
    getTicketsByUserId,
    updateTicketById,
    deleteTicket
};