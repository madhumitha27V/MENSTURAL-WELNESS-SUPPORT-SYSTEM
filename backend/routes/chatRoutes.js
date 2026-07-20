const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { chat } = require('../controllers/chatController');
router.post('/', verifyToken, chat);
module.exports = router;
