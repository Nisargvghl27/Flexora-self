const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { booleanConvert } = require('../utils/helpers');

const formatProduct = (row) => ({
  ...row,
  price: row.price.toFixed(2),
  is_active: booleanConvert(row.is_active)
});

// GET /api/products/
router.get('/', (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (featured === 'true') {
      query += ' AND stock_quantity > 20';
    }

    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params);
    return res.json(rows.map(formatProduct));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/products/categories/
router.get('/categories/', (req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT category FROM products WHERE is_active = 1 AND category IS NOT NULL').all();
    const categories = rows.map(r => r.category);
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:product_id/
router.get('/:product_id/', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(req.params.product_id);
    if (!row) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(formatProduct(row));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
