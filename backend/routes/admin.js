const express = require('express');
const router = express.Router();
const db = require('../config/database');
const adminAuth = require('../middleware/adminAuth');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ storage: multer.memoryStorage() });
const { booleanConvert } = require('../utils/helpers');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Helper to calculate pagination
const paginate = (req, totalCount) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);
  return { page, limit, offset, total_pages: totalPages };
};

// ==========================================
// Dashboard Stats
// ==========================================
router.get('/stats/', adminAuth, (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalBlogs = db.prepare('SELECT COUNT(*) as count FROM blogs').get().count;
    const totalCommunity = db.prepare('SELECT COUNT(*) as count FROM community_members').get().count;
    const totalLookbooks = db.prepare('SELECT COUNT(*) as count FROM lookbooks').get().count;

    const recentUsers = db.prepare('SELECT id, username, email, date_joined, is_active FROM users ORDER BY date_joined DESC LIMIT 5').all();
    const recentBlogs = db.prepare('SELECT id, title, author, created_at, is_published FROM blogs ORDER BY created_at DESC LIMIT 5').all();

    res.json({
      counts: {
        users: totalUsers,
        products: totalProducts,
        blogs: totalBlogs,
        community_members: totalCommunity,
        lookbooks: totalLookbooks
      },
      recent_users: recentUsers.map(u => ({ ...u, is_active: booleanConvert(u.is_active) })),
      recent_blogs: recentBlogs.map(b => ({ ...b, is_published: booleanConvert(b.is_published) }))
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// Analytics Dashboard Endpoints
// ==========================================

router.get('/analytics/sales/', adminAuth, (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const sales = db.prepare(`
      SELECT date(created_at) as date, SUM(total_amount) as total_sales, COUNT(id) as order_count
      FROM orders 
      WHERE created_at >= ? AND status != 'cancelled'
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `).all(dateStr);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/analytics/users/', adminAuth, (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const users = db.prepare(`
      SELECT date(date_joined) as date, COUNT(id) as registrations
      FROM users 
      WHERE date_joined >= ?
      GROUP BY date(date_joined)
      ORDER BY date(date_joined) ASC
    `).all(dateStr);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/analytics/popular-products/', adminAuth, (req, res) => {
  try {
    const popular = db.prepare(`
      SELECT p.id, p.name, p.category, COUNT(oi.id) as order_count, SUM(oi.quantity) as total_quantity, SUM(oi.product_price * oi.quantity) as revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY order_count DESC, revenue DESC
      LIMIT 10
    `).all();

    res.json(popular);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/analytics/blog-stats/', adminAuth, (req, res) => {
  try {
    const blogs = db.prepare(`
      SELECT id, title, views_count, likes_count, comments_count
      FROM blogs
      ORDER BY views_count DESC, likes_count DESC
      LIMIT 5
    `).all();

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// User Management
// ==========================================
router.get('/users/', adminAuth, (req, res) => {
  try {
    const search = req.query.search || '';
    
    let countQuery = 'SELECT COUNT(*) as count FROM users';
    let dataQuery = 'SELECT * FROM users';
    let queryParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      const whereClause = ' WHERE username LIKE ? OR email LIKE ?';
      countQuery += whereClause;
      dataQuery += whereClause;
      queryParams = [searchPattern, searchPattern];
    }

    const totalCount = db.prepare(countQuery).get(...queryParams).count;
    const p = paginate(req, totalCount);

    // Join query instead of N+1
    const joinQuery = `
      SELECT u.*, 
             p.id as p_id, p.bio, p.instagram_handle, p.twitter_handle, p.favorite_styles, p.profile_picture, p.selected_avatar
      FROM (${dataQuery} ORDER BY date_joined DESC LIMIT ? OFFSET ?) u
      LEFT JOIN user_profiles p ON u.id = p.user_id
    `;
    const users = db.prepare(joinQuery).all(...queryParams, p.limit, p.offset);
    
    const results = users.map(row => {
      const { p_id, bio, instagram_handle, twitter_handle, favorite_styles, profile_picture, selected_avatar, ...user } = row;
      const profile = p_id ? { id: p_id, user_id: user.id, bio, instagram_handle, twitter_handle, favorite_styles, profile_picture, selected_avatar } : null;
      return {
        ...user,
        is_active: booleanConvert(user.is_active),
        is_staff: booleanConvert(user.is_staff),
        is_superuser: booleanConvert(user.is_superuser),
        profile
      };
    });

    res.json({
      results,
      total: totalCount,
      page: p.page,
      limit: p.limit,
      total_pages: p.total_pages
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/users/:id/', adminAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);
    
    res.json({
      ...user,
      is_active: booleanConvert(user.is_active),
      is_staff: booleanConvert(user.is_staff),
      is_superuser: booleanConvert(user.is_superuser),
      profile: profile || null
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/users/:id/', adminAuth, (req, res) => {
  try {
    const { username, email, is_active, is_staff, is_superuser } = req.body;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    db.prepare(`
      UPDATE users 
      SET username = COALESCE(?, username),
          email = COALESCE(?, email),
          is_active = COALESCE(?, is_active),
          is_staff = COALESCE(?, is_staff),
          is_superuser = COALESCE(?, is_superuser)
      WHERE id = ?
    `).run(
      username, 
      email, 
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      is_staff !== undefined ? (is_staff ? 1 : 0) : null,
      is_superuser !== undefined ? (is_superuser ? 1 : 0) : null,
      id
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/users/:id/', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


// ==========================================
// Product Management
// ==========================================
router.get('/products/', adminAuth, (req, res) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';
    
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    let dataQuery = 'SELECT * FROM products WHERE 1=1';
    let queryParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      countQuery += ' AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)';
      dataQuery += ' AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)';
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (category) {
      countQuery += ' AND category = ?';
      dataQuery += ' AND category = ?';
      queryParams.push(category);
    }

    const totalCount = db.prepare(countQuery).get(...queryParams).count;
    const p = paginate(req, totalCount);

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(p.limit, p.offset);

    const products = db.prepare(dataQuery).all(...queryParams);
    
    const results = products.map(p => ({
      ...p,
      price: p.price.toFixed(2),
      is_active: booleanConvert(p.is_active)
    }));

    res.json({
      results,
      total: totalCount,
      page: p.page,
      limit: p.limit,
      total_pages: p.total_pages
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const productValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('description').trim().notEmpty().withMessage('Description is required').escape(),
];

router.post('/products/', adminAuth, productValidation, validate, (req, res) => {
  try {
    const { name, price, description, category, brand, stock_quantity, image_url, sku, is_active } = req.body;
    
    const id = uuidv4();
    const finalSku = sku || `PROD-${id.substring(0, 8).toUpperCase()}`;

    db.prepare(`
      INSERT INTO products (id, name, price, description, category, brand, stock_quantity, image_url, sku, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, parseFloat(price), description, category || '', brand || '', 
      parseInt(stock_quantity) || 0, image_url || null, finalSku, is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    product.price = product.price.toFixed(2);
    product.is_active = booleanConvert(product.is_active);

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/products/:id/', adminAuth, (req, res) => {
  try {
    const { name, price, description, category, brand, stock_quantity, image_url, sku, is_active } = req.body;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.prepare(`
      UPDATE products 
      SET name = COALESCE(?, name),
          price = COALESCE(?, price),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          brand = COALESCE(?, brand),
          stock_quantity = COALESCE(?, stock_quantity),
          image_url = COALESCE(?, image_url),
          sku = COALESCE(?, sku),
          is_active = COALESCE(?, is_active),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name, 
      price !== undefined ? parseFloat(price) : null,
      description,
      category,
      brand,
      stock_quantity !== undefined ? parseInt(stock_quantity) : null,
      image_url,
      sku,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    product.price = product.price.toFixed(2);
    product.is_active = booleanConvert(product.is_active);

    res.json(product);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/products/:id/', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/products/bulk-update/', adminAuth, (req, res) => {
  try {
    const { ids, updates } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !updates) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    if (updates.is_active !== undefined) {
      const activeValue = updates.is_active ? 1 : 0;
      const placeholders = ids.map(() => '?').join(',');
      db.prepare(`UPDATE products SET is_active = ?, updated_at = datetime('now') WHERE id IN (${placeholders})`)
        .run(activeValue, ...ids);
    }
    
    // Add more bulk updates if needed (e.g. category)

    res.json({ message: 'Products bulk updated successfully' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


// ==========================================
// Blog Management
// ==========================================
router.get('/blogs/', adminAuth, (req, res) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || ''; // 'published' or 'unpublished'
    
    let countQuery = 'SELECT COUNT(*) as count FROM blogs WHERE 1=1';
    let dataQuery = 'SELECT * FROM blogs WHERE 1=1';
    let queryParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      countQuery += ' AND (title LIKE ? OR author LIKE ? OR tags LIKE ?)';
      dataQuery += ' AND (title LIKE ? OR author LIKE ? OR tags LIKE ?)';
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (category) {
      countQuery += ' AND category = ?';
      dataQuery += ' AND category = ?';
      queryParams.push(category);
    }

    if (status === 'published') {
      countQuery += ' AND is_published = 1';
      dataQuery += ' AND is_published = 1';
    } else if (status === 'unpublished') {
      countQuery += ' AND is_published = 0';
      dataQuery += ' AND is_published = 0';
    }

    const totalCount = db.prepare(countQuery).get(...queryParams).count;
    const p = paginate(req, totalCount);

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(p.limit, p.offset);

    const blogs = db.prepare(dataQuery).all(...queryParams);
    
    const results = blogs.map(b => ({
      ...b,
      is_published: booleanConvert(b.is_published),
      is_trending: booleanConvert(b.is_trending),
      is_featured: booleanConvert(b.is_featured)
    }));

    res.json({
      results,
      total: totalCount,
      page: p.page,
      limit: p.limit,
      total_pages: p.total_pages
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/blogs/', adminAuth, (req, res) => {
  try {
    const { title, slug, author, content, excerpt, category, cover_image_url, is_trending, is_published, is_featured, meta_title, meta_description, tags } = req.body;
    
    if (!title || !author || !content) {
      return res.status(400).json({ error: 'Title, author, and content are required' });
    }

    const id = uuidv4();
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    db.prepare(`
      INSERT INTO blogs (
        id, title, slug, author, content, excerpt, category, 
        cover_image_url, is_trending, is_published, is_featured, 
        meta_title, meta_description, tags, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title, finalSlug, author, content, excerpt || '', category || 'General',
      cover_image_url || null, is_trending ? 1 : 0, is_published ? 1 : 0, is_featured ? 1 : 0,
      meta_title || title.substring(0, 60), meta_description || (excerpt || content).substring(0, 160), tags || '',
      is_published ? new Date().toISOString() : null
    );

    const blog = db.prepare('SELECT * FROM blogs WHERE id = ?').get(id);
    blog.is_published = booleanConvert(blog.is_published);
    blog.is_trending = booleanConvert(blog.is_trending);
    blog.is_featured = booleanConvert(blog.is_featured);

    res.status(201).json(blog);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/blogs/:id/', adminAuth, (req, res) => {
  try {
    const { title, slug, author, content, excerpt, category, cover_image_url, is_trending, is_published, is_featured, meta_title, meta_description, tags } = req.body;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM blogs WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Blog not found' });

    let publishedAt = existing.published_at;
    if (is_published !== undefined) {
      if (is_published && !existing.is_published && !existing.published_at) {
        publishedAt = new Date().toISOString();
      }
    }

    db.prepare(`
      UPDATE blogs 
      SET title = COALESCE(?, title),
          slug = COALESCE(?, slug),
          author = COALESCE(?, author),
          content = COALESCE(?, content),
          excerpt = COALESCE(?, excerpt),
          category = COALESCE(?, category),
          cover_image_url = COALESCE(?, cover_image_url),
          is_trending = COALESCE(?, is_trending),
          is_published = COALESCE(?, is_published),
          is_featured = COALESCE(?, is_featured),
          meta_title = COALESCE(?, meta_title),
          meta_description = COALESCE(?, meta_description),
          tags = COALESCE(?, tags),
          published_at = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title, slug, author, content, excerpt, category, cover_image_url,
      is_trending !== undefined ? (is_trending ? 1 : 0) : null,
      is_published !== undefined ? (is_published ? 1 : 0) : null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      meta_title, meta_description, tags, publishedAt, id
    );

    const blog = db.prepare('SELECT * FROM blogs WHERE id = ?').get(id);
    blog.is_published = booleanConvert(blog.is_published);
    blog.is_trending = booleanConvert(blog.is_trending);
    blog.is_featured = booleanConvert(blog.is_featured);

    res.json(blog);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/blogs/:id/', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM blogs WHERE id = ?').run(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/blogs/bulk-action/', adminAuth, (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const placeholders = ids.map(() => '?').join(',');
    
    if (action === 'publish') {
      db.prepare(`UPDATE blogs SET is_published = 1, published_at = COALESCE(published_at, datetime('now')), updated_at = datetime('now') WHERE id IN (${placeholders})`).run(...ids);
    } else if (action === 'unpublish') {
      db.prepare(`UPDATE blogs SET is_published = 0, updated_at = datetime('now') WHERE id IN (${placeholders})`).run(...ids);
    } else if (action === 'mark_trending') {
      db.prepare(`UPDATE blogs SET is_trending = 1, updated_at = datetime('now') WHERE id IN (${placeholders})`).run(...ids);
    } else if (action === 'mark_featured') {
      db.prepare(`UPDATE blogs SET is_featured = 1, updated_at = datetime('now') WHERE id IN (${placeholders})`).run(...ids);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ message: `Bulk action '${action}' applied successfully` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


// ==========================================
// Community Member Management
// ==========================================
router.get('/community/', adminAuth, (req, res) => {
  try {
    const search = req.query.search || '';
    
    let countQuery = 'SELECT COUNT(*) as count FROM community_members WHERE 1=1';
    let dataQuery = 'SELECT * FROM community_members WHERE 1=1';
    let queryParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      dataQuery += ' AND (name LIKE ? OR email LIKE ?)';
      queryParams.push(searchPattern, searchPattern);
    }

    const totalCount = db.prepare(countQuery).get(...queryParams).count;
    const p = paginate(req, totalCount);

    // Join query instead of N+1
    const joinQuery = `
      SELECT c.*, u.username
      FROM (${dataQuery} ORDER BY created_at DESC LIMIT ? OFFSET ?) c
      LEFT JOIN users u ON c.user_id = u.id
    `;
    const members = db.prepare(joinQuery).all(...queryParams, p.limit, p.offset);
    
    const results = members.map(m => {
      return {
        ...m,
        agreed_to_terms: booleanConvert(m.agreed_to_terms),
        subscribe_newsletter: booleanConvert(m.subscribe_newsletter)
      };
    });

    res.json({
      results,
      total: totalCount,
      page: p.page,
      limit: p.limit,
      total_pages: p.total_pages
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/community/export/', adminAuth, (req, res) => {
  try {
    const members = db.prepare('SELECT c.*, u.username FROM community_members c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC').all();
    
    let csv = 'Name,Username,Email,Phone,Location,Fashion Interest,What Brings You Here,Instagram,Website,Bio,Agreed to Terms,Newsletter Subscriber,Joined Date\n';
    
    members.forEach(m => {
      const row = [
        `"${(m.name || '').replace(/"/g, '""')}"`,
        `"${(m.username || '').replace(/"/g, '""')}"`,
        `"${(m.email || '').replace(/"/g, '""')}"`,
        `"${(m.phone || '').replace(/"/g, '""')}"`,
        `"${(m.location || '').replace(/"/g, '""')}"`,
        `"${(m.fashion_interest || '').replace(/"/g, '""')}"`,
        `"${(m.what_brings_you_here || '').replace(/"/g, '""')}"`,
        `"${(m.instagram_handle || '').replace(/"/g, '""')}"`,
        `"${(m.personal_website || '').replace(/"/g, '""')}"`,
        `"${(m.bio || '').replace(/"/g, '""')}"`,
        m.agreed_to_terms ? 'Yes' : 'No',
        m.subscribe_newsletter ? 'Yes' : 'No',
        m.created_at
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="community_members.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/community/:id/', adminAuth, (req, res) => {
  try {
    const member = db.prepare('SELECT c.*, u.username FROM community_members c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?').get(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    
    member.agreed_to_terms = booleanConvert(member.agreed_to_terms);
    member.subscribe_newsletter = booleanConvert(member.subscribe_newsletter);
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/community/:id/', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM community_members WHERE id = ?').run(req.params.id);
    res.json({ message: 'Community member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// Order Management
// ==========================================
router.put('/orders/:id/status/', adminAuth, (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!status || !['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid or missing status' });
    }

    const result = db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', status });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// Coupons Management
// ==========================================
router.get('/coupons/', adminAuth, (req, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    const results = coupons.map(c => ({
      ...c,
      is_active: booleanConvert(c.is_active)
    }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/coupons/', adminAuth, (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, max_uses, expires_at, is_active } = req.body;
    
    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ error: 'Code, discount type, and discount value are required' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_uses, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, code.toUpperCase(), discount_type, parseFloat(discount_value), 
      parseFloat(min_order_amount) || 0, 
      max_uses ? parseInt(max_uses) : null,
      expires_at || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    const coupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(id);
    coupon.is_active = booleanConvert(coupon.is_active);
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/coupons/:id/', adminAuth, (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, max_uses, expires_at, is_active } = req.body;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM coupons WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Coupon not found' });

    db.prepare(`
      UPDATE coupons 
      SET code = COALESCE(?, code),
          discount_type = COALESCE(?, discount_type),
          discount_value = COALESCE(?, discount_value),
          min_order_amount = COALESCE(?, min_order_amount),
          max_uses = ?,
          expires_at = ?,
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      code ? code.toUpperCase() : null, 
      discount_type, 
      discount_value !== undefined ? parseFloat(discount_value) : null,
      min_order_amount !== undefined ? parseFloat(min_order_amount) : null,
      max_uses !== undefined ? (max_uses === null ? null : parseInt(max_uses)) : existing.max_uses,
      expires_at !== undefined ? expires_at : existing.expires_at,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    const coupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(id);
    coupon.is_active = booleanConvert(coupon.is_active);
    res.json(coupon);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/coupons/:id/', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// Product Image Upload
// ==========================================
router.post('/products/upload-image/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'flexora_products' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return res.status(500).json({ error: 'Upload to Cloudinary failed' });
        }
        res.json({ image_url: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// Order Management
// ==========================================
router.get('/orders/', adminAuth, (req, res) => {
  try {
    const search = req.query.search || '';
    
    let countQuery = 'SELECT COUNT(*) as count FROM orders';
    let dataQuery = 'SELECT * FROM orders';
    let queryParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      const whereClause = ' WHERE id LIKE ? OR user_id IN (SELECT id FROM users WHERE username LIKE ?)';
      countQuery += whereClause;
      dataQuery += whereClause;
      queryParams = [searchPattern, searchPattern];
    }

    const totalCount = db.prepare(countQuery).get(...queryParams).count;
    const p = paginate(req, totalCount);

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(p.limit, p.offset);

    const orders = db.prepare(dataQuery).all(...queryParams);
    
    // Attach username for display
    const results = orders.map(order => {
      const user = db.prepare('SELECT username FROM users WHERE id = ?').get(order.user_id);
      return { ...order, username: user ? user.username : 'Unknown' };
    });

    res.json({
      results,
      total: totalCount,
      page: p.page,
      limit: p.limit,
      total_pages: p.total_pages
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/orders/:id/', adminAuth, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(order.user_id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    
    res.json({ ...order, user, items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/orders/:id/status/', adminAuth, [
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], validate, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// DYNAMIC CONTENT PAGES
// ==========================================

// Get all pages
router.get('/content', (req, res) => {
  try {
    const pages = db.prepare('SELECT id, title, slug, is_published, created_at, updated_at FROM content_pages ORDER BY created_at DESC').all();
    res.json({ results: pages });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create page
router.post('/content', (req, res) => {
  try {
    const { title, slug, content, is_published } = req.body;
    const id = require('crypto').randomUUID();
    
    // Ensure content is a string
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);
    
    db.prepare(`
      INSERT INTO content_pages (id, title, slug, content, is_published)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, title, slug, contentString, is_published ? 1 : 0);
    
    res.status(201).json({ id, title, slug });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single page
router.get('/content/:id', (req, res) => {
  try {
    const page = db.prepare('SELECT * FROM content_pages WHERE id = ?').get(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    
    try {
      page.content = JSON.parse(page.content);
    } catch(e) {}
    
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update page
router.put('/content/:id', (req, res) => {
  try {
    const { title, slug, content, is_published } = req.body;
    
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);
    
    db.prepare(`
      UPDATE content_pages 
      SET title = ?, slug = ?, content = ?, is_published = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title, slug, contentString, is_published ? 1 : 0, req.params.id);
    
    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete page
router.delete('/content/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM content_pages WHERE id = ?').run(req.params.id);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET pending designs for moderation
router.get('/designs/pending', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const designs = db.prepare(`
      SELECT ds.*, u.name as designer_name, u.email as designer_email
      FROM design_submissions ds
      JOIN users u ON ds.user_id = u.id
      WHERE ds.status = 'pending'
      ORDER BY ds.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    
    const total = db.prepare("SELECT COUNT(*) as count FROM design_submissions WHERE status = 'pending'").get().count;

    res.json({
      results: designs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE design status (Approve/Reject)
router.patch('/designs/:id/status', (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    db.prepare("UPDATE design_submissions SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ message: `Design ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
