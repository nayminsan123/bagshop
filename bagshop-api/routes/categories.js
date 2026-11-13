const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { protect, authorize } = require('../middleware/auth');

// Get all categories
router.get('/', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    // Get product count for each category
    const categoriesWithCount = [];
    let processed = 0;
    
    categories.forEach((cat, index) => {
      db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1', [cat.id], (err, result) => {
        categoriesWithCount[index] = {
          ...cat,
          productCount: result ? result.count : 0
        };
        processed++;
        
        if (processed === categories.length) {
          res.json({
            success: true,
            data: categoriesWithCount
          });
        }
      });
    });
    
    if (categories.length === 0) {
      res.json({ success: true, data: [] });
    }
  });
});

// Create category (Admin only)
router.post('/', protect, authorize('admin'), (req, res) => {
  const { name, description, image } = req.body;
  const id = uuidv4();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  db.run(
    'INSERT INTO categories (id, name, slug, description, image) VALUES (?, ?, ?, ?, ?)',
    [id, name, slug, description, image],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating category' });
      }
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { id, slug }
      });
    }
  );
});

// Update category (Admin only)
router.put('/:id', protect, authorize('admin'), (req, res) => {
  const { name, description, image } = req.body;
  const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null;
  
  db.run(
    'UPDATE categories SET name = COALESCE(?, name), slug = COALESCE(?, slug), description = COALESCE(?, description), image = COALESCE(?, image) WHERE id = ?',
    [name, slug, description, image, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating category' });
      }
      
      res.json({ success: true, message: 'Category updated successfully' });
    }
  );
});

// Delete category (Admin only)
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error deleting category' });
    }
    
    res.json({ success: true, message: 'Category deleted successfully' });
  });
});

module.exports = router;
