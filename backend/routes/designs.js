const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Fetch approved designs for showcase
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const designs = db.prepare(`
      SELECT ds.*, u.username as designer_name, up.profile_picture as avatar_url
      FROM design_submissions ds
      JOIN users u ON ds.user_id = u.id
      LEFT JOIN user_profiles up ON ds.user_id = up.user_id
      WHERE ds.status = 'approved'
      ORDER BY ds.votes_count DESC, ds.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare("SELECT COUNT(*) as count FROM design_submissions WHERE status = 'approved'").get().count;

    res.json({
      designs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

// Submit a new design
router.post('/', auth, upload.single('image'), (req, res) => {
  try {
    const { title, description } = req.body;
    let imageUrl = null;

    if (req.file && req.file.filename) {
      imageUrl = '/media/' + req.file.filename;
    }

    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and image are required' });
    }

    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    
    db.prepare(`
      INSERT INTO design_submissions (id, user_id, title, description, image_url, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(id, req.user.user_id, title, description, imageUrl);

    res.status(201).json({ message: 'Design submitted successfully and is pending approval' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit design' });
  }
});

// Toggle vote
router.post('/:id/vote', auth, (req, res) => {
  try {
    const submissionId = req.params.id;
    const userId = req.user.user_id;

    // Check if submission is approved
    const submission = db.prepare('SELECT status FROM design_submissions WHERE id = ?').get(submissionId);
    if (!submission || submission.status !== 'approved') {
      return res.status(400).json({ error: 'Design not found or not approved' });
    }

    const existingVote = db.prepare('SELECT * FROM design_votes WHERE submission_id = ? AND user_id = ?').get(submissionId, userId);

    if (existingVote) {
      // Remove vote
      db.prepare('DELETE FROM design_votes WHERE submission_id = ? AND user_id = ?').run(submissionId, userId);
      db.prepare('UPDATE design_submissions SET votes_count = votes_count - 1 WHERE id = ?').run(submissionId);
      res.json({ message: 'Vote removed', voted: false });
    } else {
      // Add vote
      db.prepare('INSERT INTO design_votes (submission_id, user_id) VALUES (?, ?)').run(submissionId, userId);
      db.prepare('UPDATE design_submissions SET votes_count = votes_count + 1 WHERE id = ?').run(submissionId);
      res.json({ message: 'Voted successfully', voted: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle vote' });
  }
});

// Get user votes
router.get('/votes', auth, (req, res) => {
  try {
    const votes = db.prepare('SELECT submission_id FROM design_votes WHERE user_id = ?').all(req.user.user_id);
    res.json(votes.map(v => v.submission_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user votes' });
  }
});

module.exports = router;
