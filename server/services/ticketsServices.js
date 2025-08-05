import { v4 as uuidv4 } from "uuid";
import conn from "./../config/db.js";

const pool = await conn();


const createTicket = async (ticketData = {}) => {
  const {
    ticket_title,
    description,
    priority,
    request_type,
    assigned_to,
    user_id,
    unit_no,
    ticket_status,
    start_date,
    end_date,
    attachments,
    notes
  } = ticketData || {};

  const ticket_id = uuidv4();
  const now = new Date();
  
  try {
    const newTicket = {
      ticket_id,
      ticket_title,
      description,
      priority,
      request_type,
      assigned_to,
      user_id,
      unit_no,
      ticket_status,
      start_date,
      end_date,
      attachments,
      notes,
      created_at: now,
      updated_at: now
    };

    Object.keys(newTicket).forEach(
      (key) => newTicket[key] === undefined && delete newTicket[key]
    );

    const fields = Object.keys(newTicket).join(", ");
    const placeholders = Object.keys(newTicket).map(() => "?").join(", ");
    const values = Object.values(newTicket);

    const query = `INSERT INTO tickets (${fields}) VALUES (${placeholders})`;
    
    await pool.query(query, values);

    return {
      message: "Ticket created successfully",
      ticket_id,
      ticketData: newTicket
    };

  } catch (error) {
    console.error("Error creating ticket:", error);
    throw new Error(error.message || "Failed to create ticket");
  }
};

const getTickets = async (queryObj = {}) => {
  try {
    const { page = 1, limit = 10, ...filters } = queryObj;
    const skip = (page - 1) * limit;

    
    let query = 'SELECT * FROM tickets';
    const params = [];

    
    const filterConditions = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => {
        params.push(value);
        return `${key} = ?`;
      });

    if (filterConditions.length > 0) {
      query += ' WHERE ' + filterConditions.join(' AND ');
    }

    
    query += ' ORDER BY created_at DESC';

    
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(skip));

    
    let countQuery = 'SELECT COUNT(*) as total FROM tickets';
    const countParams = [];

    if (filterConditions.length > 0) {
      countQuery += ' WHERE ' + filterConditions.join(' AND ');
      
      Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== "")
        .forEach(([_, value]) => countParams.push(value));
    }

    
    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      tickets: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTickets: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw new Error(error.message || "Failed to fetch tickets");
  }
};

const getSingleTicketById = async (ticket_id = "") => {
  try {
    const query = `SELECT * FROM tickets WHERE ticket_id = ?`;
    const [rows] = await pool.query(query, [ticket_id]);

    if (rows.length === 0) {
      throw new Error("Ticket not found");
    }

    return {
      message: "Ticket retrieved successfully",
      ticket: rows[0]
    };
  } catch (error) {
    console.error("Error getting ticket:", error);
    throw new Error(error.message || "Failed to get ticket");
  }
};

const getTicketsByUserId = async (user_id = "", queryObj = {}) => {
  try {
    const { page = 1, limit = 10 } = queryObj;
    const skip = (page - 1) * limit;

    const query = `SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(query, [user_id, parseInt(limit), parseInt(skip)]);

    const countQuery = `SELECT COUNT(*) as total FROM tickets WHERE user_id = ?`;
    const [countResult] = await pool.query(countQuery, [user_id]);
    const total = countResult[0].total;

    return {
      message: "User tickets retrieved successfully",
      user_id,
      tickets: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTickets: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw new Error(error.message || "Failed to fetch user tickets");
  }
};

const updateTicketById = async (ticket_id = "", ticketData = {}) => {
  try {
    if (!ticket_id) {
      throw new Error("Ticket ID is required");
    }

    if (Object.keys(ticketData).length === 0) {
      throw new Error("No data provided for update");
    }

    const allowedFields = [
      'ticket_title',
      'description', 
      'priority',
      'ticket_status',
      'assigned_to',
      'start_date',
      'end_date',
      'notes',
      'attachments'
    ];

    const filteredData = {};
    Object.keys(ticketData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = ticketData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No valid fields provided for update");
    }


    const existingTicket = await getSingleTicketById(ticket_id);
    const existingTicketData = existingTicket.ticket;


    let updatedAttachments = existingTicketData.attachments || "";
    
    if (filteredData.attachments) {
      if (updatedAttachments && filteredData.attachments) {
        updatedAttachments = `${updatedAttachments},${filteredData.attachments}`;
      } else if (filteredData.attachments) {
        updatedAttachments = filteredData.attachments;
      }
    } else {
      updatedAttachments = existingTicketData.attachments;
    }

    const updatedData = {
      ...filteredData,
      attachments: updatedAttachments,
      updated_at: new Date()
    };

    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );


    const fields = Object.keys(updatedData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(updatedData);

    const query = `UPDATE tickets SET ${setClause} WHERE ticket_id = ?`;
    const [result] = await pool.query(query, [...values, ticket_id]);

    if (result.affectedRows === 0) {
      throw new Error("Ticket could not be updated");
    }

    const updatedTicket = await getSingleTicketById(ticket_id);

    return {
      message: "Ticket updated successfully",
      ticket_id,
      ticket: updatedTicket.ticket,
      updatedFields: Object.keys(filteredData)
    };
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw new Error(error.message || "Failed to update ticket");
  }
};

const deleteTicket = async (ticket_id = "") => {
  try {
    const existingTicket = await getSingleTicketById(ticket_id);
    
    const query = `DELETE FROM tickets WHERE ticket_id = ?`;
    const [result] = await pool.query(query, [ticket_id]);
    
    if (result.affectedRows === 0) {
      throw new Error("Ticket could not be deleted");
    }

    return {
      message: "Ticket deleted successfully",
      ticket_id,
      deletedTicket: {
        ticket_id: existingTicket.ticket.ticket_id,
        ticket_title: existingTicket.ticket.ticket_title,
        ticket_status: existingTicket.ticket.ticket_status
      }
    };
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw new Error(error.message || "Failed to delete ticket");
  }
};

export default {
  createTicket,
  getTickets,
  getSingleTicketById,
  getTicketsByUserId,
  updateTicketById,
  deleteTicket,
};
