const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function createChatHistoryTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'euphoria'
  });

  try {
    console.log('Creating chat_history table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS chat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        model VARCHAR(50) DEFAULT 'fallback',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_created (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableQuery);
    console.log('✓ chat_history table created successfully');

  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await connection.end();
  }
}

createChatHistoryTable();
