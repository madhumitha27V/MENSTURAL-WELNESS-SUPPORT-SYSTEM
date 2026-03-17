const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function migrateDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'euphoria_db'
    });

    console.log('Connected to database');

    // Check if email column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email'
    `, [process.env.DB_NAME || 'euphoria_db']);

    if (columns.length > 0) {
      console.log('Migrating from email to phone...');
      
      // Drop the existing table and recreate with correct schema
      await connection.query('DROP TABLE IF EXISTS users');
      console.log('Dropped old users table');

      // Create new table with phone
      await connection.query(`
        CREATE TABLE users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(10) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_phone (phone)
        )
      `);
      console.log('Created new users table with phone column');
    } else {
      console.log('Phone column already exists or table does not exist');
      
      // Create table if it doesn't exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(10) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_phone (phone)
        )
      `);
      console.log('Ensured users table exists with correct schema');
    }

    console.log('\n✅ Database migration complete!');
    console.log('You can now start the server with: npm run dev');

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateDatabase();
