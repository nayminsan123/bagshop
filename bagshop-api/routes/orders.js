const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { protect, authorize } = require('../middleware/auth');

// Get all orders (Admin) or user orders
router.get('/', protect, (req, res) => {
  let query, params;
  
  if (req.user.role === 'admin') {
    query = `
      SELECT o.*, u.first_name, u.last_name, u.email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `;
    params = [];
  } else {
    query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
    params = [req.user.id];
  }
  
  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({
      success: true,
      count: orders.length,
      data: orders.map(o => ({
        ...o,
        shippingAddress: o.shipping_address ? JSON.parse(o.shipping_address) : null,
        billingAddress: o.billing_address ? JSON.parse(o.billing_address) : null
      }))
    });
  });
});

// Get single order
router.get('/:id', protect, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check ownership for non-admin
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Get order items
    db.all('SELECT * FROM order_items WHERE order_id = ?', [id], (err, items) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({
        success: true,
        data: {
          ...order,
          shippingAddress: order.shipping_address ? JSON.parse(order.shipping_address) : null,
          billingAddress: order.billing_address ? JSON.parse(order.billing_address) : null,
          items
        }
      });
    });
  });
});

// Create order
router.post('/', protect, (req, res) => {
  const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' });
  }
  
  const orderId = uuidv4();
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;
  
  // Create order
  db.run(
    `INSERT INTO orders (id, user_id, subtotal, tax, shipping, total, shipping_address, billing_address, payment_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderId, req.user.id, subtotal, tax, shipping, total,
      JSON.stringify(shippingAddress), JSON.stringify(billingAddress || shippingAddress),
      paymentMethod, notes
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating order' });
      }
      
      // Insert order items
      const itemStmt = db.prepare(
        'INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, total) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      
      items.forEach(item => {
        itemStmt.run(
          uuidv4(), orderId, item.productId, item.productName,
          item.price, item.quantity, item.price * item.quantity
        );
      });
      
      itemStmt.finalize();
      
      // Update product stock
      items.forEach(item => {
        db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
      });
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { orderId, total }
      });
    }
  );
});

// Update order status (Admin only)
router.put('/:id/status', protect, authorize('admin'), (req, res) => {
  const { status } = req.body;
  
  db.run(
    'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating order' });
      }
      
      res.json({ success: true, message: 'Order status updated' });
    }
  );
});

module.exports = router;
