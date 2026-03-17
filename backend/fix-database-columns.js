const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function fixDatabaseColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'euphoria'
  });

  try {
    console.log('Checking and fixing database columns...\n');
    
    // Check cycle_data table
    console.log('1. Checking cycle_data table...');
    try {
      const [cycleColumns] = await connection.execute('DESCRIBE cycle_data');
      console.log('Current columns:', cycleColumns.map(c => c.Field).join(', '));
      
      // Check if columns need to be added/renamed
      const columnNames = cycleColumns.map(c => c.Field);
      
      if (!columnNames.includes('last_period_date')) {
        console.log('Adding missing columns to cycle_data...');
        await connection.execute(`
          ALTER TABLE cycle_data 
          ADD COLUMN last_period_date DATE,
          ADD COLUMN cycle_length INT DEFAULT 28,
          ADD COLUMN next_period_date DATE,
          ADD COLUMN days_remaining INT
        `);
        console.log('✓ Columns added successfully');
      } else {
        console.log('✓ cycle_data table is correct');
      }
    } catch (error) {
      console.log('Error with cycle_data:', error.message);
    }
    
    // Check chat_history table
    console.log('\n2. Checking chat_history table...');
    try {
      const [chatColumns] = await connection.execute('DESCRIBE chat_history');
      console.log('Current columns:', chatColumns.map(c => c.Field).join(', '));
      
      const columnNames = chatColumns.map(c => c.Field);
      
      if (!columnNames.includes('model')) {
        console.log('Adding model column to chat_history...');
        await connection.execute(`
          ALTER TABLE chat_history 
          ADD COLUMN model VARCHAR(50) DEFAULT 'fallback'
        `);
        console.log('✓ Model column added successfully');
      } else {
        console.log('✓ chat_history table is correct');
      }
    } catch (error) {
      console.log('Error with chat_history:', error.message);
    }
    
    console.log('\n✅ Database columns fixed successfully!');

  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await connection.end();
  }
}

fixDatabaseColumns();
