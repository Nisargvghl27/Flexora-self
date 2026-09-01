const express = require('express');
const router = express.Router();
const db = require('../config/database');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

// GET /api/notifications/
router.use(authMiddleware);

router.get('/', (req, res) => {
  const userId = req.user.user_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

    const countRes = db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ?`).get(userId);
    
    return res.json({
      results: notifications,
      count: countRes.count,
      total_pages: Math.ceil(countRes.count / limit)
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/notifications/unread-count/
router.get('/unread-count/', (req, res) => {
  const userId = req.user.user_id;

  try {
    const countRes = db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`).get(userId);
    return res.json({ unread_count: countRes.count });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/notifications/read-all/
router.put('/read-all/', (req, res) => {
  const userId = req.user.user_id;

  try {
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`).run(userId);
    return res.json({ message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/notifications/:id/read/
router.put('/:id/read/', (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;

  try {
    const notification = db.prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ?').get(id, userId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ?`).run(id);
    return res.json({ message: "Notification marked as read." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
