import expressAsync from "express-async-handler";
import usersServices from "../services/usersServices.js";

const createUser = expressAsync(async (req, res) => {
  try {
    const avatar = req.files && req.files['avatar'] ? req.files['avatar'][0].path : "";
    const payload = { ...req.body, avatar };

    const response = await usersServices.createUser(payload);
    res.json(response);
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "Failed to create user");
  }
});

const getUsers = expressAsync(async (req, res) => {
  try {
    const response = await usersServices.getUsers(req.query);
    res.json(response);
  } catch (error) {
    console.error("Error getting users:", error);
    throw new Error(error.message || "Failed to get users");
  }
});

const getSingleUserById = expressAsync(async (req, res) => {
  try {
    const response = await usersServices.getSingleUserById(req.params.user_id);
    res.json(response);
  } catch (error) {
    console.error("Error getting user:", error);
    throw new Error(error.message || "Failed to get user");
  }
});

const updateSingleUserById = expressAsync(async (req, res) => {
  try {
    const avatar = req.files && req.files['avatar'] ? req.files['avatar'][0].path : "";
    const payload = { ...req.body, avatar };

    const response = await usersServices.updateSingleUserById(
      req.params.user_id,
      payload
    );
    res.json(response);
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(error.message || "Failed to update user");
  }
});

const deleteUserById = expressAsync(async (req, res) => {
  try {
    const response = await usersServices.deleteUserById(req.params.user_id);
    res.json(response);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Failed to delete user");
  }
});

export {
  createUser,
  getUsers,
  getSingleUserById,
  updateSingleUserById,
  deleteUserById,
};
