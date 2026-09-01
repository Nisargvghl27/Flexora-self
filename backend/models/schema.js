const db = require('../config/database');

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT DEFAULT '',
      last_name TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      is_staff INTEGER DEFAULT 0,
      is_superuser INTEGER DEFAULT 0,
      email_verified INTEGER DEFAULT 0,
      verification_token TEXT DEFAULT NULL,
      password_reset_token TEXT DEFAULT NULL,
      password_reset_expires TEXT DEFAULT NULL,
      date_joined TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      profile_picture TEXT DEFAULT NULL,
      selected_avatar TEXT DEFAULT NULL,
      account_type TEXT DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT DEFAULT NULL,
      image TEXT DEFAULT NULL,
      category TEXT DEFAULT NULL,
      brand TEXT DEFAULT NULL,
      stock_quantity INTEGER DEFAULT 0,
      sku TEXT UNIQUE DEFAULT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT DEFAULT '',
      category TEXT NOT NULL,
      cover_image TEXT DEFAULT NULL,
      cover_image_url TEXT DEFAULT NULL,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      meta_title TEXT DEFAULT '',
      meta_description TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      published_at TEXT DEFAULT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS community_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      location TEXT DEFAULT '',
      instagram_handle TEXT DEFAULT '',
      personal_website TEXT DEFAULT '',
      fashion_interest TEXT DEFAULT '',
      what_brings_you_here TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      agreed_to_terms INTEGER DEFAULT 0,
      subscribe_newsletter INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS lookbooks (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      style_persona TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, style_persona)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS lookbook_items (
      id TEXT PRIMARY KEY,
      lookbook_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      added_at TEXT DEFAULT (datetime('now')),
      item_order INTEGER DEFAULT 0,
      FOREIGN KEY (lookbook_id) REFERENCES lookbooks(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(lookbook_id, product_id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      razorpay_order_id TEXT UNIQUE,
      razorpay_payment_id TEXT UNIQUE,
      status TEXT DEFAULT 'pending',
      total_amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      shipping_name TEXT DEFAULT '',
      shipping_address TEXT DEFAULT '',
      shipping_city TEXT DEFAULT '',
      shipping_state TEXT DEFAULT '',
      shipping_pincode TEXT DEFAULT '',
      shipping_phone TEXT DEFAULT '',
      receipt TEXT DEFAULT '',
      coupon_code TEXT DEFAULT NULL,
      discount_amount REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_price REAL NOT NULL,
      quantity INTEGER DEFAULT 1,
      size TEXT DEFAULT '',
      color TEXT DEFAULT '',
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      size TEXT DEFAULT '',
      color TEXT DEFAULT '',
      added_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id, size, color)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      added_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_text TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_uses INTEGER DEFAULT NULL,
      current_uses INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_comments (
      id TEXT PRIMARY KEY,
      blog_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      parent_id TEXT DEFAULT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES blog_comments(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      reference_id TEXT DEFAULT NULL,
      reference_type TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS content_pages (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // We should attempt to add the new columns to the users table just in case it already exists
  try {
    db.exec(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;`);
  } catch(e) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN verification_token TEXT DEFAULT NULL;`);
  } catch(e) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_reset_token TEXT DEFAULT NULL;`);
  } catch(e) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_reset_expires TEXT DEFAULT NULL;`);
  } catch(e) {}

  // Add the new columns to orders if they don't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN coupon_code TEXT DEFAULT NULL;`);
  } catch (e) {
    // Column might already exist
  }
  
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;`);
  } catch (e) {
    // Column might already exist
  }

  // Phase 5 Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      likes_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS community_post_likes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS design_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      votes_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS design_votes (
      submission_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (submission_id, user_id),
      FOREIGN KEY (submission_id) REFERENCES design_submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log("Database schema created/verified.");

};

// Run this script directly to create tables: node models/schema.js
if (require.main === module) {
  createTables();
}

module.exports = createTables;
