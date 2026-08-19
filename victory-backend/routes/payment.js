require('dotenv').config();
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// 1. CREATE ORDER ROUTE -> POST /api/payment/order
router.post('/order', async (req, res) => {
  try {
    const { name, email, phone, address, items, totalAmount } = req.body;

    if (!name || !email || !totalAmount) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: Name, Email, or Total Amount." 
      });
    }

    const order = new Order({
      customerName: name,
      customerEmail: email,
      customerPhone: phone || '',
      deliveryAddress: address || '',
      items: items || [],
      totalAmount: Number(totalAmount),
      paymentStatus: 'pending'
    });

    await order.save();

    res.json({ 
      success: true, 
      orderId: order._id, 
      amount: order.totalAmount 
    });

  } catch (err) {
    console.error("Order Creation Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Paystack Handler Logic
const handlePaystackInit = async (req, res) => {
  try {
    const { email, amount, orderId, customerName, phone } = req.body;

    if (!email || !amount) {
      return res.status(400).json({
        status: false,
        message: "Email and amount are required for payment initialization."
      });
    }

    let frontendUrl = process.env.FRONTEND_URL || 'https://nnochirivincent.github.io/catfish-farm';
    
    if (frontendUrl.includes('](')) {
       frontendUrl = 'https://nnochirivincent.github.io/catfish-farm';
    }

    // Clean up base URL formatting
    frontendUrl = frontendUrl.replace(/\/+$/, '');
    const callbackUrl = `${frontendUrl}/payment-success.html`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { 
        email, 
        amount: Math.round(Number(amount) * 100), // Convert Naira to Kobo
        metadata: { 
          orderId: orderId || null,
          customerName: customerName || '',
          phone: phone || ''
        }, 
        callback_url: callbackUrl
      },
      { 
        headers: { 
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Paystack Init Error:", err.response?.data || err.message);
    res.status(500).json({ 
      status: false, 
      message: err.response?.data?.message || err.message 
    });
  }
};

// 2. INITIALIZE PAYSTACK ROUTE ALIASES
// Handles POST /api/payment, /api/payment/pay, and /api/payment/initialize
router.post('/pay', handlePaystackInit);
router.post('/initialize', handlePaystackInit);
router.post('/', handlePaystackInit);

module.exports = router;
