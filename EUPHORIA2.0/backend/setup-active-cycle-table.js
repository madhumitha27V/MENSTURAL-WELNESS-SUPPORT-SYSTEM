const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createActiveCycleTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'euphoria'
  });

  try {
    console.log('Creating active_cycle_tracking table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS active_cycle_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tracking_date DATE NOT NULL,
        flow_level VARCHAR(20),
        pain_level INT,
        mood VARCHAR(50),
        symptoms JSON,
        location VARCHAR(50),
        water_intake INT,
        sleep_hours DECIMAL(3,1),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, tracking_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableQuery);
    console.log('✓ active_cycle_tracking table created successfully');

  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await connection.end();
  }
}

createActiveCycleTable();
