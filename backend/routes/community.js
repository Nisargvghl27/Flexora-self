const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { booleanConvert } = require('../utils/helpers');

// POST /api/join-community/
router.post('/join-community/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const existing = db.prepare('SELECT id FROM community_members WHERE user_id = ?').get(userId);
    if (existing) {
      return res.status(400).json({ error: "You are already a community member." });
    }

    const {
      name, email, phone, location, bio,
      instagram: instagram_handle,
      website: personal_website,
      fashionInterest: fashion_interest,
      whatBringsYouHere: what_brings_you_here,
      agreeToTerms: agreed_to_terms,
      subscribeNewsletter: subscribe_newsletter
    } = req.body;

    if (!name || !email || agreed_to_terms === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    db.prepare(`
      INSERT INTO community_members (
        user_id, name, email, phone, location, instagram_handle, 
        personal_website, fashion_interest, what_brings_you_here, bio,
        agreed_to_terms, subscribe_newsletter
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, name, email, phone || '', location || '', instagram_handle || '',
      personal_website || '', fashion_interest || '', what_brings_you_here || '', bio || '',
      agreed_to_terms ? 1 : 0, subscribe_newsletter ? 1 : 0
    );

    const member = db.prepare('SELECT * FROM community_members WHERE user_id = ?').get(userId);
    member.agreed_to_terms = booleanConvert(member.agreed_to_terms);
    member.subscribe_newsletter = booleanConvert(member.subscribe_newsletter);

    return res.status(201).json({
      message: "Successfully joined the Flexora community!",
      member
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/join-community/
router.get('/join-community/', authMiddleware, (req, res) => {
  try {
    const member = db.prepare('SELECT * FROM community_members WHERE user_id = ?').get(req.user.user_id);
    if (member) {
      member.agreed_to_terms = booleanConvert(member.agreed_to_terms);
      member.subscribe_newsletter = booleanConvert(member.subscribe_newsletter);
      return res.json({ is_member: true, member });
    } else {
      return res.json({ is_member: false });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/community-member-check/
router.get('/community-member-check/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const member = db.prepare('SELECT * FROM community_members WHERE user_id = ?').get(userId);
    
    if (member) {
      const isMember = !!member.agreed_to_terms;
      const total = db.prepare('SELECT COUNT(*) as count FROM community_members').get();
      return res.json({
        is_community_member: isMember,
        user_email: member.email,
        debug_info: {
          has_community_record: true,
          agreed_to_terms: booleanConvert(member.agreed_to_terms),
          community_email: member.email,
          total_members: total.count
        }
      });
    } else {
      return res.json({
        is_community_member: false,
        user_email: req.user.email,
        debug_info: {
          has_community_record: false
        }
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
