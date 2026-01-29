
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'scied_schedule',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection (optional)
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the MySQL database.');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the MySQL database:', error);
    // Exit the process if DB connection fails, as the backend is useless without it.
    // Consider more sophisticated error handling or retry mechanisms in a production app.
    process.exit(1); 
  }
}

// testConnection(); // Call this if you want to test connection on server start

module.exports = pool;
