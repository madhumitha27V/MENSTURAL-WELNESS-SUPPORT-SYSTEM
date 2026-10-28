const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const validateRegistration = ({ name, email, password, age }) => {
  const normalizedName = String(name || '').trim();
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password || '');

  if (!normalizedName || !normalizedEmail || !normalizedPassword) {
    return 'Name, email, and password are required';
  }

  if (normalizedName.length > 100) {
    return 'Name must be 100 characters or fewer';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    return 'Enter a valid email address';
  }

  if (normalizedPassword.length < 8 || normalizedPassword.length > 72) {
    return 'Password must be between 8 and 72 characters';
  }

  if (age !== undefined && age !== null && age !== '') {
    const numericAge = Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 13 || numericAge > 120) {
      return 'Age must be a whole number between 13 and 120';
    }
  }

  return null;
};

const register = async (req, res) => {
  const { name, email, password, age } = req.body || {};
  const validationError = validateRegistration({ name, email, password, age });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    const [existingUsers] = await db.promise().query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await db.promise().query(
      'INSERT INTO users (name, email, password, age) VALUES (?, ?, ?, ?)',
      [String(name).trim(), normalizedEmail, hashedPassword, age === '' ? null : age || null],
    );

    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    console.error('Error creating user:', error.message);
    return res.status(500).json({ message: 'Unable to create account' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [results] = await db.promise().query(
      'SELECT id, name, email, password, age FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail],
    );

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, age: user.age },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Unable to sign in' });
  }
};

const getProfile = async (req, res) => {
  try {
    const [results] = await db.promise().query(
      'SELECT id, name, email, age FROM users WHERE id = ? LIMIT 1',
      [req.user.id],
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'User account not found' });
    }

    return res.json({ user: results[0] });
  } catch (error) {
    console.error('Profile lookup error:', error.message);
    return res.status(500).json({ message: 'Unable to load profile' });
  }
};

module.exports = { register, login, getProfile };