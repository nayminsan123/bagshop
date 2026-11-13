const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'bagshop.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          phone TEXT,
          role TEXT DEFAULT 'customer',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          image TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          price REAL NOT NULL,
          sale_price REAL,
          sku TEXT UNIQUE,
          stock INTEGER DEFAULT 0,
          category_id TEXT,
          images TEXT,
          features TEXT,
          rating REAL DEFAULT 0,
          reviews_count INTEGER DEFAULT 0,
          is_featured INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        )
      `);

      // TikTok Videos table
      db.run(`
        CREATE TABLE IF NOT EXISTS tiktok_videos (
          id TEXT PRIMARY KEY,
          video_url TEXT NOT NULL,
          video_id TEXT NOT NULL,
          title TEXT,
          is_active INTEGER DEFAULT 1,
          display_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          status TEXT DEFAULT 'pending',
          subtotal REAL NOT NULL,
          tax REAL DEFAULT 0,
          shipping REAL DEFAULT 0,
          total REAL NOT NULL,
          shipping_address TEXT,
          billing_address TEXT,
          payment_method TEXT,
          payment_status TEXT DEFAULT 'pending',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);

      // Order items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          total REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `);

      // Insert default admin user
      const bcrypt = require('bcryptjs');
      const adminPassword = bcrypt.hashSync('admin123', 10);
      
      db.run(`
        INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, role)
        VALUES ('admin-001', 'admin@bagshop.com', ?, 'Admin', 'User', 'admin')
      `, [adminPassword]);

      // Insert default categories
      const categories = [
        { id: 'cat-001', name: 'Handbags', slug: 'handbags', description: 'Elegant handbags for every occasion' },
        { id: 'cat-002', name: 'Backpacks', slug: 'backpacks', description: 'Stylish and functional backpacks' },
        { id: 'cat-003', name: 'Travel Bags', slug: 'travel-bags', description: 'Premium travel bags for your adventures' },
        { id: 'cat-004', name: 'Shoulder Bags', slug: 'shoulder-bags', description: 'Trendy shoulder bags' },
        { id: 'cat-005', name: 'Totes', slug: 'totes', description: 'Spacious and versatile tote bags' }
      ];

      categories.forEach(cat => {
        db.run(`
          INSERT OR IGNORE INTO categories (id, name, slug, description)
          VALUES (?, ?, ?, ?)
        `, [cat.id, cat.name, cat.slug, cat.description]);
      });

      // Insert sample products
      const products = [
        {
          id: 'prod-001', name: 'Classic Leather Tote', slug: 'classic-leather-tote',
          description: 'A timeless leather tote bag crafted from premium Italian leather.',
          price: 199.99, sale_price: null, sku: 'BLT-001', stock: 50, category_id: 'cat-005',
          images: JSON.stringify(['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600']),
          features: JSON.stringify(['Premium Italian Leather', 'Spacious Interior']),
          rating: 4.8, reviews_count: 124, is_featured: 1
        },
        {
          id: 'prod-002', name: 'Urban Backpack Pro', slug: 'urban-backpack-pro',
          description: 'Modern backpack with laptop compartment and ergonomic design.',
          price: 149.99, sale_price: 129.99, sku: 'UBP-002', stock: 35, category_id: 'cat-002',
          images: JSON.stringify(['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600']),
          features: JSON.stringify(['Laptop Compartment', 'Water Resistant']),
          rating: 4.5, reviews_count: 89, is_featured: 1
        },
        {
          id: 'prod-003', name: 'Weekend Duffle', slug: 'weekend-duffle',
          description: 'Perfect weekend getaway bag.',
          price: 179.99, sale_price: null, sku: 'WD-003', stock: 25, category_id: 'cat-003',
          images: JSON.stringify(['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600']),
          features: JSON.stringify(['Spacious Main Compartment', 'Detachable Strap']),
          rating: 4.7, reviews_count: 67, is_featured: 1
        },
        {
          id: 'prod-004', name: 'Minimalist Crossbody', slug: 'minimalist-crossbody',
          description: 'Sleek and compact crossbody bag.',
          price: 89.99, sale_price: null, sku: 'MC-004', stock: 60, category_id: 'cat-004',
          images: JSON.stringify(['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600']),
          features: JSON.stringify(['Compact Design', 'Adjustable Strap']),
          rating: 4.6, reviews_count: 156, is_featured: 1
        }
      ];

      products.forEach(prod => {
        db.run(`
          INSERT OR IGNORE INTO products (id, name, slug, description, price, sale_price, sku, stock, category_id, images, features, rating, reviews_count, is_featured)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [prod.id, prod.name, prod.slug, prod.description, prod.price, prod.sale_price, prod.sku, prod.stock, prod.category_id, prod.images, prod.features, prod.rating, prod.reviews_count, prod.is_featured]);
      });

      // Insert sample TikTok videos
      const tiktokVideos = [
        { id: 'tt-001', video_url: 'https://www.tiktok.com/@pontpontbagshopmdy/video/7665232841726430484', video_id: '7665232841726430484', title: 'Premium Bag Collection', display_order: 1 },
        { id: 'tt-002', video_url: 'https://www.tiktok.com/@pontpontbagshopmdy/video/7523956756935281938', video_id: '7523956756935281938', title: 'New Arrival', display_order: 2 },
        { id: 'tt-003', video_url: 'https://www.tiktok.com/@pontpontbagshopmdy/video/7706832893657484565', video_id: '7706832893657484565', title: 'Backpacks', display_order: 3 },
        { id: 'tt-004', video_url: 'https://www.tiktok.com/@pontpontbagshopmdy/video/7706781771505159445', video_id: '7706781771505159445', title: 'Travel Bags', display_order: 4 }
      ];

      tiktokVideos.forEach(vid => {
        db.run(`
          INSERT OR IGNORE INTO tiktok_videos (id, video_url, video_id, title, display_order)
          VALUES (?, ?, ?, ?, ?)
        `, [vid.id, vid.video_url, vid.video_id, vid.title, vid.display_order]);
      });

      console.log('Database initialized successfully');
      resolve();
    });
  });
};

module.exports = { db, initDatabase };
