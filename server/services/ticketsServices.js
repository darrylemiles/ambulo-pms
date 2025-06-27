const createTicket = async (ticketData = {}) => {
  try {
    return {
      message: "Ticket created successfully",
      ticketData,
    };
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw new Error(error.message || "Failed to create ticket");
  }
};

const getTickets = async (queryObj = {}) => {
  try {
    return [
      { id: 1, title: "Sample Ticket 1", status: "open" },
      { id: 2, title: "Sample Ticket 2", status: "closed" },
    ];
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw new Error(error.message || "Failed to fetch tickets");
  }
};

const getSingleTicketById = async (ticket_id = "") => {
  try {
    return {
      message: "Ticket retrieved successfully",
      ticket_id,
    };
  } catch (error) {
    console.error("Error getting ticket:", error);
    throw new Error(error.message || "Failed to get ticket");
  }
};

const getTicketsByUserId = async (user_id = "") => {
  try {
    // Mock data for demonstration purposes
    const user1 = {
      id: 1,
      name: "User One",
      tickets: [
        { id: 1002, title: "User One Ticket 1", status: "open" },
        { id: 2002, title: "User One Ticket 2", status: "closed" },
        { id: 3002, title: "User One Ticket 3", status: "open" },
      ],
    };
    const user2 = {
      id: 2,
      name: "User Two",
      tickets: [
        { id: 2005, title: "User Two Ticket 1", status: "closed" },
        { id: 3190, title: "User Two Ticket 2", status: "open" },
      ],
    };

    return user_id === "1"
      ? user1.tickets
      : user_id === "2"
      ? user2.tickets
      : [];
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw new Error(error.message || "Failed to fetch user tickets");
  }
};

const updateTicket = async (ticket_id = "", ticketData = {}) => {
  try {
    return {
      message: "Ticket updated successfully",
      ticket_id,
      ticketData,
    };
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw new Error(error.message || "Failed to update ticket");
  }
};

const deleteTicket = async (ticket_id = "") => {
  try {
    return {
      message: "Ticket deleted successfully",
      ticket_id,
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
  updateTicket,
  deleteTicket,
};
