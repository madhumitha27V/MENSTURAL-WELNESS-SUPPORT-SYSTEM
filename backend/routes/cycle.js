const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Save cycle data
router.post('/track', auth, async (req, res) => {
  try {
    const { period_start_date, cycle_length } = req.body;
    const userId = req.user.id;
    const db = req.app.locals.db;

    // Check if table exists, if not create it
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS cycle_data (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        period_start_date DATE NOT NULL,
        period_end_date DATE,
        cycle_length INT NOT NULL,
        period_duration INT DEFAULT 5,
        is_current_cycle BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await db.query(createTableQuery);

    // Check if user already has cycle data
    const [existing] = await db.query(
      'SELECT * FROM cycle_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    // Validate and format the date
    if (!period_start_date || period_start_date.trim() === '') {
      return res.status(400).json({ message: 'Last period date is required' });
    }

    const dateObj = new Date(period_start_date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    const formattedDate = dateObj.toISOString().split('T')[0];

    // Calculate period end date
    const periodEndDate = new Date(dateObj);
    periodEndDate.setDate(periodEndDate.getDate() + 5);
    if (isNaN(periodEndDate.getTime())) {
      return res.status(400).json({ message: 'Error calculating period end date' });
    }
    const formattedPeriodEnd = periodEndDate.toISOString().split('T')[0];

    if (existing.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE cycle_data 
        SET period_start_date = ?, cycle_length = ?, period_end_date = ?
        WHERE user_id = ?
      `;
      await db.query(updateQuery, [formattedDate, cycle_length, formattedPeriodEnd, userId]);
    } else {
      // Insert new record
      const insertQuery = `
        INSERT INTO cycle_data (user_id, period_start_date, cycle_length, period_end_date, is_current_cycle)
        VALUES (?, ?, ?, ?, true)
      `;
      await db.query(insertQuery, [userId, formattedDate, cycle_length, formattedPeriodEnd]);
    }

    res.json({
      success: true,
      message: 'Cycle data saved successfully'
    });
  } catch (error) {
    console.error('Error saving cycle data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's cycle data
router.get('/data', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = req.app.locals.db;

    const [cycleData] = await db.query(
      'SELECT * FROM cycle_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (cycleData.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({
      success: true,
      data: cycleData[0]
    });
  } catch (error) {
    console.error('Error fetching cycle data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cycle history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = req.app.locals.db;

    const [history] = await db.query(
      'SELECT * FROM cycle_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching cycle history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save shopping list checked items
router.post('/shopping', auth, async (req, res) => {
  try {
    const { checkedItems } = req.body;
    const userId = req.user.id;
    const db = req.app.locals.db;

    // Create shopping_list table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS shopping_list (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        checked_items JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await db.query(createTableQuery);

    // Check if user already has shopping list
    const [existing] = await db.query(
      'SELECT * FROM shopping_list WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing record
      await db.query(
        'UPDATE shopping_list SET checked_items = ? WHERE user_id = ?',
        [JSON.stringify(checkedItems), userId]
      );
    } else {
      // Insert new record
      await db.query(
        'INSERT INTO shopping_list (user_id, checked_items) VALUES (?, ?)',
        [userId, JSON.stringify(checkedItems)]
      );
    }

    res.json({
      success: true,
      message: 'Shopping list saved successfully'
    });
  } catch (error) {
    console.error('Error saving shopping list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shopping list
router.get('/shopping', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = req.app.locals.db;

    // Create shopping_list table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS shopping_list (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        checked_items JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user (user_id)
      )
    `);

    const [shopping] = await db.query(
      'SELECT checked_items FROM shopping_list WHERE user_id = ?',
      [userId]
    );

    if (shopping.length === 0) {
      return res.json({ success: true, data: [] });
    }

    res.json({
      success: true,
      data: JSON.parse(shopping[0].checked_items)
    });
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
