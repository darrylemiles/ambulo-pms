import { v4 as uuidv4 } from "uuid";
import conn from "./../config/db.js";

const pool = await conn();

const createTicket = async (ticketData = {}, currentUserId = null) => {
  const {
    ticket_title,
    description,
    priority,
    request_type,
    assigned_to,
    user_id,
    lease_id,
    start_datetime,
    end_datetime,
    notes,
    maintenance_costs,
    attachments,
  } = ticketData || {};

  const ticket_id = uuidv4();
  const now = new Date();

  try {
    const finalUserId = user_id || currentUserId;

    let ticket_status;
    if (!assigned_to || assigned_to.trim() === "") {
      ticket_status = "PENDING";
    } else {
      ticket_status = "ASSIGNED";
    }

    const newTicket = {
  ticket_id,
  ticket_title,
  description,
  priority,
  request_type,
  assigned_to,
  user_id: finalUserId,
  lease_id,
  ticket_status,
  start_datetime,
  end_datetime,
  notes,
  maintenance_costs,
  created_at: now,
  updated_at: now,
    };

    Object.keys(newTicket).forEach(
      (key) => newTicket[key] === undefined && delete newTicket[key]
    );

    const fields = Object.keys(newTicket).join(", ");
    const placeholders = Object.keys(newTicket)
      .map(() => "?")
      .join(", ");
    const values = Object.values(newTicket);

    const query = `INSERT INTO tickets (${fields}) VALUES (${placeholders})`;
    await pool.query(query, values);

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const attachQuery = `INSERT INTO ticket_attachments (ticket_id, url) VALUES ?`;
      const attachValues = attachments.map(url => [ticket_id, url]);
      await pool.query(attachQuery, [attachValues]);
    }

    return {
      message: "Ticket created successfully",
      ticket_id,
      ticketData: newTicket,
    };
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw new Error(error.message || "Failed to create ticket");
  }
};

const updateTicketStatuses = async () => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0];

    const checkQuery = `
      SELECT 
        ticket_id, 
        ticket_title, 
        ticket_status, 
        assigned_to,
        start_datetime,
        end_datetime
      FROM tickets 
      WHERE ticket_status IN ('ASSIGNED', 'PENDING')
        AND start_datetime IS NOT NULL
    `;

    const [eligibleTickets] = await pool.query(checkQuery);

    const updateToInProgressQuery = `
      UPDATE tickets 
      SET ticket_status = 'IN_PROGRESS', updated_at = NOW()
      WHERE ticket_status IN ('ASSIGNED', 'PENDING')
        AND assigned_to IS NOT NULL 
        AND assigned_to != ''
        AND start_datetime <= NOW()
        AND (end_datetime IS NULL OR end_datetime >= NOW())
    `;

    const [result] = await pool.query(updateToInProgressQuery);

    const updateToCompletedQuery = `
      UPDATE tickets 
      SET ticket_status = 'COMPLETED', updated_at = NOW()
      WHERE ticket_status = 'IN_PROGRESS'
        AND end_datetime IS NOT NULL
        AND end_datetime <= NOW()
    `;

    const [completedResult] = await pool.query(updateToCompletedQuery);

    return {
      message: "Ticket statuses updated successfully",
      inProgressCount: result.affectedRows,
      completedCount: completedResult.affectedRows,
      currentDate,
      currentTime,
      eligibleTickets: eligibleTickets.length,
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
        u.email as requested_by_email,
        (
          SELECT JSON_ARRAYAGG(url) FROM ticket_attachments ta WHERE ta.ticket_id = t.ticket_id
        ) as attachments,
        p.property_name as property_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN leases l ON t.lease_id = l.lease_id
      LEFT JOIN properties p ON l.property_id = p.property_id
    `;
    const params = [];

    const ticketFilters = Object.entries(filters)
      .filter(
        ([key, value]) =>
          value !== undefined &&
          value !== "" &&
          !["requested_by_name", "requested_by_email"].includes(key)
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
      query += " WHERE " + ticketFilters.join(" AND ");
    }

    query += " ORDER BY t.created_at DESC";

    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(skip));

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN leases l ON t.lease_id = l.lease_id
      LEFT JOIN properties p ON l.property_id = p.property_id
    `;
    const countParams = [];

    if (ticketFilters.length > 0) {
      countQuery += " WHERE " + ticketFilters.join(" AND ");

      Object.entries(filters)
        .filter(
          ([key, value]) =>
            value !== undefined &&
            value !== "" &&
            !["requested_by_name", "requested_by_email"].includes(key)
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
        hasPrevPage: page > 1,
      },
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
        u.email as requested_by_email,
        (
          SELECT JSON_ARRAYAGG(url) FROM ticket_attachments ta WHERE ta.ticket_id = t.ticket_id
        ) as attachments,
        p.property_name as property_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
      LEFT JOIN leases l ON t.lease_id = l.lease_id
      LEFT JOIN properties p ON l.property_id = p.property_id
      WHERE t.ticket_id = ?
    `;
    const [rows] = await pool.query(query, [ticket_id]);

    if (rows.length === 0) {
      throw new Error("Ticket not found");
    }

    return {
      message: "Ticket retrieved successfully",
      ticket: rows[0],
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
        u.email as requested_by_email,
        (
          SELECT JSON_ARRAYAGG(url) FROM ticket_attachments ta WHERE ta.ticket_id = t.ticket_id
        ) as attachments
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.user_id
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [
      user_id,
      parseInt(limit),
      parseInt(skip),
    ]);

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
        hasPrevPage: page > 1,
      },
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
      "ticket_title",
      "description",
      "priority",
      "request_type",
      "assigned_to",
      "ticket_status",
      "start_datetime",
      "end_datetime",
      "maintenance_costs",
      "notes"
    ];

    const filteredData = {};
    Object.keys(ticketData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = ticketData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    if (ticketData.attachments && Array.isArray(ticketData.attachments) && ticketData.attachments.length > 0) {
      await pool.query(`DELETE FROM ticket_attachments WHERE ticket_id = ?`, [ticket_id]);
      const attachQuery = `INSERT INTO ticket_attachments (ticket_id, url) VALUES ?`;
      const attachValues = ticketData.attachments.map(url => [ticket_id, url]);
      await pool.query(attachQuery, [attachValues]);
    }

    const updatedData = {
      ...filteredData,
      updated_at: new Date(),
    };

    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );

    const fields = Object.keys(updatedData);
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
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
      updatedFields: Object.keys(filteredData),
    };
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw new Error(error.message || "Failed to update ticket");
  }
};

const deleteTicket = async (ticketId) => {
  try {
    const checkQuery = `SELECT ticket_id, ticket_title, ticket_status FROM tickets WHERE ticket_id = ?`;
    const [existingTickets] = await pool.query(checkQuery, [ticketId]);

    if (existingTickets.length === 0) {
      throw new Error("Ticket not found");
    }

    const ticket = existingTickets[0];

    if (ticket.ticket_status === "COMPLETED") {
      throw new Error(
        "Cannot delete completed tickets. Archive instead if needed."
      );
    }

    const deleteQuery = `DELETE FROM tickets WHERE ticket_id = ?`;
    const [result] = await pool.query(deleteQuery, [ticketId]);

    if (result.affectedRows === 0) {
      throw new Error("Failed to delete ticket");
    }

    return {
      message: "Ticket deleted successfully",
      ticket_id: ticketId,
      deletedTicket: {
        ticket_id: ticket.ticket_id,
        ticket_title: ticket.ticket_title,
        ticket_status: ticket.ticket_status,
      },
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
