const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { protect, authorize } = require('../middleware/auth');

// Get all products with filtering, sorting, pagination
router.get('/', (req, res) => {
  const { category, search, sort, page = 1, limit = 12, featured } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.is_active = 1
  `;
  let countQuery = 'SELECT COUNT(*) as total FROM products WHERE is_active = 1';
  const params = [];
  const countParams = [];
  
  // Filter by category
  if (category) {
    query += ' AND c.slug = ?';
    countQuery += ' AND category_id = (SELECT id FROM categories WHERE slug = ?)';
    params.push(category);
    countParams.push(category);
  }
  
  // Search
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    countQuery += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }
  
  // Featured products only
  if (featured === 'true') {
    query += ' AND p.is_featured = 1';
    countQuery += ' AND is_featured = 1';
  }
  
  // Sorting
  const sortOptions = {
    'newest': 'p.created_at DESC',
    'price-low': 'p.price ASC',
    'price-high': 'p.price DESC',
    'popular': 'p.rating DESC',
    'name': 'p.name ASC'
  };
  query += ` ORDER BY ${sortOptions[sort] || 'p.created_at DESC'}`;
  
  // Pagination
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  // Get total count
  db.get(countQuery, countParams, (err, countResult) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    // Get products
    db.all(query, params, (err, products) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      // Parse JSON fields
      const parsedProducts = products.map(p => ({
        ...p,
        images: p.images ? JSON.parse(p.images) : [],
        features: p.features ? JSON.parse(p.features) : []
      }));
      
      res.json({
        success: true,
        count: parsedProducts.length,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
        currentPage: parseInt(page),
        data: parsedProducts
      });
    });
  });
});

// Get single product
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ? OR p.slug = ?`,
    [id, id],
    (err, product) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: {
          ...product,
          images: product.images ? JSON.parse(product.images) : [],
          features: product.features ? JSON.parse(product.features) : []
        }
      });
    }
  );
});

// Create product (Admin only)
router.post('/', protect, authorize('admin'), (req, res) => {
  const { name, description, price, salePrice, sku, stock, categoryId, images, features, isFeatured } = req.body;
  
  const id = uuidv4();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  db.run(
    `INSERT INTO products (id, name, slug, description, price, sale_price, sku, stock, category_id, images, features, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, slug, description, price, salePrice || null, sku, stock || 0, categoryId, JSON.stringify(images || []), JSON.stringify(features || []), isFeatured ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating product' });
      }
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { id, slug }
      });
    }
  );
});

// Update product (Admin only)
router.put('/:id', protect, authorize('admin'), (req, res) => {
  const { id } = req.params;
  const { name, description, price, salePrice, sku, stock, categoryId, images, features, isFeatured, isActive } = req.body;
  
  db.run(
    `UPDATE products SET 
     name = COALESCE(?, name),
     description = COALESCE(?, description),
     price = COALESCE(?, price),
     sale_price = COALESCE(?, sale_price),
     sku = COALESCE(?, sku),
     stock = COALESCE(?, stock),
     category_id = COALESCE(?, category_id),
     images = COALESCE(?, images),
     features = COALESCE(?, features),
     is_featured = COALESCE(?, is_featured),
     is_active = COALESCE(?, is_active),
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, description, price, salePrice, sku, stock, categoryId, images ? JSON.stringify(images) : null, features ? JSON.stringify(features) : null, isFeatured, isActive, id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating product' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      
      res.json({
        success: true,
        message: 'Product updated successfully'
      });
    }
  );
});

// Delete product (Admin only)
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error deleting product' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  });
});

module.exports = router;
