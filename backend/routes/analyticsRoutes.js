const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/symptomController');

const router = express.Router();

router.get('/', verifyToken, getAnalytics);

module.exports = router;
