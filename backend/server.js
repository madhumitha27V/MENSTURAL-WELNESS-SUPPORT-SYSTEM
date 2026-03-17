const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'euphoria',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('MySQL Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const cycleRoutes = require('./routes/cycle');
const chatRoutes = require('./routes/chat');
const activeCycleRoutes = require('./routes/activeCycle');
const preCycleSymptomsRoutes = require('./routes/preCycleSymptoms');

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EUPHORIA API' });
});

app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'OK', message: 'Server is running', database: 'Connected' });
  } catch (error) {
    res.json({ status: 'OK', message: 'Server is running', database: 'Disconnected' });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/active-cycle', activeCycleRoutes);
app.use('/api/pre-cycle-symptoms', preCycleSymptomsRoutes);

// Make pool available to routes
app.locals.db = pool;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
