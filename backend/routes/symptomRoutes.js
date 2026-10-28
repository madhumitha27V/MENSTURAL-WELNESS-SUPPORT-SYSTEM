const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  logSymptom,
  getSymptoms,
  getAnalytics,
  updateSymptom,
  deleteSymptom,
} = require('../controllers/symptomController');

router.post('/log', verifyToken, logSymptom);
router.get('/all', verifyToken, getSymptoms);
router.get('/analytics', verifyToken, getAnalytics);
router.put('/:id', verifyToken, updateSymptom);
router.delete('/:id', verifyToken, deleteSymptom);

module.exports = router;