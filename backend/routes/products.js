const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { booleanConvert } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const formatProduct = (row) => ({
  ...row,
  price: row.price.toFixed(2),
  is_active: booleanConvert(row.is_active)
});

// GET /api/products/
router.get('/', (req, res) => {
  try {
    const { category, featured, search, sort, page, limit } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (featured === 'true') {
      query += ' AND stock_quantity > 20';
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM (${query})`;
    const totalCount = db.prepare(countQuery).get(...params).count;

    // Sorting
    let orderBy = ' ORDER BY created_at DESC';
    if (sort === 'price_asc') {
      orderBy = ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      orderBy = ' ORDER BY price DESC';
    } else if (sort === 'newest') {
      orderBy = ' ORDER BY created_at DESC';
    } else if (sort === 'name_asc') {
      orderBy = ' ORDER BY name ASC';
    }
    query += orderBy;

    // Pagination
    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 12;
    const offset = (pageNum - 1) * limitNum;

    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const rows = db.prepare(query).all(...params);
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.json({
      results: rows.map(formatProduct),
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      total_pages: totalPages
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/categories/
router.get('/categories/', (req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT category FROM products WHERE is_active = 1 AND category IS NOT NULL').all();
    const categories = rows.map(r => r.category);
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:product_id/
router.get('/:product_id/', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(req.params.product_id);
    if (!row) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Get average rating and count
    const stats = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = ?').get(req.params.product_id);
    
    const formatted = formatProduct(row);
    formatted.average_rating = stats.avg ? parseFloat(stats.avg.toFixed(1)) : 0;
    formatted.review_count = stats.count || 0;
    
    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id/reviews/
router.get('/:id/reviews/', (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = db.prepare(`
      SELECT r.*, u.username 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(productId);
    
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products/:id/reviews/
const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review_text').optional().trim().escape()
];

router.post('/:id/reviews/', authMiddleware, reviewValidation, validate, (req, res) => {
  try {
    const userId = req.user.user_id;
    const productId = req.params.id;
    const { rating, review_text } = req.body;

    const existing = db.prepare('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?').get(userId, productId);
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO reviews (id, user_id, product_id, rating, review_text)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, productId, rating, review_text || '');

    return res.status(201).json({ message: 'Review submitted successfully', id });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/products/:id/reviews/:review_id/
router.delete('/:id/reviews/:review_id/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const reviewId = req.params.review_id;

    const result = db.prepare('DELETE FROM reviews WHERE id = ? AND user_id = ?').run(reviewId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    return res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
