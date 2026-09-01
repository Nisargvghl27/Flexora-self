const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { booleanConvert } = require('../utils/helpers');

const formatLookbook = (row) => ({
  ...row,
  is_active: booleanConvert(row.is_active)
});

const formatProduct = (row) => ({
  ...row,
  price: row.price.toFixed(2),
  is_active: booleanConvert(row.is_active)
});

// GET /api/lookbooks/
router.get('/', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM lookbooks WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC').all(req.user.user_id);
    const lookbooks = rows.map(lb => {
      const itemsCount = db.prepare('SELECT COUNT(*) as count FROM lookbook_items WHERE lookbook_id = ?').get(lb.id).count;
      return { ...formatLookbook(lb), items_count: itemsCount };
    });
    return res.json(lookbooks);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/lookbooks/
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, description, style_persona } = req.body;
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO lookbooks (id, user_id, title, description, style_persona)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.user_id, title, description || '', style_persona);

    const lookbook = db.prepare('SELECT * FROM lookbooks WHERE id = ?').get(id);
    return res.status(201).json(formatLookbook(lookbook));
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/lookbooks/style/:style_persona/
router.get('/style/:style_persona/', authMiddleware, (req, res) => {
  try {
    const { style_persona } = req.params;
    const userId = req.user.user_id;

    let lookbook = db.prepare('SELECT * FROM lookbooks WHERE user_id = ? AND style_persona = ? AND is_active = 1').get(userId, style_persona);
    let status = 200;

    if (!lookbook) {
      const styleMap = {
        'minimalist-style': { title: "Minimalist Style Lookbook", desc: "Clean lines, quality over quantity, and timeless pieces that speak to your sophisticated aesthetic.", category: "Minimalist" },
        'bohemian-style': { title: "Bohemian Style Lookbook", desc: "Free-spirited, artistic, and effortlessly chic pieces that celebrate your creative soul.", category: "Bohemian" },
        'vintage-style': { title: "Vintage Style Lookbook", desc: "Timeless classics and retro-inspired pieces that showcase your appreciation for enduring style.", category: "Vintage" },
        'casual-style': { title: "Casual Style Lookbook", desc: "Comfortable, versatile, and effortlessly stylish pieces for your everyday adventures.", category: "Casual" },
        'streetwear-style': { title: "Streetwear Style Lookbook", desc: "Urban, edgy, and contemporary pieces that reflect your street-smart style.", category: "Streetwear" },
        'formal-style': { title: "Formal Style Lookbook", desc: "Elegant, sophisticated, and polished pieces for your most important occasions.", category: "Formal" }
      };

      const mapped = styleMap[style_persona] || { title: "Custom Lookbook", desc: "Your personal curated collection.", category: null };
      const id = uuidv4();

      db.prepare(`
        INSERT INTO lookbooks (id, user_id, title, description, style_persona)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, userId, mapped.title, mapped.desc, style_persona);

      if (mapped.category) {
        const products = db.prepare('SELECT * FROM products WHERE category = ? AND is_active = 1 AND stock_quantity > 0 LIMIT 12').all(mapped.category);
        const insertItem = db.prepare('INSERT INTO lookbook_items (id, lookbook_id, product_id, item_order) VALUES (?, ?, ?, ?)');
        const transaction = db.transaction(() => {
          products.forEach((p, idx) => insertItem.run(uuidv4(), id, p.id, idx));
        });
        transaction();
      }

      lookbook = db.prepare('SELECT * FROM lookbooks WHERE id = ?').get(id);
      status = 201;
    }

    const itemsRows = db.prepare('SELECT * FROM lookbook_items WHERE lookbook_id = ? ORDER BY item_order ASC').all(lookbook.id);
    const items = itemsRows.map(item => {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      return {
        id: item.id,
        added_at: item.added_at,
        order: item.item_order,
        product: product ? formatProduct(product) : null
      };
    }).filter(item => item.product !== null);

    const userRow = db.prepare('SELECT id, username, first_name, last_name, email FROM users WHERE id = ?').get(userId);

    const response = {
      ...formatLookbook(lookbook),
      user: userRow,
      items,
      items_count: items.length
    };

    return res.status(status).json(response);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/lookbooks/:lookbook_id/
router.get('/:lookbook_id/', authMiddleware, (req, res) => {
  try {
    const lookbook = db.prepare('SELECT * FROM lookbooks WHERE id = ? AND user_id = ? AND is_active = 1').get(req.params.lookbook_id, req.user.user_id);
    if (!lookbook) return res.status(404).json({ error: "Lookbook not found" });

    const itemsRows = db.prepare('SELECT * FROM lookbook_items WHERE lookbook_id = ? ORDER BY item_order ASC').all(lookbook.id);
    const items = itemsRows.map(item => {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      return {
        id: item.id,
        added_at: item.added_at,
        order: item.item_order,
        product: product ? formatProduct(product) : null
      };
    }).filter(item => item.product !== null);

    const userRow = db.prepare('SELECT id, username, first_name, last_name, email FROM users WHERE id = ?').get(req.user.user_id);

    return res.json({
      ...formatLookbook(lookbook),
      user: userRow,
      items,
      items_count: items.length
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/lookbooks/:lookbook_id/
router.put('/:lookbook_id/', authMiddleware, (req, res) => {
  try {
    const { title, description, style_persona } = req.body;
    const { lookbook_id } = req.params;

    const existing = db.prepare('SELECT * FROM lookbooks WHERE id = ? AND user_id = ?').get(lookbook_id, req.user.user_id);
    if (!existing) return res.status(404).json({ error: "Lookbook not found" });

    db.prepare(`
      UPDATE lookbooks 
      SET title = COALESCE(?, title), 
          description = COALESCE(?, description), 
          style_persona = COALESCE(?, style_persona),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(title, description, style_persona, lookbook_id);

    return res.json({ message: "Lookbook updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/lookbooks/:lookbook_id/
router.delete('/:lookbook_id/', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE lookbooks SET is_active = 0 WHERE id = ? AND user_id = ?').run(req.params.lookbook_id, req.user.user_id);
    return res.json({ message: "Lookbook deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/lookbooks/:lookbook_id/items/
router.post('/:lookbook_id/items/', authMiddleware, (req, res) => {
  try {
    const { product_id, order } = req.body;
    const lookbook_id = req.params.lookbook_id;
    
    const lookbook = db.prepare('SELECT id FROM lookbooks WHERE id = ? AND user_id = ?').get(lookbook_id, req.user.user_id);
    if (!lookbook) return res.status(404).json({ error: "Lookbook not found" });

    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const id = uuidv4();
    db.prepare('INSERT INTO lookbook_items (id, lookbook_id, product_id, item_order) VALUES (?, ?, ?, ?)').run(id, lookbook_id, product_id, order || 0);

    const item = db.prepare('SELECT * FROM lookbook_items WHERE id = ?').get(id);
    const prodRow = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);

    return res.status(201).json({
      id: item.id,
      added_at: item.added_at,
      order: item.item_order,
      product: formatProduct(prodRow)
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: "Product already in lookbook" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/lookbooks/:lookbook_id/items/:item_id/
router.delete('/:lookbook_id/items/:item_id/', authMiddleware, (req, res) => {
  try {
    const { lookbook_id, item_id } = req.params;
    const lookbook = db.prepare('SELECT id FROM lookbooks WHERE id = ? AND user_id = ?').get(lookbook_id, req.user.user_id);
    if (!lookbook) return res.status(404).json({ error: "Lookbook not found" });

    db.prepare('DELETE FROM lookbook_items WHERE id = ? AND lookbook_id = ?').run(item_id, lookbook_id);
    return res.json({ message: "Item removed from lookbook" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
