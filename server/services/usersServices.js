import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import conn from "./../config/db.js";

const pool = await conn();

const createUser = async (userData = {}) => {
  // const {
  //   first_name,
  //   last_name,
  //   business_name,
  //   business_type,
  //   email,
  //   phone_number,
  //   password
  // } = userData || {};

  const {
    first_name,
    avatar,
    password
  } = userData || {};

  const user_id = uuidv4();

  try {
    console.log("Creating user with ID:", user_id);
    console.log("Creating user with data:", userData);

    if (!password) {
      throw new Error("Password is required to create a user.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // const newUser = {
    //   user_id,
    //   first_name,
    //   last_name,
    //   business_name,
    //   business_type,
    //   email,
    //   phone_number,
    //   password_hash: hashedPassword, 
    //   isAdmin: 0,
    // };

    const newUser = {
      user_id,
      first_name,
      avatar,
      password_hash: hashedPassword
    };

    Object.keys(newUser).forEach(
      (key) => newUser[key] === undefined && delete newUser[key]
    );

    

    const fields = Object.keys(newUser).join(", ");
    const placeholders = Object.keys(newUser).map(() => "?").join(", ");
    const values = Object.values(newUser);

    // const query = `INSERT INTO users (${fields}) VALUES (${placeholders})`;
    const query = `INSERT INTO test_user (${fields}) VALUES (${placeholders})`;
    await pool.query(query, values);

    return {
      message: "User created successfully",
      userData: newUser
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "Failed to create user");
  }
};

const getUsers = async (queryObj = {}) => {
  try {
    let query = 'SELECT * FROM users WHERE isAdmin = 0';
    const params = [];

    const filters = Object.entries(queryObj)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => {
        params.push(value);
        return `${key} = ?`;
      });

    if (filters.length > 0) {
      query += ' AND ' + filters.join(' AND ');
    }

    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error getting users:", error);
    throw new Error(error.message || "Failed to get users");
  }
};

const getSingleUserById = async (user_id = "") => {
  try {
    const query = `
      SELECT * FROM users WHERE user_id = ?
    `;

    const [user] = await pool.query(query, [user_id]);

    if (user.length === 0) {
      throw new Error("[User] not found!.");
    }

    return user[0];

  } catch (error) {
    console.error("Error getting user:", error);
    throw new Error(error.message || "Failed to get user");
  }
};

const updateSingleUserById = async (user_id = "", userData = {}) => {
  try {
    return {
      message: `${user_id} has been successfully updated!!!!!`,
      userData,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(error.message || "Failed to update user");
  }
};

const deleteUserById = async (user_id = "") => {
  try {
    const user = await getSingleUserById(user_id);

    return `User with an id of ${user_id} has been successfully deleted.`;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Failed to delete user");
  }
};

export default {
  createUser,
  getUsers,
  getSingleUserById,
  updateSingleUserById,
  deleteUserById,
};
