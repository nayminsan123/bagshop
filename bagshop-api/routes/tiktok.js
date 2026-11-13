const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { protect, authorize } = require('../middleware/auth');

// Extract video ID from TikTok URL
function extractVideoId(url) {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : null;
}

// Get all TikTok videos
router.get('/', (req, res) => {
  db.all(
    'SELECT * FROM tiktok_videos WHERE is_active = 1 ORDER BY display_order ASC',
    (err, videos) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json({
        success: true,
        data: videos
      });
    }
  );
});

// Get single TikTok video
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM tiktok_videos WHERE id = ?', [req.params.id], (err, video) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    res.json({ success: true, data: video });
  });
});

// Create TikTok video (Admin only)
router.post('/', protect, authorize('admin'), (req, res) => {
  const { videoUrl, title, displayOrder } = req.body;
  
  if (!videoUrl) {
    return res.status(400).json({ success: false, message: 'Video URL is required' });
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return res.status(400).json({ success: false, message: 'Invalid TikTok video URL' });
  }

  const id = uuidv4();
  
  db.run(
    `INSERT INTO tiktok_videos (id, video_url, video_id, title, display_order)
     VALUES (?, ?, ?, ?, ?)`,
    [id, videoUrl, videoId, title || '', displayOrder || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating video' });
      }
      
      res.status(201).json({
        success: true,
        message: 'TikTok video added successfully',
        data: { id, videoId }
      });
    }
  );
});

// Update TikTok video (Admin only)
router.put('/:id', protect, authorize('admin'), (req, res) => {
  const { videoUrl, title, isActive, displayOrder } = req.body;
  
  let query = 'UPDATE tiktok_videos SET ';
  let params = [];
  let updates = [];

  if (videoUrl) {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Invalid TikTok video URL' });
    }
    updates.push('video_url = ?', 'video_id = ?');
    params.push(videoUrl, videoId);
  }

  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title);
  }

  if (isActive !== undefined) {
    updates.push('is_active = ?');
    params.push(isActive ? 1 : 0);
  }

  if (displayOrder !== undefined) {
    updates.push('display_order = ?');
    params.push(displayOrder);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(req.params.id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error updating video' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({ success: true, message: 'TikTok video updated successfully' });
  });
});

// Delete TikTok video (Admin only)
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  db.run('DELETE FROM tiktok_videos WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error deleting video' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({ success: true, message: 'TikTok video deleted successfully' });
  });
});

module.exports = router;
