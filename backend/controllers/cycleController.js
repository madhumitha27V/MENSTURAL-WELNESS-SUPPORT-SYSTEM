const db = require('../config/db');
const { parseDateInput, toIsoDateString } = require('../utils/date');

// Log a new cycle
const logCycle = (req, res) => {
  const { start_date, end_date, flow_intensity, notes } = req.body;
  const user_id = req.user.id;
  const normalizedStartDate = parseDateInput(start_date);
  const normalizedEndDate = parseDateInput(end_date);

  const allowedFlowValues = ['light', 'medium', 'heavy'];

  if (!normalizedStartDate) {
    return res.status(400).json({ message: 'Start date is required' });
  }

  if (end_date && !normalizedEndDate) {
    return res.status(400).json({ message: 'End date format is invalid' });
  }

  if (flow_intensity && !allowedFlowValues.includes(flow_intensity)) {
    return res.status(400).json({ message: 'Flow intensity must be light, medium, or heavy' });
  }

  if (normalizedEndDate && new Date(normalizedEndDate) < new Date(normalizedStartDate)) {
    return res.status(400).json({ message: 'End date cannot be earlier than start date' });
  }

  db.query(
    'INSERT INTO cycles (user_id, start_date, end_date, flow_intensity, notes) VALUES (?, ?, ?, ?, ?)',
    [user_id, normalizedStartDate, normalizedEndDate, flow_intensity || null, notes || null],
    (err, result) => {
      if (err) {
        console.error('Error logging cycle:', err.message);
        return res.status(500).json({ message: 'Error logging cycle' });
      }
      res.status(201).json({ message: 'Cycle logged successfully!' });
    }
  );
};

// Get all cycles for user
const getCycles = (req, res) => {
  const user_id = req.user.id;

  db.query(
    'SELECT * FROM cycles WHERE user_id = ? ORDER BY start_date DESC',
    [user_id],
    (err, results) => {
      if (err) {
        console.error('Error fetching cycles:', err.message);
        return res.status(500).json({ message: 'Error fetching cycles' });
      }
      res.json(results);
    }
  );
};

// Predict next period
const predictNextPeriod = (req, res) => {
  const user_id = req.user.id;

  db.query(
    'SELECT start_date FROM cycles WHERE user_id = ? ORDER BY start_date DESC LIMIT 3',
    [user_id],
    (err, results) => {
      if (err) {
        console.error('Error predicting cycle:', err.message);
        return res.status(500).json({ message: 'Error predicting cycle' });
      }
      if (results.length < 2) {
        return res.json({ message: 'Need at least 2 cycles to predict' });
      }

      // Calculate average cycle length
      let totalDays = 0;
      for (let i = 0; i < results.length - 1; i++) {
        const date1 = new Date(results[i].start_date);
        const date2 = new Date(results[i + 1].start_date);
        const diff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
        totalDays += diff;
      }

      const avgCycleLength = Math.round(totalDays / (results.length - 1));
      const lastPeriod = new Date(results[0].start_date);
      const nextPeriod = new Date(lastPeriod);
      nextPeriod.setDate(nextPeriod.getDate() + avgCycleLength);

      const ovulationDate = new Date(nextPeriod);
      ovulationDate.setDate(ovulationDate.getDate() - 14);

      const fertileWindowStart = new Date(ovulationDate);
      fertileWindowStart.setDate(fertileWindowStart.getDate() - 2);

      const fertileWindowEnd = new Date(ovulationDate);
      fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 2);

      res.json({
        average_cycle_length: avgCycleLength,
        last_period: toIsoDateString(lastPeriod),
        next_period_predicted: toIsoDateString(nextPeriod),
        ovulation_date: toIsoDateString(ovulationDate),
        fertile_window_start: toIsoDateString(fertileWindowStart),
        fertile_window_end: toIsoDateString(fertileWindowEnd),
      });
    }
  );
};

module.exports = { logCycle, getCycles, predictNextPeriod };