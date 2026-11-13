const jwt = require('jsonwebtoken');
const { db } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'bagshop-secret-key';

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    db.get('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err || !user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional auth (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      db.get('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
        if (!err && user) {
          req.user = user;
        }
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};

module.exports = { protect, authorize, optionalAuth };
