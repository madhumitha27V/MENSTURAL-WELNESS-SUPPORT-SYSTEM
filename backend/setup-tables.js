const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'euphoria_db'
    });

    console.log('Connected to MySQL database');

    // Create cycle_data table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cycle_data (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        last_period_date DATE NOT NULL,
        cycle_length INT NOT NULL,
        next_period_date DATE NOT NULL,
        days_remaining INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);
    console.log('✓ cycle_data table created/verified');

    // Create shopping_list table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shopping_list (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        checked_items JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user (user_id),
        INDEX idx_user_id (user_id)
      )
    `);
    console.log('✓ shopping_list table created/verified');

    console.log('\n✅ All tables setup successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('\nDatabase setup complete. You can now start the server.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
