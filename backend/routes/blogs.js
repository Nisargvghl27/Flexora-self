const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const db = require('../config/database');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const timeAgo = require('../utils/timeAgo');
const { booleanConvert } = require('../utils/helpers');

const formatBlog = (req, row) => {
  let wordCount = 0;
  if (row.content) {
    // Strip HTML tags for word count if it contains TipTap HTML
    const textContent = row.content.replace(/<[^>]*>?/gm, '');
    wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  }
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const blog = {
    ...row,
    is_trending: booleanConvert(row.is_trending),
    is_published: booleanConvert(row.is_published),
    is_featured: booleanConvert(row.is_featured),
    time_ago: timeAgo(row.published_at),
    reading_time: `${readingTime} min read`
  };
  if (blog.cover_image && !blog.cover_image.startsWith('http')) {
    blog.cover_image = `${req.protocol}://${req.get('host')}/media/blog_covers/${blog.cover_image}`;
  }
  return blog;
};

// GET /api/blogs/
router.get('/', (req, res) => {
  try {
    const { category, trending, featured, limit, search, tag, author } = req.query;
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
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (tag) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }
    if (author) {
      query += ' AND author = ?';
      params.push(author);
    }

    query += ' ORDER BY published_at DESC, created_at DESC';

    const pageVal = parseInt(req.query.page, 10) || 1;
    const limitVal = parseInt(limit, 10) || 20;
    const offsetVal = (pageVal - 1) * limitVal;
    
    // Get total count for pagination
    const countQuery = query.replace('*', 'COUNT(*) as count');
    const totalCount = db.prepare(countQuery).get(...params).count;

    query += ` LIMIT ? OFFSET ?`;
    params.push(limitVal, offsetVal);

    const rows = db.prepare(query).all(...params);
    return res.json({
      results: rows.map(r => formatBlog(req, r)),
      total: totalCount,
      page: pageVal,
      limit: limitVal,
      total_pages: Math.ceil(totalCount / limitVal)
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/blogs/categories/
router.get('/categories/', (req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT category FROM blogs WHERE is_published = 1 AND category IS NOT NULL').all();
    return res.json({ categories: rows.map(r => r.category) });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/blogs/create/
const createBlogValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters').escape(),
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category').trim().notEmpty().withMessage('Category is required').escape(),
];

router.post('/create/', authMiddleware, upload.single('cover_image'), createBlogValidation, validate, (req, res) => {
  try {
    const { title, content, category, cover_image_url, meta_title, meta_description, tags } = req.body;
    let { excerpt, is_published, is_featured, is_trending } = req.body;

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
    return res.status(500).json({ error: "Internal server error" });
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
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/blogs/:blog_id/engagement/
router.post('/:blog_id/engagement/', authMiddleware, (req, res) => {
  try {
    const blogId = req.params.blog_id;
    const { action } = req.body;

    const blog = db.prepare('SELECT * FROM blogs WHERE id = ? AND is_published = 1').get(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (action === 'like') {
      try {
        db.prepare('INSERT INTO blog_likes (blog_id, user_id) VALUES (?, ?)').run(blogId, req.user.user_id);
        db.prepare('UPDATE blogs SET likes_count = likes_count + 1 WHERE id = ?').run(blogId);
        const updated = db.prepare('SELECT likes_count FROM blogs WHERE id = ?').get(blogId);
        return res.json({ message: "Blog liked successfully", likes_count: updated.likes_count });
      } catch (err) {
        // Handle UNIQUE constraint failure if already liked
        if (err.message.includes('UNIQUE constraint failed')) {
          db.prepare('DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?').run(blogId, req.user.user_id);
          db.prepare('UPDATE blogs SET likes_count = likes_count - 1 WHERE id = ?').run(blogId);
          const updated = db.prepare('SELECT likes_count FROM blogs WHERE id = ?').get(blogId);
          return res.json({ message: "Blog unliked", likes_count: updated.likes_count });
        }
        throw err;
      }
    } else if (action === 'comment') {
      // Legacy comment endpoint, handled by real comments now but keeping for backward compatibility
      db.prepare('UPDATE blogs SET comments_count = comments_count + 1 WHERE id = ?').run(blogId);
      const updated = db.prepare('SELECT comments_count FROM blogs WHERE id = ?').get(blogId);
      return res.json({ message: "Comment added successfully", comments_count: updated.comments_count });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "like" or "comment"' });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/blogs/:slug/comments/
router.get('/:slug/comments/', (req, res) => {
  try {
    const slug = req.params.slug;
    const blog = db.prepare('SELECT id FROM blogs WHERE slug = ?').get(slug);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const commentsRows = db.prepare(`
      SELECT c.*, u.username, p.profile_picture, p.selected_avatar 
      FROM blog_comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE c.blog_id = ?
      ORDER BY c.created_at ASC
    `).all(blog.id);

    // Structure into nested comments (1 level deep)
    const commentsMap = new Map();
    const rootComments = [];

    // First pass: add all comments to map, create replies array, format date
    commentsRows.forEach(c => {
      const formattedComment = {
        ...c,
        time_ago: timeAgo(c.created_at),
        replies: []
      };
      commentsMap.set(c.id, formattedComment);
      
      if (!c.parent_id) {
        rootComments.push(formattedComment);
      }
    });

    // Second pass: attach replies to their parent
    commentsRows.forEach(c => {
      if (c.parent_id) {
        const parent = commentsMap.get(c.parent_id);
        if (parent) {
          parent.replies.push(commentsMap.get(c.id));
        }
      }
    });

    return res.json(rootComments);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/blogs/:slug/comments/
router.post('/:slug/comments/', authMiddleware, (req, res) => {
  try {
    const slug = req.params.slug;
    const { content, parent_id } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }

    const blog = db.prepare('SELECT id FROM blogs WHERE slug = ?').get(slug);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const id = uuidv4();
    db.prepare(`
      INSERT INTO blog_comments (id, blog_id, user_id, parent_id, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, blog.id, req.user.user_id, parent_id || null, content);

    // Update comments_count
    const count = db.prepare('SELECT COUNT(*) as count FROM blog_comments WHERE blog_id = ?').get(blog.id).count;
    db.prepare('UPDATE blogs SET comments_count = ? WHERE id = ?').run(count, blog.id);

    return res.status(201).json({ message: "Comment added successfully", id, comments_count: count });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/blogs/:slug/comments/:comment_id/
router.delete('/:slug/comments/:comment_id/', authMiddleware, (req, res) => {
  try {
    const { slug, comment_id } = req.params;
    
    const blog = db.prepare('SELECT id FROM blogs WHERE slug = ?').get(slug);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const comment = db.prepare('SELECT * FROM blog_comments WHERE id = ?').get(comment_id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    
    if (comment.user_id !== req.user.user_id) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    db.prepare('DELETE FROM blog_comments WHERE id = ?').run(comment_id);
    
    // Update comments_count
    const count = db.prepare('SELECT COUNT(*) as count FROM blog_comments WHERE blog_id = ?').get(blog.id).count;
    db.prepare('UPDATE blogs SET comments_count = ? WHERE id = ?').run(count, blog.id);

    return res.json({ message: "Comment deleted successfully", comments_count: count });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
