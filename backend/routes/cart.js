const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/cart/
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const items = db.prepare(`
      SELECT c.*, p.name as product_name, p.price as product_price, p.image_url, p.image
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.added_at DESC
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

// POST /api/cart/
router.post('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id, quantity = 1, size = '', color = '' } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    // Check if item already exists with same size/color
    const existing = db.prepare(`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?
    `).get(userId, product_id, size, color);

    if (existing) {
      // Update quantity
      const newQty = existing.quantity + quantity;
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
      return res.json({ message: 'Cart updated', id: existing.id, quantity: newQty });
    } else {
      // Insert new
      const id = uuidv4();
      db.prepare(`
        INSERT INTO cart_items (id, user_id, product_id, quantity, size, color)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, userId, product_id, quantity, size, color);
      return res.status(201).json({ message: 'Added to cart', id });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/cart/:item_id/
router.put('/:item_id/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const itemId = req.params.item_id;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const result = db.prepare(`
      UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?
    `).run(quantity, itemId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Quantity updated' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/cart/:item_id/
router.delete('/:item_id/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const itemId = req.params.item_id;

    const result = db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(itemId, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/cart/
router.delete('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
