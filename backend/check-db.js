const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function checkTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'euphoria_db'
    });

    console.log('Connected to database\n');

    // Check table structure
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    
    console.log('Table structure:');
    console.log('---------------');
    columns.forEach(col => {
      console.log(`${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });

    // Check if there are any users
    const [users] = await connection.query('SELECT id, name, phone_number FROM users LIMIT 5');
    
    console.log('\nSample users:');
    console.log('-------------');
    if (users.length === 0) {
      console.log('No users in database');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id}, Name: ${user.name}, Phone: ${user.phone_number}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTable();
