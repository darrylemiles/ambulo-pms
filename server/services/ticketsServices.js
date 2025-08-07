import { v4 as uuidv4 } from "uuid";
import conn from "./../config/db.js";

const pool = await conn();


const createTicket = async (ticketData = {}, currentUserId = null) => {
  console.log("=== Creating ticket with data ===");
  console.log("ticketData:", ticketData);
  console.log("currentUserId:", currentUserId);
  
  const {
    ticket_title,
    description,
    priority,
    request_type,
    assigned_to,
    user_id,
    unit_no,
    start_date,
    start_time,
    end_time,
    attachments,
    notes,
    maintenance_costs
  } = ticketData || {};

  const ticket_id = uuidv4();
  const now = new Date();
  
  try {
    const finalUserId = user_id || currentUserId;
    
    // Determine initial ticket status based on assigned_to field
    let ticket_status;
    if (!assigned_to || assigned_to.trim() === '') {
      ticket_status = 'PENDING';
    } else {
      ticket_status = 'ASSIGNED';
    }

    const newTicket = {
      ticket_id,
      ticket_title,
      description,
      priority,
      request_type,
      assigned_to,
      user_id: finalUserId,
      unit_no,
      ticket_status, // Use the determined status
      start_date,
      end_date: null,
      start_time,
      end_time,
      attachments,
      notes,
      maintenance_costs,
      created_at: now,
      updated_at: now
    };

    console.log("New ticket object:", newTicket);

    // Remove undefined values
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

// Replace the updateTicketStatuses function with this corrected version
const updateTicketStatuses = async () => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    
    console.log(`=== Updating Ticket Statuses ===`);
    console.log(`Current Date: ${currentDate}`);
    console.log(`Current Time: ${currentTime}`);
    
    const checkQuery = `
      SELECT 
        ticket_id, 
        ticket_title, 
        ticket_status, 
        assigned_to,
        start_date,
        start_time,
        end_date,
        end_time 
      FROM tickets 
      WHERE ticket_status IN ('ASSIGNED', 'PENDING')
        AND start_date IS NOT NULL
    `;
    
    const [eligibleTickets] = await pool.query(checkQuery);
    
    
    // Update tickets to IN_PROGRESS - ONLY if they have someone assigned
    const updateToInProgressQuery = `
      UPDATE tickets 
      SET ticket_status = 'IN_PROGRESS', updated_at = NOW()
      WHERE ticket_status IN ('ASSIGNED', 'PENDING')
        -- Must have someone assigned to move to IN_PROGRESS
        AND assigned_to IS NOT NULL 
        AND assigned_to != ''
        -- Start date condition
        AND start_date <= CURDATE()
        -- Start time condition (if start_date is today, check time; if past date, ignore time)
        AND (
          start_time IS NULL 
          OR start_time = '' 
          OR (start_date < CURDATE() OR (start_date = CURDATE() AND start_time <= CURTIME()))
        )
        -- End date condition (ticket shouldn't be expired)
        AND (
          end_date IS NULL 
          OR end_date >= CURDATE()
        )
        -- End time condition (if end_date is today, check time; if future date, ignore time)
        AND (
          end_time IS NULL 
          OR end_time = ''
          OR end_date IS NULL
          OR (end_date > CURDATE() OR (end_date = CURDATE() AND end_time > CURTIME()))
        )
    `;
    
    const [result] = await pool.query(updateToInProgressQuery);
    
    
    if (result.affectedRows > 0) {
      const updatedTicketsQuery = `
        SELECT ticket_id, ticket_title, ticket_status, assigned_to, start_date, start_time, end_date, end_time 
        FROM tickets 
        WHERE ticket_status = 'IN_PROGRESS' 
          AND updated_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
      `;
      
      const [updatedTickets] = await pool.query(updatedTicketsQuery);
    }
    
    // Update to COMPLETED (only for tickets that are already IN_PROGRESS)
    const updateToCompletedQuery = `
      UPDATE tickets 
      SET ticket_status = 'COMPLETED', updated_at = NOW()
      WHERE ticket_status = 'IN_PROGRESS'
        AND end_date IS NOT NULL
        AND (
          end_date < CURDATE()
          OR (end_date = CURDATE() AND end_time IS NOT NULL AND end_time <= CURTIME())
        )
    `;
    
    const [completedResult] = await pool.query(updateToCompletedQuery);
    
    if (completedResult.affectedRows > 0) {
      
      const completedTicketsQuery = `
        SELECT ticket_id, ticket_title, ticket_status, end_date, end_time 
        FROM tickets 
        WHERE ticket_status = 'COMPLETED' 
          AND updated_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
      `;
      
      const [completedTickets] = await pool.query(completedTicketsQuery);
    }
    
    return { 
      message: "Ticket statuses updated successfully",
      inProgressCount: result.affectedRows,
      completedCount: completedResult.affectedRows,
      currentDate,
      currentTime,
      eligibleTickets: eligibleTickets.length
    };
    
  } catch (error) {
    console.error("Error updating ticket statuses:", error);
    throw new Error(`Failed to update ticket statuses: ${error.message}`);
  }
};

const getTickets = async (queryObj = {}) => {
  try {
    const { page = 1, limit = 10, ...filters } = queryObj;
    const skip = (page - 1) * limit;

    let query = `
      SELECT 
        t.*,
        CONCAT(u.first_name, ' ', u.last_name) as requested_by_name,
        u.email as requested_by_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
    `;
    const params = [];

    const ticketFilters = Object.entries(filters)
      .filter(([key, value]) => 
        value !== undefined && 
        value !== "" && 
        !['requested_by_name', 'requested_by_email'].includes(key)
      )
      .map(([key, value]) => {
        params.push(value);
        return `t.${key} = ?`;
      });

    if (filters.requested_by_name) {
      ticketFilters.push(`CONCAT(u.first_name, ' ', u.last_name) LIKE ?`);
      params.push(`%${filters.requested_by_name}%`);
    }

    if (ticketFilters.length > 0) {
      query += ' WHERE ' + ticketFilters.join(' AND ');
    }

    query += ' ORDER BY t.created_at DESC';

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(skip));

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
    `;
    const countParams = [];

    if (ticketFilters.length > 0) {
      countQuery += ' WHERE ' + ticketFilters.join(' AND ');
      
      Object.entries(filters)
        .filter(([key, value]) => 
          value !== undefined && 
          value !== "" && 
          !['requested_by_name', 'requested_by_email'].includes(key)
        )
        .forEach(([_, value]) => countParams.push(value));
      
      if (filters.requested_by_name) {
        countParams.push(`%${filters.requested_by_name}%`);
      }
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
    const query = `
      SELECT 
        t.*,
        CONCAT(u.first_name, ' ', u.last_name) as requested_by_name,
        u.email as requested_by_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
      WHERE t.ticket_id = ?
    `;
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

    const query = `
      SELECT 
        t.*,
        CONCAT(u.first_name, ' ', u.last_name) as requested_by_name,
        u.email as requested_by_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC 
      LIMIT ? OFFSET ?
    `;
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

    // ADDED ticket_status to allowed fields
    const allowedFields = [
      'ticket_title',
      'description', 
      'priority',
      'request_type',
      'assigned_to',
      'ticket_status', // <- ADDED THIS
      'start_date',
      'end_date',
      'start_time',
      'end_time',
      'maintenance_cost',
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

    console.log('Filtered data for update:', filteredData);

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

    console.log('Final update data:', updatedData);

    const fields = Object.keys(updatedData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(updatedData);

    const query = `UPDATE tickets SET ${setClause} WHERE ticket_id = ?`;
    console.log('Update query:', query);
    console.log('Update values:', [...values, ticket_id]);
    
    const [result] = await pool.query(query, [...values, ticket_id]);

    if (result.affectedRows === 0) {
      throw new Error("Ticket could not be updated");
    }

    console.log('Update result:', result);

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

const deleteTicket = async (ticketId) => {
  try {
    console.log(`Attempting to delete ticket: ${ticketId}`);
    
    // First check if ticket exists
    const checkQuery = `SELECT ticket_id, ticket_title, ticket_status FROM tickets WHERE ticket_id = ?`;
    const [existingTickets] = await pool.query(checkQuery, [ticketId]);
    
    if (existingTickets.length === 0) {
      throw new Error("Ticket not found");
    }
    
    const ticket = existingTickets[0];
    console.log(`Found ticket to delete: ${ticket.ticket_title} (Status: ${ticket.ticket_status})`);
    
    // Optional: Prevent deletion of completed tickets
    if (ticket.ticket_status === 'COMPLETED') {
      throw new Error("Cannot delete completed tickets. Archive instead if needed.");
    }
    
    // Delete the ticket
    const deleteQuery = `DELETE FROM tickets WHERE ticket_id = ?`;
    const [result] = await pool.query(deleteQuery, [ticketId]);
    
    if (result.affectedRows === 0) {
      throw new Error("Failed to delete ticket");
    }
    
    console.log(`Successfully deleted ticket: ${ticketId}`);
    
    return {
      message: "Ticket deleted successfully",
      ticket_id: ticketId,
      deletedTicket: {
        ticket_id: ticket.ticket_id,
        ticket_title: ticket.ticket_title,
        ticket_status: ticket.ticket_status
      }
    };
    
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw new Error(error.message || "Failed to delete ticket");
  }
};

export default {
  createTicket,
  updateTicketStatuses,
  getTickets,
  getSingleTicketById,
  getTicketsByUserId,
  updateTicketById,
  deleteTicket,
};
