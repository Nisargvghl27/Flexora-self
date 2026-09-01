const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/content/:slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const page = db.prepare('SELECT * FROM content_pages WHERE slug = ? AND is_published = 1').get(slug);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    // Parse the JSON content
    try {
      page.content = JSON.parse(page.content);
    } catch (e) {
      // If it's not valid JSON, leave as is (though it should be)
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching content page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
