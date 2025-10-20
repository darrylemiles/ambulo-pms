import expressAsync from "express-async-handler";
import messagesServices from "../services/messagesServices.js";

const createMessage = expressAsync(async (req, res) => {
  try {
    const io = req.app.get("io");
    const response = await messagesServices.createMessage(req.body, io);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating message:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to create message" });
  }
});

const getMessagesByQuery = expressAsync(async (req, res) => {
  try {
    const response = await messagesServices.getMessagesByQuery(req.query);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting messages:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to get messages" });
  }
});

const getMessageById = expressAsync(async (req, res) => {
  try {
    const { message_id } = req.params;
    const response = await messagesServices.getMessageById(message_id);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting message:", error);
    res.status(404).json({ message: error.message || "Message not found" });
  }
});

const updateMessageById = expressAsync(async (req, res) => {
  try {
    const { message_id } = req.params;
    const io = req.app.get("io");
    const response = await messagesServices.updateMessageById(
      message_id,
      req.body,
      io
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating message:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to update message" });
  }
});

const deleteMessageById = expressAsync(async (req, res) => {
  try {
    const { message_id } = req.params;
    const io = req.app.get("io");
    const response = await messagesServices.deleteMessageById(message_id, io);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error deleting message:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to delete message" });
  }
});

const getConversations = expressAsync(async (req, res) => {
  try {
    const { user_id } = req.params;
    const response = await messagesServices.getConversations(user_id);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to get conversations" });
  }
});

const uploadAttachments = expressAsync(async (req, res) => {
  try {
    const files = (req.files && req.files["attachments"]) || [];
    const attachments = files.map((f) => ({
      filename: f.originalname,
      url: f.path,
      mimetype: f.mimetype,
      size: f.size,
    }));
    res.status(201).json({ message: "Attachments uploaded", attachments });
  } catch (error) {
    console.error("Error uploading attachments:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to upload attachments" });
  }
});

export {
  createMessage,
  getMessagesByQuery,
  getMessageById,
  updateMessageById,
  deleteMessageById,
  getConversations,
  uploadAttachments,
};
