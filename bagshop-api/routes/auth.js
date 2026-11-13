const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { protect } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'bagshop-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Register
router.post('/register', (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  
  // Check if user exists
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    
    db.run(
      'INSERT INTO users (id, email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, firstName, lastName, phone || null, 'customer'],
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error creating user' });
        }
        
        // Generate token
        const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
        
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          token,
          user: {
            id: userId,
            email,
            firstName,
            lastName,
            role: 'customer'
          }
        });
      }
    );
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = bcrypt.compareSync(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      }
    });
  });
});

// Get current user
router.get('/me', protect, (req, res) => {
  db.get(
    'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role,
          createdAt: user.created_at
        }
      });
    }
  );
});

// Update profile
router.put('/me', protect, (req, res) => {
  const { firstName, lastName, phone } = req.body;
  
  db.run(
    'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [firstName, lastName, phone, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating profile' });
      }
      
      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    }
  );
});

// Change password
router.put('/password', protect, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    
    db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error updating password' });
        }
        
        res.json({
          success: true,
          message: 'Password updated successfully'
        });
      }
    );
  });
});

module.exports = router;
