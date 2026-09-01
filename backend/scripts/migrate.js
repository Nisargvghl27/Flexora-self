const db = require('../config/database');

const runMigrations = () => {
  console.log('Running migrations...');

  try {
    // 1. Create missing tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        likes_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS community_post_likes (
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS blog_likes (
        blog_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (blog_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS design_submissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        votes_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS design_votes (
        submission_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (submission_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS lookbooks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        season TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dynamic_pages (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);
      CREATE INDEX IF NOT EXISTS idx_design_submissions_status ON design_submissions(status);
      CREATE INDEX IF NOT EXISTS idx_products_is_trending ON products(is_trending);
      CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    `);
    console.log('Tables created or verified successfully.');

    // 2. Add missing columns to 'users'
    const addColumnIfNotExists = (tableName, columnName, columnDef) => {
      try {
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const hasColumn = columns.some(col => col.name === columnName);
        if (!hasColumn) {
          db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
          console.log(`Added column ${columnName} to ${tableName}`);
        }
      } catch (err) {
        console.error(`Error adding column ${columnName} to ${tableName}:`, err.message);
      }
    };

    addColumnIfNotExists('users', 'bio', 'TEXT');
    addColumnIfNotExists('users', 'website', 'TEXT');
    addColumnIfNotExists('users', 'is_creator', 'BOOLEAN DEFAULT 0');

    // 3. Add missing columns to 'products'
    addColumnIfNotExists('products', 'is_trending', 'BOOLEAN DEFAULT 0');
    addColumnIfNotExists('products', 'view_count', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('products', 'category_id', 'TEXT');

    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

runMigrations();
