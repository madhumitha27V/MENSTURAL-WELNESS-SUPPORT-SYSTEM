const db = require('../config/db');
const { parseDateInput } = require('../utils/date');

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

// Log symptoms
const logSymptom = (req, res) => {
  const { date, mood, pain_level, symptoms, water_intake, sleep_hours } = req.body;
  const user_id = req.user.id;
  const normalizedDate = parseDateInput(date);
  const normalizedPain = parseOptionalNumber(pain_level);
  const normalizedWater = parseOptionalNumber(water_intake);
  const normalizedSleep = parseOptionalNumber(sleep_hours);

  const allowedMoods = ['happy', 'sad', 'anxious', 'angry', 'calm', 'tired'];

  if (!normalizedDate) {
    return res.status(400).json({ message: 'Date is required' });
  }

  if (mood && !allowedMoods.includes(mood)) {
    return res.status(400).json({ message: 'Mood value is invalid' });
  }

  if (Number.isNaN(normalizedPain) || (normalizedPain !== null && (normalizedPain < 1 || normalizedPain > 10))) {
    return res.status(400).json({ message: 'Pain level must be a number between 1 and 10' });
  }

  if (Number.isNaN(normalizedWater) || (normalizedWater !== null && normalizedWater < 0)) {
    return res.status(400).json({ message: 'Water intake must be a positive number' });
  }

  if (Number.isNaN(normalizedSleep) || (normalizedSleep !== null && normalizedSleep < 0)) {
    return res.status(400).json({ message: 'Sleep hours must be a positive number' });
  }

  db.query(
    'INSERT INTO symptoms (user_id, date, mood, pain_level, symptoms, water_intake, sleep_hours) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [user_id, normalizedDate, mood || null, normalizedPain, symptoms || null, normalizedWater, normalizedSleep],
    (err, result) => {
      if (err) {
        console.error('Error logging symptoms:', err.message);
        return res.status(500).json({ message: 'Error logging symptoms' });
      }
      res.status(201).json({ message: 'Symptoms logged successfully!' });
    }
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

module.exports = { logSymptom, getSymptoms, getAnalytics };