const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// POST /api/coupons/validate/
router.post('/validate/', authMiddleware, (req, res) => {
  try {
    const { code, cart_total } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    if (cart_total === undefined || cart_total < 0) {
      return res.status(400).json({ error: 'Valid cart total is required' });
    }

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ?').get(code.toUpperCase());

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    if (!coupon.is_active) {
      return res.status(400).json({ error: 'This coupon is no longer active' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This coupon has expired' });
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return res.status(400).json({ error: 'This coupon has reached its usage limit' });
    }

    if (cart_total < coupon.min_order_amount) {
      return res.status(400).json({ error: `Minimum order amount of ₹${coupon.min_order_amount} is required for this coupon` });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (cart_total * coupon.discount_value) / 100;
    } else if (coupon.discount_type === 'flat') {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount isn't more than the cart total
    discountAmount = Math.min(discountAmount, cart_total);

    return res.json({
      success: true,
      message: 'Coupon applied successfully',
      discount_amount: discountAmount,
      coupon_code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value
    });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
