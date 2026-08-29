const express = require('express');
const router = express.Router();
const db = require('../config/database');
const adminAuth = require('../middleware/adminAuth');
const { v4: uuidv4 } = require('uuid');
const { booleanConvert } = require('../utils/helpers');

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
    res.status(500).json({ error: error.message });
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

    dataQuery += ' ORDER BY date_joined DESC LIMIT ? OFFSET ?';
    queryParams.push(p.limit, p.offset);

    const users = db.prepare(dataQuery).all(...queryParams);
    
    // Attach profile data
    const results = users.map(user => {
      const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);
      return {
        ...user,
        is_active: booleanConvert(user.is_active),
        is_staff: booleanConvert(user.is_staff),
        is_superuser: booleanConvert(user.is_superuser),
        profile: profile || null
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id/', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

router.post('/products/', adminAuth, (req, res) => {
  try {
    const { name, price, description, category, brand, stock_quantity, image_url, sku, is_active } = req.body;
    
    if (!name || price === undefined || !description) {
      return res.status(400).json({ error: 'Name, price, and description are required' });
    }

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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

router.delete('/products/:id/', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

router.delete('/blogs/:id/', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM blogs WHERE id = ?').run(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(p.limit, p.offset);

    const members = db.prepare(dataQuery).all(...queryParams);
    
    const results = members.map(m => {
      const user = db.prepare('SELECT username FROM users WHERE id = ?').get(m.user_id);
      return {
        ...m,
        username: user ? user.username : null,
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

router.delete('/community/:id/', adminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM community_members WHERE id = ?').run(req.params.id);
    res.json({ message: 'Community member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
