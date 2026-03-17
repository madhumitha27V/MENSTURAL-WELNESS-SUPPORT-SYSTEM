const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function addPasswordColumn() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'euphoria_db'
    });

    console.log('Connected to database\n');

    // Add password column
    console.log('Adding password column...');
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN password VARCHAR(255) NULL AFTER phone_number
    `);

    console.log('✅ Password column added successfully');

    // Verify
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    console.log('\nUpdated table structure:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });

    console.log('\n⚠️  Note: Existing users need to set passwords. They should re-register.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addPasswordColumn();
