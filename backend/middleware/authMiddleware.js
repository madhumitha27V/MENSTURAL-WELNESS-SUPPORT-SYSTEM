const jwt = require('jsonwebtoken');

const extractToken = (headerValue) => {
  if (!headerValue) {
    return null;
  }

  if (headerValue.startsWith('Bearer ')) {
    return headerValue.slice(7).trim();
  }

  return headerValue.trim();
};

const verifyToken = (req, res, next) => {
  const token = extractToken(req.headers['authorization']);

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;