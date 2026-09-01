const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/create-razorpay-order/
router.post('/create-razorpay-order/', authMiddleware, async (req, res) => {
  try {
    const { amount, currency, receipt, customer_info, cart_items, coupon_code } = req.body;
    
    if (!amount || !receipt) {
      return res.status(400).json({ error: "Amount and receipt are required" });
    }

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res.status(400).json({ error: "Cart items are required" });
    }

    let finalAmount = parseFloat(amount);
    let discountAmount = 0;

    // Validate coupon if provided
    if (coupon_code) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(coupon_code.toUpperCase());
      if (coupon) {
        let isValid = true;
        
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          isValid = false;
        }
        
        if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
          isValid = false;
        }

        if (finalAmount < coupon.min_order_amount) {
          isValid = false;
        }

        if (isValid) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (finalAmount * coupon.discount_value) / 100;
          } else {
            discountAmount = coupon.discount_value;
          }
          
          discountAmount = Math.min(discountAmount, finalAmount);
          finalAmount = finalAmount - discountAmount;
        }
      }
    }

    const amountInPaise = Math.round(finalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: receipt,
      notes: {
        user_id: req.user.user_id.toString()
      }
    };

    const razorpayOrder = await instance.orders.create(options);

    // Create a pending order in the database
    const orderId = uuidv4();
    const shipping = customer_info || {};

    db.transaction(() => {
      db.prepare(`
        INSERT INTO orders (
          id, user_id, razorpay_order_id, status, total_amount, currency,
          shipping_name, shipping_address, shipping_city, shipping_state,
          shipping_pincode, shipping_phone, receipt, coupon_code, discount_amount
        ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderId,
        req.user.user_id,
        razorpayOrder.id,
        finalAmount, // store discounted total
        currency || 'INR',
        shipping.name || '',
        shipping.address || '',
        shipping.city || '',
        shipping.state || '',
        shipping.pincode || '',
        shipping.phone || '',
        receipt,
        coupon_code || null,
        discountAmount
      );

      const insertItem = db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, product_name, product_price, quantity, size, color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      cart_items.forEach(item => {
        insertItem.run(
          uuidv4(),
          orderId,
          item.product_id || item.id || '',
          item.name || '',
          parseFloat(item.price) || 0,
          parseInt(item.quantity) || 1,
          item.size || '',
          item.color || ''
        );
      });

      // Increment coupon usage
      if (coupon_code) {
        db.prepare('UPDATE coupons SET current_uses = current_uses + 1 WHERE code = ?').run(coupon_code.toUpperCase());
      }
    })();
    
    return res.status(201).json({
      success: true,
      order_id: razorpayOrder.id,
      id: razorpayOrder.id,
      internal_order_id: orderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      status: razorpayOrder.status
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/verify-razorpay-payment/
router.post('/verify-razorpay-payment/', authMiddleware, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, receipt } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required Razorpay fields" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      // Mark order as failed
      db.prepare(`UPDATE orders SET status = 'failed', updated_at = datetime('now') WHERE razorpay_order_id = ?`).run(razorpay_order_id);
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const payment = await instance.payments.fetch(razorpay_payment_id);
    if (payment.status !== 'captured') {
      db.prepare(`UPDATE orders SET status = 'failed', updated_at = datetime('now') WHERE razorpay_order_id = ?`).run(razorpay_order_id);
      return res.status(400).json({ error: "Payment not captured" });
    }

    // Mark order as paid and decrement stock within a transaction
    const order = db.prepare('SELECT * FROM orders WHERE razorpay_order_id = ?').get(razorpay_order_id);
    
    db.transaction(() => {
      db.prepare(`
        UPDATE orders 
        SET status = 'paid', razorpay_payment_id = ?, updated_at = datetime('now')
        WHERE razorpay_order_id = ?
      `).run(razorpay_payment_id, razorpay_order_id);

      if (order) {
        const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(order.id);
        const updateStock = db.prepare('UPDATE products SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?');
        for (const item of items) {
          updateStock.run(item.quantity, item.product_id);
        }
      }
    })();

    return res.json({
      success: true,
      message: "Payment verified successfully",
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      internal_order_id: order ? order.id : null,
      amount: payment.amount,
      status: payment.status
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/orders/ — Get current user's orders
router.get('/orders/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.user_id;
    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId);

    const results = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return {
        ...order,
        total_amount: order.total_amount.toFixed(2),
        items
      };
    });

    return res.json({ orders: results, total: results.length });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/orders/:order_id/ — Get a single order
router.get('/orders/:order_id/', authMiddleware, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.order_id, req.user.user_id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    return res.json({
      ...order,
      total_amount: order.total_amount.toFixed(2),
      items
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
