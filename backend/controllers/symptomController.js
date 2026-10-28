const db = require('../config/db');
const { parseDateInput } = require('../utils/date');

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const validateSymptom = ({ date, mood, pain_level, water_intake, sleep_hours }) => {
  const normalizedDate = parseDateInput(date);
  const normalizedPain = parseOptionalNumber(pain_level);
  const normalizedWater = parseOptionalNumber(water_intake);
  const normalizedSleep = parseOptionalNumber(sleep_hours);
  const allowedMoods = ['happy', 'sad', 'anxious', 'angry', 'calm', 'tired'];

  if (!normalizedDate) return { error: 'Date is required' };
  if (mood && !allowedMoods.includes(mood)) return { error: 'Mood value is invalid' };
  if (Number.isNaN(normalizedPain) || (normalizedPain !== null && (normalizedPain < 1 || normalizedPain > 10))) {
    return { error: 'Pain level must be a number between 1 and 10' };
  }
  if (Number.isNaN(normalizedWater) || (normalizedWater !== null && (normalizedWater < 0 || normalizedWater > 10))) {
    return { error: 'Water intake must be between 0 and 10 litres' };
  }
  if (Number.isNaN(normalizedSleep) || (normalizedSleep !== null && (normalizedSleep < 0 || normalizedSleep > 24))) {
    return { error: 'Sleep hours must be between 0 and 24' };
  }
  if (normalizedDate > new Date().toISOString().split('T')[0]) return { error: 'Date cannot be in the future' };

  return { normalizedDate, normalizedPain, normalizedWater, normalizedSleep };
};

// Log symptoms
const logSymptom = (req, res) => {
  const { date, mood, pain_level, symptoms, water_intake, sleep_hours } = req.body;
  const user_id = req.user.id;
  const validation = validateSymptom(req.body || {});

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  db.query(
    'INSERT INTO symptoms (user_id, date, mood, pain_level, symptoms, water_intake, sleep_hours) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [user_id, validation.normalizedDate, mood || null, validation.normalizedPain, symptoms || null, validation.normalizedWater, validation.normalizedSleep],
    (err, result) => {
      if (err) {
        console.error('Error logging symptoms:', err.message);
        return res.status(500).json({ message: 'Error logging symptoms' });
      }
      res.status(201).json({ message: 'Symptoms logged successfully!' });
    }
  );
};

const updateSymptom = (req, res) => {
  const validation = validateSymptom(req.body || {});
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  db.query(
    `UPDATE symptoms
     SET date = ?, mood = ?, pain_level = ?, symptoms = ?, water_intake = ?, sleep_hours = ?
     WHERE id = ? AND user_id = ?`,
    [
      validation.normalizedDate,
      req.body.mood || null,
      validation.normalizedPain,
      req.body.symptoms || null,
      validation.normalizedWater,
      validation.normalizedSleep,
      req.params.id,
      req.user.id,
    ],
    (err, result) => {
      if (err) {
        console.error('Error updating symptoms:', err.message);
        return res.status(500).json({ message: 'Error updating symptoms' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Symptom entry not found' });
      }
      return res.json({ message: 'Symptoms updated successfully!' });
    },
  );
};

const deleteSymptom = (req, res) => {
  db.query(
    'DELETE FROM symptoms WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    (err, result) => {
      if (err) {
        console.error('Error deleting symptoms:', err.message);
        return res.status(500).json({ message: 'Error deleting symptoms' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Symptom entry not found' });
      }
      return res.json({ message: 'Symptoms deleted successfully!' });
    },
  );
};

// Get all symptoms
const getSymptoms = (req, res) => {
  const user_id = req.user.id;

  db.query(
    'SELECT * FROM symptoms WHERE user_id = ? ORDER BY date DESC',
    [user_id],
    (err, results) => {
      if (err) {
        console.error('Error fetching symptoms:', err.message);
        return res.status(500).json({ message: 'Error fetching symptoms' });
      }
      res.json(results);
    }
  );
};

// Get symptom analytics
const getAnalytics = (req, res) => {
  const user_id = req.user.id;

  db.query(
    `SELECT 
      AVG(pain_level) as avg_pain,
      AVG(water_intake) as avg_water,
      AVG(sleep_hours) as avg_sleep,
      mood,
      COUNT(mood) as mood_count
     FROM symptoms 
     WHERE user_id = ?
     GROUP BY mood
     ORDER BY mood_count DESC`,
    [user_id],
    (err, results) => {
      if (err) {
        console.error('Error fetching analytics:', err.message);
        return res.status(500).json({ message: 'Error fetching analytics' });
      }
      res.json(results);
    }
  );
};

module.exports = { logSymptom, getSymptoms, getAnalytics, updateSymptom, deleteSymptom };