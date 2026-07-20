const db = require('../config/db');

const getHealthStatus = (req, res) => {
  db.query('SELECT 1 AS ok', (error) => {
    if (error) {
      return res.status(503).json({
        status: 'degraded',
        database: 'unreachable',
        uptime: process.uptime(),
      });
    }

    return res.json({
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });
};

module.exports = { getHealthStatus };