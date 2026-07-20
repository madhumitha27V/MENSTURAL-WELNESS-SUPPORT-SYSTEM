const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { logSymptom, getSymptoms, getAnalytics } = require('../controllers/symptomController');

router.post('/log', verifyToken, logSymptom);
router.get('/all', verifyToken, getSymptoms);
router.get('/analytics', verifyToken, getAnalytics);

module.exports = router;