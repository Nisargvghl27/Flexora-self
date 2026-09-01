const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Fetch community feed
router.get('/feed', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = db.prepare(`
      SELECT cp.*, u.username as author_name, up.profile_picture as avatar_url
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN user_profiles up ON cp.user_id = up.user_id
      ORDER BY cp.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM community_posts').get().count;

    // We can also fetch the current user's liked posts if a token was provided,
    // but the feed is public. We'll leave likes as a simple client-side array of IDs for authenticated users if we want.
    // For now, just return the posts.
    res.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch community feed' });
  }
});

// Create a new post
router.post('/feed', auth, upload.single('image'), (req, res) => {
  try {
    const { content } = req.body;
    let imageUrl = null;

    if (req.file && req.file.filename) {
      imageUrl = '/media/' + req.file.filename;
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    
    db.prepare(`
      INSERT INTO community_posts (id, user_id, content, image_url)
      VALUES (?, ?, ?, ?)
    `).run(id, req.user.user_id, content, imageUrl);

    const newPost = db.prepare(`
      SELECT cp.*, u.username as author_name, up.profile_picture as avatar_url
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN user_profiles up ON cp.user_id = up.user_id
      WHERE cp.id = ?
    `).get(id);

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Toggle like
router.post('/feed/:id/like', auth, (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.user_id;

    const existingLike = db.prepare('SELECT * FROM community_post_likes WHERE post_id = ? AND user_id = ?').get(postId, userId);

    if (existingLike) {
      // Unlike
      db.prepare('DELETE FROM community_post_likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
      db.prepare('UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = ?').run(postId);
      res.json({ message: 'Unliked successfully', liked: false });
    } else {
      // Like
      db.prepare('INSERT INTO community_post_likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
      db.prepare('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
      res.json({ message: 'Liked successfully', liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Delete a post
router.delete('/feed/:id', auth, (req, res) => {
  try {
    const postId = req.params.id;
    const post = db.prepare('SELECT user_id FROM community_posts WHERE id = ?').get(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    db.prepare('DELETE FROM community_posts WHERE id = ?').run(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get user liked posts (useful for client to highlight the heart icon)
router.get('/likes', auth, (req, res) => {
  try {
    const likes = db.prepare('SELECT post_id FROM community_post_likes WHERE user_id = ?').all(req.user.user_id);
    res.json(likes.map(l => l.post_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch liked posts' });
  }
});

module.exports = router;
