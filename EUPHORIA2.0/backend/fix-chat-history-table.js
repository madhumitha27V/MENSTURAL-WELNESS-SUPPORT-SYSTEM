const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function fixChatHistoryTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'euphoria'
  });

  try {
    console.log('Fixing chat_history table...');
    
    // Check if is_user_message column exists
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM chat_history LIKE 'is_user_message'`
    );
    
    if (columns.length > 0) {
      console.log('Removing is_user_message column...');
      await connection.execute(
        `ALTER TABLE chat_history DROP COLUMN is_user_message`
      );
      console.log('✓ Column removed successfully');
    } else {
      console.log('✓ Column does not exist, no changes needed');
    }
    
    // Ensure model column has default value
    console.log('Setting default value for model column...');
    await connection.execute(
      `ALTER TABLE chat_history MODIFY COLUMN model VARCHAR(50) DEFAULT 'fallback'`
    );
    console.log('✓ Model column updated with default value');
    
    console.log('\n✅ chat_history table fixed successfully!');

  } catch (error) {
    console.error('Error fixing table:', error);
  } finally {
    await connection.end();
  }
}

fixChatHistoryTable();
