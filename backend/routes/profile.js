const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const fs = require('fs');
const path = require('path');

// GET /api/usernames/
router.get('/usernames/', async (req, res) => {
  try {
    const search = req.query.search || '';
    if (!search || search.trim().length === 0) {
      return res.json([]);
    }
    const users = db.prepare('SELECT username FROM users WHERE username LIKE ? LIMIT 5').all(`%${search}%`);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/profile/
router.get('/profile/', authMiddleware, (req, res) => {
  try {
    const row = db.prepare(`
      SELECT u.username, u.email, u.date_joined, u.is_staff, u.is_superuser,
             p.phone, p.address, p.profile_picture, p.selected_avatar, p.account_type
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(req.user.user_id);

    if (!row) return res.status(404).json({ error: "Profile not found" });

    const response = {
      username: row.username,
      email: row.email,
      date_joined: new Date(row.date_joined).toISOString(),
      is_staff: !!row.is_staff,
      is_superuser: !!row.is_superuser,
      phone: row.phone,
      address: row.address,
    };

    if (row.profile_picture) {
      response.profile_picture = `${req.protocol}://${req.get('host')}/media/profile_pictures/${row.profile_picture}`;
    }
    if (row.selected_avatar) response.selected_avatar = row.selected_avatar;
    if (row.account_type) response.account_type = row.account_type;

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/profile/
const profileValidation = [
  body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters').escape(),
  body('email').optional().trim().isEmail().normalizeEmail().withMessage('Must be a valid email'),
  body('phone').optional().trim().escape(),
  body('address').optional().trim().escape(),
];

router.put('/profile/', authMiddleware, upload.single('profile_picture'), profileValidation, validate, (req, res) => {
  try {
    const { username, email, phone, address, selected_avatar, account_type } = req.body;
    const userId = req.user.user_id;

    if (username) {
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
      if (existing) {
        return res.status(400).json({ error: "Username already exists." });
      }
      db.prepare('UPDATE users SET username = ?, email = ? WHERE id = ?').run(username, email, userId);
    }

    const currentProfile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
    let profilePicture = currentProfile ? currentProfile.profile_picture : null;

    if (req.file) {
      if (profilePicture) {
        const oldPath = path.join(__dirname, '..', 'media', 'profile_pictures', profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      profilePicture = req.file.filename;
    }

    if (currentProfile) {
      db.prepare(`
        UPDATE user_profiles 
        SET phone = ?, address = ?, selected_avatar = ?, account_type = ?, profile_picture = ?
        WHERE user_id = ?
      `).run(phone || '', address || '', selected_avatar || null, account_type || null, profilePicture || null, userId);
    } else {
      db.prepare(`
        INSERT INTO user_profiles (user_id, phone, address, selected_avatar, account_type, profile_picture)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, phone || '', address || '', selected_avatar || null, account_type || null, profilePicture || null);
    }

    return res.json({ message: "Profile updated successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/change-password/
router.put('/change-password/', authMiddleware, async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  if (!current_password || !new_password || !confirm_password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (new_password !== confirm_password) {
    return res.status(400).json({ error: "New passwords do not match" });
  }

  try {
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.user_id);
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, req.user.user_id);
    return res.json({ message: "Password changed successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/delete-account/
router.delete('/delete-account/', authMiddleware, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const userId = req.user.user_id;
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid action" }); // Matches Django DRF specific exact message request
    }

    const profile = db.prepare('SELECT profile_picture FROM user_profiles WHERE user_id = ?').get(userId);
    if (profile && profile.profile_picture) {
      const picPath = path.join(__dirname, '..', 'media', 'profile_pictures', profile.profile_picture);
      if (fs.existsSync(picPath)) {
        fs.unlinkSync(picPath);
      }
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return res.json({ message: "Account deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
