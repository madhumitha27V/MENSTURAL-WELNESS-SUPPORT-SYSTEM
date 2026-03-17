const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Signup Route
router.post('/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, phone, password } = req.body;

    try {
      const db = req.app.locals.db;

      // Check if user already exists
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE phone_number = ?',
        [phone]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const [result] = await db.query(
        'INSERT INTO users (name, phone_number, password) VALUES (?, ?, ?)',
        [name, phone, hashedPassword]
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: result.insertId, phone: phone },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: result.insertId,
          name,
          phone
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error during signup' });
    }
  }
);

// Login Route
router.post('/login',
  [
    body('phone').matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { phone, password } = req.body;

    try {
      const db = req.app.locals.db;

      // Find user by phone
      const [users] = await db.query(
        'SELECT * FROM users WHERE phone_number = ?',
        [phone]
      );

      if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid phone number or password' });
      }

      const user = users[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid phone number or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone_number },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone_number
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

module.exports = router;
