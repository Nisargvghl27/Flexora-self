const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/wishlist/
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const items = db.prepare(`
      SELECT w.*, p.name as product_name, p.price as product_price, p.image_url, p.image
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
    `).all(userId);
    
    // Format response to match frontend expectations
    const formattedItems = items.map(item => ({
      ...item,
      product: {
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        image_url: item.image_url,
        image: item.image
      }
    }));
    
    res.json(formattedItems);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/wishlist/
router.post('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    const existing = db.prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?').get(userId, product_id);
    
    if (existing) {
      return res.status(400).json({ error: 'Item already in wishlist' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO wishlist_items (id, user_id, product_id)
      VALUES (?, ?, ?)
    `).run(id, userId, product_id);
    
    res.status(201).json({ message: 'Added to wishlist', id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/wishlist/:item_id/
router.delete('/:item_id/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const itemId = req.params.item_id;

    const result = db.prepare('DELETE FROM wishlist_items WHERE id = ? AND user_id = ?').run(itemId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE by product_id (helper route for toggling wishlist)
router.delete('/product/:product_id/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const productId = req.params.product_id;

    const result = db.prepare('DELETE FROM wishlist_items WHERE product_id = ? AND user_id = ?').run(productId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not in wishlist' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
