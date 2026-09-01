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
    { name: "Essential White Tee", price: 999.00, desc: "A perfect white tee crafted from premium cotton. Clean lines and a relaxed fit make this the foundation of any minimalist wardrobe.", cat: "Minimalist", qty: 50, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600" },
    { name: "Structured Tote", price: 2499.00, desc: "Clean lines and premium craftsmanship define this everyday carry essential. Spacious interior with subtle organizational pockets.", cat: "Minimalist", qty: 25, img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600" },
    { name: "Tailored Trousers", price: 1899.00, desc: "Sleek and simple tailored trousers with a modern slim fit. Perfect for both office and evening occasions.", cat: "Minimalist", qty: 30, img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600" },
    // Vintage
    { name: "Retro Denim Jacket", price: 3499.00, desc: "Classic 90s wash denim jacket with authentic vintage-inspired detailing. A timeless layering piece for any season.", cat: "Vintage", qty: 15, img: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600" },
    { name: "Polka Dot Midi", price: 2199.00, desc: "50s inspired polka dot midi dress with a flattering A-line silhouette and classic collar detail.", cat: "Vintage", qty: 20, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600" },
    { name: "Leather Satchel", price: 4500.00, desc: "Aged to perfection genuine leather satchel. Handcrafted with traditional techniques for a truly vintage feel.", cat: "Vintage", qty: 10, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600" },
    // Streetwear
    { name: "Oversized Graphic Hoodie", price: 2999.00, desc: "Urban essential oversized hoodie featuring bold graphic prints. Heavyweight cotton for a premium drape.", cat: "Streetwear", qty: 40, img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600" },
    { name: "Cargo Pants", price: 2299.00, desc: "Utility-focused cargo pants with multiple functional pockets. Relaxed fit with tapered ankles for a modern silhouette.", cat: "Streetwear", qty: 35, img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600" },
    { name: "Chunky Sneakers", price: 4999.00, desc: "Statement chunky sneakers with a bold platform sole. Designed for both comfort and street-style impact.", cat: "Streetwear", qty: 20, img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600" },
    // Bohemian
    { name: "Floral Maxi Dress", price: 3299.00, desc: "Flowing floral maxi dress with a romantic bohemian silhouette. Lightweight fabric perfect for warm weather styling.", cat: "Bohemian", qty: 15, img: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600" },
    { name: "Fringed Vest", price: 1599.00, desc: "Festival-ready fringed suede vest. Hand-finished fringe details add movement and free-spirited charm.", cat: "Bohemian", qty: 25, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600" },
    { name: "Woven Sun Hat", price: 899.00, desc: "Beach-perfect woven sun hat with a wide brim for stylish sun protection. Natural straw construction.", cat: "Bohemian", qty: 45, img: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600" },
    // Formal
    { name: "Classic Blazer", price: 4599.00, desc: "Boardroom-ready classic blazer with refined tailoring. Single-breasted design with a notched lapel.", cat: "Formal", qty: 20, img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600" },
    { name: "Silk Blouse", price: 2899.00, desc: "Elegant silk blouse with a luxurious drape. Versatile enough for both professional and evening wear.", cat: "Formal", qty: 30, img: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600" },
    { name: "Pencil Skirt", price: 1799.00, desc: "Sharp-fitting pencil skirt with a high waist and back slit. Classic workwear staple in premium stretch fabric.", cat: "Formal", qty: 35, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj8a?w=600" },
    // Casual
    { name: "Everyday Jeans", price: 1999.00, desc: "Comfortable stretch denim jeans with a relaxed fit. The go-to pair for effortless everyday style.", cat: "Casual", qty: 60, img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600" },
    { name: "Knit Sweater", price: 2499.00, desc: "Cozy cable-knit sweater in a soft wool blend. A wardrobe staple for layering in cooler months.", cat: "Casual", qty: 40, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600" },
    { name: "Canvas Slip-ons", price: 1299.00, desc: "Easy-wear canvas slip-on shoes for everyday comfort. Lightweight with a cushioned insole.", cat: "Casual", qty: 55, img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600" }
  ];

  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    const insertProd = db.prepare('INSERT INTO products (id, name, price, description, category, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
    db.transaction(() => {
      products.forEach(p => insertProd.run(uuidv4(), p.name, p.price, p.desc, p.cat, p.qty, p.img));
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
