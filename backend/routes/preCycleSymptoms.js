const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Save pre-cycle symptoms
router.post('/track', auth, async (req, res) => {
  try {
    const {
      date,
      physicalSymptoms,
      emotionalSymptoms,
      painLevel,
      notes
    } = req.body;
    
    const userId = req.user.id;
    const db = req.app.locals.db;
    const trackingDate = date || new Date().toISOString().split('T')[0];

    // Check if entry for this date already exists
    const [existing] = await db.execute(
      'SELECT id FROM pre_cycle_symptoms WHERE user_id = ? AND tracking_date = ?',
      [userId, trackingDate]
    );

    if (existing.length > 0) {
      // Update existing entry
      await db.execute(
        `UPDATE pre_cycle_symptoms 
         SET physical_symptoms = ?, emotional_symptoms = ?, pain_level = ?, notes = ?
         WHERE user_id = ? AND tracking_date = ?`,
        [
          JSON.stringify(physicalSymptoms || []),
          JSON.stringify(emotionalSymptoms || []),
          painLevel || 0,
          notes || '',
          userId,
          trackingDate
        ]
      );
    } else {
      // Insert new entry
      await db.execute(
        `INSERT INTO pre_cycle_symptoms 
         (user_id, tracking_date, physical_symptoms, emotional_symptoms, pain_level, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          trackingDate,
          JSON.stringify(physicalSymptoms || []),
          JSON.stringify(emotionalSymptoms || []),
          painLevel || 0,
          notes || ''
        ]
      );
    }

    res.json({
      success: true,
      message: 'Pre-cycle symptoms saved successfully'
    });

  } catch (error) {
    console.error('Error saving pre-cycle symptoms:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving pre-cycle symptoms',
      error: error.message
    });
  }
});

// Get pre-cycle symptoms history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = req.app.locals.db;
    const { limit = 30 } = req.query;

    const [history] = await db.execute(
      `SELECT * FROM pre_cycle_symptoms 
       WHERE user_id = ? 
       ORDER BY tracking_date DESC 
       LIMIT ?`,
      [userId, parseInt(limit)]
    );

    // Parse JSON symptoms
    const parsedHistory = history.map(entry => ({
      ...entry,
      physical_symptoms: JSON.parse(entry.physical_symptoms || '[]'),
      emotional_symptoms: JSON.parse(entry.emotional_symptoms || '[]')
    }));

    res.json({
      success: true,
      data: parsedHistory
    });

  } catch (error) {
    console.error('Error fetching pre-cycle history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pre-cycle history',
      error: error.message
    });
  }
});

module.exports = router;
