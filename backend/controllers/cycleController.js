const db = require('../config/db');
const { parseDateInput, toIsoDateString } = require('../utils/date');

const validateCycle = ({ start_date, end_date, flow_intensity, notes }) => {
  const normalizedStartDate = parseDateInput(start_date);
  const normalizedEndDate = parseDateInput(end_date);
  const allowedFlowValues = ['light', 'medium', 'heavy'];

  if (!normalizedStartDate) return { error: 'Start date is required' };
  if (end_date && !normalizedEndDate) return { error: 'End date format is invalid' };
  if (flow_intensity && !allowedFlowValues.includes(flow_intensity)) {
    return { error: 'Flow intensity must be light, medium, or heavy' };
  }
  if (normalizedEndDate && new Date(normalizedEndDate) < new Date(normalizedStartDate)) {
    return { error: 'End date cannot be earlier than start date' };
  }
  if (notes !== undefined && notes !== null && String(notes).length > 1000) {
    return { error: 'Notes must be 1000 characters or fewer' };
  }

  return { normalizedStartDate, normalizedEndDate };
};

// Log a new cycle
const logCycle = (req, res) => {
  const { start_date, end_date, flow_intensity, notes } = req.body;
  const user_id = req.user.id;
  const validation = validateCycle({ start_date, end_date, flow_intensity, notes });

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  db.query(
    'INSERT INTO cycles (user_id, start_date, end_date, flow_intensity, notes) VALUES (?, ?, ?, ?, ?)',
    [user_id, validation.normalizedStartDate, validation.normalizedEndDate, flow_intensity || null, notes || null],
    (err, result) => {
      if (err) {
        console.error('Error logging cycle:', err.message);
        return res.status(500).json({ message: 'Error logging cycle' });
      }
      res.status(201).json({ message: 'Cycle logged successfully!' });
    }
  );
};

const updateCycle = (req, res) => {
  const validation = validateCycle(req.body || {});
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  db.query(
    `UPDATE cycles
     SET start_date = ?, end_date = ?, flow_intensity = ?, notes = ?
     WHERE id = ? AND user_id = ?`,
    [
      validation.normalizedStartDate,
      validation.normalizedEndDate,
      req.body.flow_intensity || null,
      req.body.notes || null,
      req.params.id,
      req.user.id,
    ],
    (err, result) => {
      if (err) {
        console.error('Error updating cycle:', err.message);
        return res.status(500).json({ message: 'Error updating cycle' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cycle not found' });
      }
      return res.json({ message: 'Cycle updated successfully!' });
    },
  );
};

const deleteCycle = (req, res) => {
  db.query(
    'DELETE FROM cycles WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    (err, result) => {
      if (err) {
        console.error('Error deleting cycle:', err.message);
        return res.status(500).json({ message: 'Error deleting cycle' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cycle not found' });
      }
      return res.json({ message: 'Cycle deleted successfully!' });
    },
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

module.exports = { logCycle, getCycles, predictNextPeriod, updateCycle, deleteCycle };