const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { logCycle, getCycles, predictNextPeriod } = require('../controllers/cycleController');

router.post('/log', verifyToken, logCycle);
router.get('/all', verifyToken, getCycles);
router.get('/predict', verifyToken, predictNextPeriod);

module.exports = router;