const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  logCycle,
  getCycles,
  predictNextPeriod,
  updateCycle,
  deleteCycle,
} = require('../controllers/cycleController');

router.post('/log', verifyToken, logCycle);
router.get('/all', verifyToken, getCycles);
router.get('/predict', verifyToken, predictNextPeriod);
router.put('/:id', verifyToken, updateCycle);
router.delete('/:id', verifyToken, deleteCycle);

module.exports = router;