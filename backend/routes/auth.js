const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const db = require('../config/database');
const validate = require('../middleware/validate');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@gmail.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

const sendEmail = async (to, subject, text) => {
  // Always log for local testing
  console.log(`\n=== EMAIL DISPATCH ===\nTo: ${to}\nSubject: ${subject}\nBody: ${text}\n=====================\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'test@gmail.com') {
    console.log(`[MOCK EMAIL MODE] Credentials not configured properly. Email not sent.`);
    return;
  }
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
  } catch (err) {
    console.error('Failed to send email:', err);
  }
};

// POST /api/register/
const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 30 }).escape().withMessage('Username must be 3-30 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().escape().withMessage('Phone is required'),
  body('address').trim().notEmpty().escape().withMessage('Address is required')
];

router.post('/register/', registerValidation, validate, async (req, res) => {
  const { username, password, email, phone, address } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password_hash, verification_token)
      VALUES (?, ?, ?, ?)
    `);
    
    let userId;
    const transaction = db.transaction(() => {
      const result = insertUser.run(username, email, passwordHash, otp);
      userId = result.lastInsertRowid;
      
      const insertProfile = db.prepare(`
        INSERT INTO user_profiles (user_id, phone, address)
        VALUES (?, ?, ?)
      `);
      insertProfile.run(userId, phone, address);
    });
    
    transaction();

    await sendEmail(
      email, 
      'Welcome to Flexora - Verify your email', 
      `Your verification code is: ${otp}`
    );

    return res.status(201).json({ message: "User registered successfully. Please verify your email." });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed: Internal server error" });
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

    if (user.email_verified === 0) {
      return res.status(403).json({ detail: "Please verify your email first.", email: user.email });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ detail: "No active account found with the given credentials." });
    }

    const payload = { user_id: user.id, username: user.username, email: user.email };
    
    const access = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '5h' });
    const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '1d' });

    return res.json({
      access,
      refresh,
      user: {
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed: Internal server error" });
  }
};

const loginValidation = [
  body('username').trim().notEmpty().escape().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/login/', loginValidation, validate, loginHandler);
router.post('/token/', loginValidation, validate, loginHandler);

// POST /api/token/refresh/
router.post('/token/refresh/', (req, res) => {
  const { refresh } = req.body;
  if (!refresh) {
    return res.status(400).json({ error: "Refresh token is required." });
  }

  try {
    const payload = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = db.prepare('SELECT id, username, email FROM users WHERE id = ? AND is_active = 1').get(payload.user_id);
    if (!user) {
      return res.status(401).json({ detail: "User no longer exists or is inactive." });
    }

    const newPayload = { user_id: user.id, username: user.username, email: user.email };
    const newAccess = jwt.sign(newPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '5h' });
    const newRefresh = jwt.sign(newPayload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '1d' });

    return res.json({
      access: newAccess,
      refresh: newRefresh
    });
  } catch (error) {
    return res.status(401).json({ detail: "Invalid or expired refresh token." });
  }
});



// POST /api/verify-email/
router.post('/verify-email/', [
  body('email').isEmail(),
  body('otp').notEmpty()
], validate, (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = db.prepare('SELECT id, verification_token FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'Invalid request.' });
    if (user.verification_token !== otp) return res.status(400).json({ error: 'Invalid OTP.' });

    db.prepare('UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?').run(user.id);
    return res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/forgot-password/
router.post('/forgot-password/', [
  body('email').isEmail()
], validate, async (req, res) => {
  const { email } = req.body;
  try {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'Email not found.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    db.prepare('UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?').run(token, expires, user.id);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    await sendEmail(email, 'Password Reset Request', `Reset your password here: ${resetUrl}`);

    return res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/reset-password/
router.post('/reset-password/', [
  body('token').notEmpty(),
  body('new_password').isLength({ min: 6 })
], validate, async (req, res) => {
  const { token, new_password } = req.body;
  try {
    const user = db.prepare('SELECT id, password_reset_expires FROM users WHERE password_reset_token = ?').get(token);
    if (!user) return res.status(400).json({ error: 'Invalid token.' });
    if (new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Token expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    db.prepare('UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?').run(passwordHash, user.id);

    return res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
