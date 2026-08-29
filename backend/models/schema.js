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

  console.log("Database schema created/verified.");
};

// Run this script directly to create tables: node models/schema.js
if (require.main === module) {
  createTables();
}

module.exports = createTables;
