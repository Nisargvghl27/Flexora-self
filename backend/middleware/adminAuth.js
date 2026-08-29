const db = require('../config/database');
const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });

    // Verify admin status from the database
    const user = db.prepare('SELECT id, is_staff, is_superuser FROM users WHERE id = ? AND is_active = 1').get(decoded.user_id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    if (!user.is_staff && !user.is_superuser) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decoded;
    next();
  });
};

module.exports = adminAuthMiddleware;
