const db = require('./config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  console.log("Starting seed process...");

  // Create tables if they don't exist
  require('./models/schema')();

  // 1. Create Admin User
  const adminUsername = 'admin';
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUsername);
  
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    const result = db.prepare('INSERT INTO users (username, email, password_hash, is_staff, is_superuser) VALUES (?, ?, ?, 1, 1)').run(adminUsername, 'admin@flexora.com', hash);
    db.prepare('INSERT INTO user_profiles (user_id) VALUES (?)').run(result.lastInsertRowid);
    console.log("Admin user created.");
  } else {
    console.log("Admin user already exists.");
  }

  // 2. Sample Products
  const categories = ["Minimalist", "Vintage", "Streetwear", "Bohemian", "Formal", "Casual"];
  const products = [
    // Minimalist
    { name: "Essential White Tee", price: 999.00, desc: "A perfect white tee.", cat: "Minimalist", qty: 50 },
    { name: "Structured Tote", price: 2499.00, desc: "Clean lines.", cat: "Minimalist", qty: 25 },
    { name: "Tailored Trousers", price: 1899.00, desc: "Sleek and simple.", cat: "Minimalist", qty: 30 },
    // Vintage
    { name: "Retro Denim Jacket", price: 3499.00, desc: "Classic 90s wash.", cat: "Vintage", qty: 15 },
    { name: "Polka Dot Midi", price: 2199.00, desc: "50s inspired.", cat: "Vintage", qty: 20 },
    { name: "Leather Satchel", price: 4500.00, desc: "Aged perfection.", cat: "Vintage", qty: 10 },
    // Streetwear
    { name: "Oversized Graphic Hoodie", price: 2999.00, desc: "Urban essential.", cat: "Streetwear", qty: 40 },
    { name: "Cargo Pants", price: 2299.00, desc: "Utility focus.", cat: "Streetwear", qty: 35 },
    { name: "Chunky Sneakers", price: 4999.00, desc: "Statement footwear.", cat: "Streetwear", qty: 20 },
    // Bohemian
    { name: "Floral Maxi Dress", price: 3299.00, desc: "Flowing silhouette.", cat: "Bohemian", qty: 15 },
    { name: "Fringed Vest", price: 1599.00, desc: "Festival ready.", cat: "Bohemian", qty: 25 },
    { name: "Woven Sun Hat", price: 899.00, desc: "Beach perfect.", cat: "Bohemian", qty: 45 },
    // Formal
    { name: "Classic Blazer", price: 4599.00, desc: "Boardroom ready.", cat: "Formal", qty: 20 },
    { name: "Silk Blouse", price: 2899.00, desc: "Elegant drape.", cat: "Formal", qty: 30 },
    { name: "Pencil Skirt", price: 1799.00, desc: "Sharp fit.", cat: "Formal", qty: 35 },
    // Casual
    { name: "Everyday Jeans", price: 1999.00, desc: "Comfortable stretch.", cat: "Casual", qty: 60 },
    { name: "Knit Sweater", price: 2499.00, desc: "Cozy staple.", cat: "Casual", qty: 40 },
    { name: "Canvas Slip-ons", price: 1299.00, desc: "Easy wear.", cat: "Casual", qty: 55 }
  ];

  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    const insertProd = db.prepare('INSERT INTO products (id, name, price, description, category, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)');
    db.transaction(() => {
      products.forEach(p => insertProd.run(uuidv4(), p.name, p.price, p.desc, p.cat, p.qty));
    })();
    console.log("Sample products seeded.");
  } else {
    console.log("Products already exist, skipping.");
  }

  // 3. Sample Blogs
  const blogs = [
    { title: "Building a Minimalist Wardrobe", cat: "Minimalist", content: "Start with basics.", excerpt: "How to build a capsule wardrobe." },
    { title: "Thrifting 101: Finding Vintage Gems", cat: "Vintage", content: "Look for quality fabrics.", excerpt: "The ultimate guide to thrifting." },
    { title: "The Evolution of Streetwear", cat: "Streetwear", content: "From skate parks to runways.", excerpt: "A brief history of streetwear." },
    { title: "Festival Fashion Guide", cat: "Bohemian", content: "Layering is key.", excerpt: "What to wear to your next festival." },
    { title: "Dressing for the Modern Office", cat: "Formal", content: "Power dressing redefined.", excerpt: "Update your workwear." },
    { title: "Weekend Casual Outfits", cat: "Casual", content: "Comfort meets style.", excerpt: "Easy weekend looks." }
  ];

  const blogCount = db.prepare('SELECT COUNT(*) as count FROM blogs').get();
  if (blogCount.count === 0) {
    const insertBlog = db.prepare(`INSERT INTO blogs (id, title, slug, author, content, excerpt, category, is_published, published_at, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), 1)`);
    db.transaction(() => {
      blogs.forEach(b => {
        const slug = b.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        insertBlog.run(uuidv4(), b.title, slug, 'admin', b.content, b.excerpt, b.cat);
      });
    })();
    console.log("Sample blogs seeded.");
  } else {
    console.log("Blogs already exist, skipping.");
  }

  console.log("Seed complete!");
};

seed().catch(console.error);
