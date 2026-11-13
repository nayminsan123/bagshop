const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { protect, authorize } = require('../middleware/auth');

// Get dashboard statistics
router.get('/dashboard', protect, authorize('admin'), (req, res) => {
  const stats = {};
  
  // Get total orders
  db.get('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders', (err, orderStats) => {
    stats.orders = orderStats?.count || 0;
    stats.revenue = orderStats?.revenue || 0;
    
    // Get total products
    db.get('SELECT COUNT(*) as count FROM products WHERE is_active = 1', (err, productStats) => {
      stats.products = productStats?.count || 0;
      
      // Get total customers
      db.get('SELECT COUNT(*) as count FROM users WHERE role = "customer"', (err, customerStats) => {
        stats.customers = customerStats?.count || 0;
        
        // Get recent orders
        db.all(`
          SELECT o.*, u.first_name, u.last_name, u.email 
          FROM orders o 
          LEFT JOIN users u ON o.user_id = u.id 
          ORDER BY o.created_at DESC LIMIT 10
        `, (err, recentOrders) => {
          stats.recentOrders = recentOrders || [];
          
          // Get low stock products
          db.all('SELECT * FROM products WHERE stock < 10 AND is_active = 1 ORDER BY stock ASC LIMIT 5', (err, lowStock) => {
            stats.lowStockProducts = lowStock || [];
            
            res.json({
              success: true,
              data: stats
            });
          });
        });
      });
    });
  });
});

// Get all users
router.get('/users', protect, authorize('admin'), (req, res) => {
  db.all(
    'SELECT id, email, first_name, last_name, phone, role, created_at FROM users ORDER BY created_at DESC',
    (err, users) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({
        success: true,
        count: users.length,
        data: users
      });
    }
  );
});

// Update user role
router.put('/users/:id/role', protect, authorize('admin'), (req, res) => {
  const { role } = req.body;
  
  db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error updating user' });
    }
    
    res.json({ success: true, message: 'User role updated' });
  });
});

// Get sales report
router.get('/reports/sales', protect, authorize('admin'), (req, res) => {
  const { startDate, endDate } = req.query;
  
  db.all(
    `SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue 
     FROM orders 
     WHERE created_at >= ? AND created_at <= ? 
     GROUP BY DATE(created_at) 
     ORDER BY date DESC`,
    [startDate || '1970-01-01', endDate || '9999-12-31'],
    (err, salesData) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({
        success: true,
        data: salesData
      });
    }
  );
});

// Get top products
router.get('/reports/top-products', protect, authorize('admin'), (req, res) => {
  db.all(`
    SELECT p.name, p.price, SUM(oi.quantity) as total_sold, SUM(oi.total) as revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY oi.product_id
    ORDER BY total_sold DESC
    LIMIT 10
  `, (err, products) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({
      success: true,
      data: products
    });
  });
});

module.exports = router;
