import mysql from 'mysql2';
import dotenv from 'dotenv';
import colors from 'colors';

dotenv.config();

const conn = async () => {
  try {

    const pool = mysql.createPool({
      host: process.env.DB_HOST || "34.142.160.166",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "ambulo_db",
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
      queueLimit: 0,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      port: parseInt(process.env.DB_PORT || '3306', 10)
    }).promise();

    // Check if the connection works by getting a connection from the pool
    await pool.getConnection();
    console.log(colors.bold.yellow('Database is connected...'));

    return pool;
  } catch (error) {
    // Handle different types of MySQL errors
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(colors.red('Invalid MySQL credentials. Please check your username and password.'));
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(colors.red('Database does not exist. Please verify the database name.'));
    } else if (error.code === 'ECONNREFUSED') {
      console.error(colors.red('Connection refused. Check if your MySQL server is running.'));
    } else {
      // General error
      console.error(colors.red(`Error connecting to the database: ${error.message}`));
    }
    throw new Error(error.message);
  }
};

export default conn;