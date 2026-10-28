const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { predictNextPeriod } = require('../controllers/cycleController');

const router = express.Router();

router.get('/', verifyToken, predictNextPeriod);

module.exports = router;
