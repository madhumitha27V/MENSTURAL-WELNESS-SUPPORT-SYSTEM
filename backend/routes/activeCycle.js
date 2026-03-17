const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Save active cycle tracking data
router.post('/track', auth, async (req, res) => {
  try {
    const {
      date,
      flowLevel,
      painLevel,
      mood,
      symptoms,
      location,
      waterIntake,
      sleepHours,
      notes
    } = req.body;
    
    const userId = req.user.id;
    const db = req.app.locals.db;

    // Check if entry for this date already exists
    const [existing] = await db.execute(
      'SELECT id FROM active_cycle_tracking WHERE user_id = ? AND tracking_date = ?',
      [userId, date]
    );

    if (existing.length > 0) {
      // Update existing entry
      await db.execute(
        `UPDATE active_cycle_tracking 
         SET flow_level = ?, pain_level = ?, mood = ?, symptoms = ?, 
             location = ?, water_intake = ?, sleep_hours = ?, notes = ?
         WHERE user_id = ? AND tracking_date = ?`,
        [
          flowLevel,
          painLevel || 0,
          mood,
          JSON.stringify(symptoms || []),
          location,
          waterIntake || 0,
          sleepHours || 0,
          notes || '',
          userId,
          date
        ]
      );
    } else {
      // Insert new entry
      await db.execute(
        `INSERT INTO active_cycle_tracking 
         (user_id, tracking_date, flow_level, pain_level, mood, symptoms, 
          location, water_intake, sleep_hours, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          date,
          flowLevel,
          painLevel || 0,
          mood,
          JSON.stringify(symptoms || []),
          location,
          waterIntake || 0,
          sleepHours || 0,
          notes || ''
        ]
      );
    }

    res.json({
      success: true,
      message: 'Active cycle data saved successfully'
    });

  } catch (error) {
    console.error('Error saving active cycle data:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving active cycle data',
      error: error.message
    });
  }
});

// Get active cycle tracking history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = req.app.locals.db;
    const { limit = 30 } = req.query;

    const [history] = await db.execute(
      `SELECT * FROM active_cycle_tracking 
       WHERE user_id = ? 
       ORDER BY tracking_date DESC 
       LIMIT ?`,
      [userId, parseInt(limit)]
    );

    // Parse JSON symptoms
    const parsedHistory = history.map(entry => ({
      ...entry,
      symptoms: JSON.parse(entry.symptoms || '[]')
    }));

    res.json({
      success: true,
      data: parsedHistory
    });

  } catch (error) {
    console.error('Error fetching active cycle history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active cycle history',
      error: error.message
    });
  }
});

// Get specific date entry
router.get('/date/:date', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;
    const db = req.app.locals.db;

    const [entry] = await db.execute(
      `SELECT * FROM active_cycle_tracking 
       WHERE user_id = ? AND tracking_date = ?`,
      [userId, date]
    );

    if (entry.length > 0) {
      const parsedEntry = {
        ...entry[0],
        symptoms: JSON.parse(entry[0].symptoms || '[]')
      };
      
      res.json({
        success: true,
        data: parsedEntry
      });
    } else {
      res.json({
        success: false,
        message: 'No entry found for this date'
      });
    }

  } catch (error) {
    console.error('Error fetching entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching entry',
      error: error.message
    });
  }
});

module.exports = router;
