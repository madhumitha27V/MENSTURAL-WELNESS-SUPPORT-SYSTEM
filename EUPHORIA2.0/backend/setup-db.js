const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'euphoria_db'}`);
    console.log(`Database '${process.env.DB_NAME || 'euphoria_db'}' created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'euphoria_db'}`);

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim() && !statement.trim().startsWith('--')) {
        await connection.query(statement);
      }
    }

    console.log('Database schema created successfully');
    console.log('\n✅ Database setup complete!');
    console.log(`\nYou can now start the server with: npm run dev`);

  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
