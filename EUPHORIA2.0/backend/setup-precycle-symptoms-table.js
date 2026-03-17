const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createPreCycleSymptomsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'euphoria'
  });

  try {
    console.log('Creating pre_cycle_symptoms table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS pre_cycle_symptoms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tracking_date DATE NOT NULL,
        physical_symptoms JSON,
        emotional_symptoms JSON,
        pain_level INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, tracking_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableQuery);
    console.log('✓ pre_cycle_symptoms table created successfully');

  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await connection.end();
  }
}

createPreCycleSymptomsTable();
