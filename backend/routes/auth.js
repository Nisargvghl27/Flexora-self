const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// POST /api/register/
router.post('/register/', async (req, res) => {
  const { username, password, email, phone, address } = req.body;
  const missing = [];
  if (!username) missing.push('username');
  if (!password) missing.push('password');
  if (!email) missing.push('email');
  if (!phone) missing.push('phone');
  if (!address) missing.push('address');
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `);
    
    let userId;
    const transaction = db.transaction(() => {
      const result = insertUser.run(username, email, passwordHash);
      userId = result.lastInsertRowid;
      
      const insertProfile = db.prepare(`
        INSERT INTO user_profiles (user_id, phone, address)
        VALUES (?, ?, ?)
      `);
      insertProfile.run(userId, phone, address);
    });
    
    transaction();

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    return res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
});

// POST /api/login/ & /api/token/
const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
    if (!user) {
      return res.status(401).json({ detail: "No active account found with the given credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ detail: "No active account found with the given credentials." });
    }

    const payload = { user_id: user.id, username: user.username, email: user.email };
    
    const access = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '5h' });
    const refresh = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '1d' });

    return res.json({
      access,
      refresh,
      user: {
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ error: `Login failed: ${error.message}` });
  }
};

router.post('/login/', loginHandler);
router.post('/token/', loginHandler);

// GET /api/usernames/
router.get('/usernames/', (req, res) => {
  const search = req.query.search;
  try {
    let rows;
    if (search) {
      rows = db.prepare(`
        SELECT username FROM users 
        WHERE username LIKE ? AND is_active = 1 
        LIMIT 10
      `).all(`%${search}%`);
    } else {
      rows = db.prepare(`
        SELECT username FROM users 
        WHERE is_active = 1 
        LIMIT 20
      `).all();
    }
    
    const usernames = rows.map(r => r.username);
    return res.json({
      usernames,
      count: usernames.length,
      search_query: search || null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
