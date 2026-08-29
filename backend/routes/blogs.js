const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const timeAgo = require('../utils/timeAgo');
const { booleanConvert } = require('../utils/helpers');

const formatBlog = (req, row) => {
  const blog = {
    ...row,
    is_trending: booleanConvert(row.is_trending),
    is_published: booleanConvert(row.is_published),
    is_featured: booleanConvert(row.is_featured),
    time_ago: timeAgo(row.published_at)
  };
  if (blog.cover_image && !blog.cover_image.startsWith('http')) {
    blog.cover_image = `http://${req.get('host')}/media/blog_covers/${blog.cover_image}`;
  }
  return blog;
};

// GET /api/blogs/
router.get('/', (req, res) => {
  try {
    const { category, trending, featured, limit } = req.query;
    let query = 'SELECT * FROM blogs WHERE is_published = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (trending === 'true') {
      query += ' AND is_trending = 1';
    }
    if (featured === 'true') {
      query += ' AND is_featured = 1';
    }

    query += ' ORDER BY published_at DESC, created_at DESC';

    const limitVal = parseInt(limit, 10) || 20;
    query += ` LIMIT ${limitVal}`;

    const rows = db.prepare(query).all(...params);
    return res.json(rows.map(r => formatBlog(req, r)));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/blogs/categories/
router.get('/categories/', (req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT category FROM blogs WHERE is_published = 1 AND category IS NOT NULL').all();
    return res.json({ categories: rows.map(r => r.category) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/blogs/create/
router.post('/create/', authMiddleware, upload.single('cover_image'), (req, res) => {
  try {
    const { title, content, category, cover_image_url, meta_title, meta_description, tags } = req.body;
    let { excerpt, is_published, is_featured, is_trending } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    is_published = (is_published === 'true');
    is_featured = (is_featured === 'true');
    is_trending = (is_trending === 'true');

    if (!excerpt) {
      excerpt = content.substring(0, 200) + "...";
    }
    let finalMetaTitle = meta_title || title.substring(0, 60);
    let finalMetaDesc = meta_description || excerpt.substring(0, 160);

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (db.prepare('SELECT id FROM blogs WHERE slug = ?').get(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let coverImage = req.file ? req.file.filename : null;
    const published_at = is_published ? new Date().toISOString() : null;
    const author = req.user.username;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO blogs (
        id, title, slug, author, content, excerpt, category, 
        cover_image, cover_image_url, is_trending, is_published, is_featured, 
        meta_title, meta_description, tags, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title, slug, author, content, excerpt, category || 'General',
      coverImage, cover_image_url || null, is_trending ? 1 : 0, is_published ? 1 : 0, is_featured ? 1 : 0,
      finalMetaTitle, finalMetaDesc, tags || '', published_at
    );

    const blog = db.prepare('SELECT * FROM blogs WHERE id = ?').get(id);
    return res.status(201).json({ message: "Blog created successfully", blog: formatBlog(req, blog) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/blogs/:blog_slug/
router.get('/:blog_slug/', (req, res) => {
  try {
    const slug = req.params.blog_slug;
    db.prepare('UPDATE blogs SET views_count = views_count + 1 WHERE slug = ?').run(slug);
    
    const row = db.prepare('SELECT * FROM blogs WHERE slug = ? AND is_published = 1').get(slug);
    if (!row) {
      return res.status(404).json({ error: "Blog not found" });
    }
    return res.json(formatBlog(req, row));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/blogs/:blog_id/engagement/
router.post('/:blog_id/engagement/', (req, res) => {
  try {
    const blogId = req.params.blog_id;
    const { action } = req.body;

    const blog = db.prepare('SELECT * FROM blogs WHERE id = ? AND is_published = 1').get(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (action === 'like') {
      db.prepare('UPDATE blogs SET likes_count = likes_count + 1 WHERE id = ?').run(blogId);
      const updated = db.prepare('SELECT likes_count FROM blogs WHERE id = ?').get(blogId);
      return res.json({ message: "Blog liked successfully", likes_count: updated.likes_count });
    } else if (action === 'comment') {
      db.prepare('UPDATE blogs SET comments_count = comments_count + 1 WHERE id = ?').run(blogId);
      const updated = db.prepare('SELECT comments_count FROM blogs WHERE id = ?').get(blogId);
      return res.json({ message: "Comment added successfully", comments_count: updated.comments_count });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "like" or "comment"' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
