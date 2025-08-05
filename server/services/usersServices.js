import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import conn from "./../config/db.js";

const pool = await conn();

const authUser = async (email, password) => {
  try {
    console.log('Attempting login for email:', email);
    
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Find user by email
    const query = `SELECT * FROM users WHERE email = ?`;
    const [users] = await pool.query(query, [email]);

    console.log('Database query result:', users.length, 'users found');

    if (users.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = users[0];
    console.log('Found user:', user.email, 'with role:', user.role);

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      message: "Login successful",
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    throw new Error(error.message || "Failed to login");
  }
};

const createUser = async (userData = {}) => {
  const {
    first_name,
    last_name,
    business_name,
    business_type,
    avatar,
    email,
    phone_number,
    password,
    role,
    status
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

    const newUser = {
      user_id,
      first_name,
      last_name,
      business_name,
      business_type,
      avatar,
      email,
      phone_number,
      password_hash: hashedPassword, 
      role,
      status 
    };


    Object.keys(newUser).forEach(
      (key) => newUser[key] === undefined && delete newUser[key]
    );


    const fields = Object.keys(newUser).join(", ");
    const placeholders = Object.keys(newUser).map(() => "?").join(", ");
    const values = Object.values(newUser);

    const query = `INSERT INTO users (${fields}) VALUES (${placeholders})`;
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
    const { page = 1, limit = 10, ...filters } = queryObj;
    const skip = (page - 1) * limit;

    let query = 'SELECT user_id, first_name, last_name, business_name, business_type, avatar, email, phone_number, role, created_at, status FROM users WHERE role = "TENANT"';
    const params = [];

    
    const filterConditions = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => {
        params.push(value);
        return `${key} = ?`;
      });

    if (filterConditions.length > 0) {
      query += ' AND ' + filterConditions.join(' AND ');
    }

    
    query += ' ORDER BY created_at DESC';

    
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(skip));

    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role = "TENANT"';
    const countParams = [];

    if (filterConditions.length > 0) {
      countQuery += ' AND ' + filterConditions.join(' AND ');

      Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== "")
        .forEach(([_, value]) => countParams.push(value));
    }


    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      users: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
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
    const user = await getSingleUserById(user_id);

    const {
      first_name,
      last_name,
      business_name,
      business_type,
      avatar,
      email,
      phone_number,
      status
    } = userData || {};

    const updatedUser = {
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      business_name: business_name || user.business_name,
      business_type: business_type || user.business_type,
      avatar: avatar || user.avatar,
      email: email || user.email,
      phone_number: phone_number || user.phone_number,
      status: status || user.status
    };



    const fields = Object.keys(updatedUser)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updatedUser);

    const query = `UPDATE users SET ${fields} WHERE user_id = ?`;
    await pool.query(query, [...values, user_id]);

    return {
      message: "User updated successfully",
      userData: updatedUser
    };

  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(error.message || "Failed to update user");
  }
};

const deleteUserById = async (user_id = "") => {
  try {
    const user = await getSingleUserById(user_id);
    
    const query = `DELETE FROM users WHERE user_id = ?`;
    const [result] = await pool.query(query, [user_id]);
    
    
    if (result.affectedRows === 0) {
      throw new Error("User could not be deleted");
    }

    return {
      message: `User with an id of ${user_id} has been successfully deleted.`,
      deletedUser: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Failed to delete user");
  }
};

export default {
  authUser,
  createUser,
  getUsers,
  getSingleUserById,
  updateSingleUserById,
  deleteUserById,
};
