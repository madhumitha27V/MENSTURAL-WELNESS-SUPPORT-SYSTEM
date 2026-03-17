const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function fixDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'euphoria_db'
    });

    console.log('Connected to database');

    // Check current table structure
    console.log('\nChecking current table structure...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM users
    `);
    
    console.log('Current columns:', columns.map(c => c.Field).join(', '));

    // Drop and recreate the table
    console.log('\nDropping existing users table...');
    await connection.query('DROP TABLE IF EXISTS users');
    
    console.log('Creating new users table with phone column...');
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

    // Verify the new structure
    console.log('\nVerifying new table structure...');
    const [newColumns] = await connection.query(`
      SHOW COLUMNS FROM users
    `);
    
    console.log('New columns:', newColumns.map(c => c.Field).join(', '));

    console.log('\n✅ Database fixed successfully!');
    console.log('The users table now has the phone column.');
    console.log('\nRestart your server: npm run dev');

  } catch (error) {
    console.error('Fix error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDatabase();
