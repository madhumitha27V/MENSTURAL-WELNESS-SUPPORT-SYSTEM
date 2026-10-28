const db = require('../config/db');
const { parseDateInput, addDaysToPlainDate, parsePlainDate } = require('../utils/date');

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
    'SELECT start_date FROM cycles WHERE user_id = ? ORDER BY start_date DESC',
    [user_id],
    (err, results) => {
      if (err) {
        console.error('Error predicting cycle:', err.message);
        return res.status(500).json({ message: 'Error predicting cycle' });
      }
      if (results.length < 2) {
        return res.json({ message: 'Need at least 2 cycles to predict' });
      }

      const intervals = [];
      for (let i = 0; i < results.length - 1; i++) {
        const newer = parsePlainDate(results[i].start_date);
        const older = parsePlainDate(results[i + 1].start_date);
        if (newer && older) intervals.push(Math.round((newer - older) / 86400000));
      }
      if (intervals.length === 0) return res.json({ message: 'Need at least 2 valid cycle dates to predict' });

      const sortedIntervals = [...intervals].sort((left, right) => left - right);
      const totalDays = intervals.reduce((sum, value) => sum + value, 0);
      const average = totalDays / intervals.length;
      const median = sortedIntervals.length % 2
        ? sortedIntervals[Math.floor(sortedIntervals.length / 2)]
        : (sortedIntervals[sortedIntervals.length / 2 - 1] + sortedIntervals[sortedIntervals.length / 2]) / 2;
      const lastPeriod = String(results[0].start_date).slice(0, 10);
      const nextPeriod = addDaysToPlainDate(lastPeriod, Math.round(average));
      const predictionRangeStart = addDaysToPlainDate(lastPeriod, Math.min(...intervals));
      const predictionRangeEnd = addDaysToPlainDate(lastPeriod, Math.max(...intervals));
      const meanDeviation = intervals.reduce((sum, value) => sum + ((value - average) ** 2), 0) / intervals.length;
      const variabilityDays = Math.sqrt(meanDeviation);
      const confidence = variabilityDays / average > 0.2 ? 'low' : variabilityDays / average > 0.1 ? 'medium' : 'higher';

      const ovulationDate = addDaysToPlainDate(nextPeriod, -14);
      const fertileWindowStart = addDaysToPlainDate(ovulationDate, -2);
      const fertileWindowEnd = addDaysToPlainDate(ovulationDate, 2);

      res.json({
        average_cycle_length: Number(average.toFixed(1)),
        median_cycle_length: Number(median.toFixed(1)),
        cycle_length_min: Math.min(...intervals),
        cycle_length_max: Math.max(...intervals),
        variability_days: Number(variabilityDays.toFixed(1)),
        forecast_confidence: confidence,
        last_period: lastPeriod,
        next_period_predicted: nextPeriod,
        prediction_range_start: predictionRangeStart,
        prediction_range_end: predictionRangeEnd,
        ovulation_date: ovulationDate,
        fertile_window_start: fertileWindowStart,
        fertile_window_end: fertileWindowEnd,
      });
    }
  );
};

module.exports = { logCycle, getCycles, predictNextPeriod, updateCycle, deleteCycle };