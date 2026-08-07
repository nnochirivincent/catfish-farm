require('dotenv').config();
const express = require('express');
const router = express.Router();
const order = require('../models/order');
const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// 1. CREATE ORDER ROUTE
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
    console.log("Order Creation Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// 2. INITIALIZE PAYSTACK PAYMENT ROUTE
router.post('/pay', async (req, res) => {
  try {
    const { email, amount, orderId } = req.body;
    
    const callbackUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/payment-success.html` 
      : 'http://127.0.0.1:5500/payment-success.html';

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      { 
        email, 
        amount: Math.round(Number(amount) * 100), // Convert Naira to Kobo
        metadata: { orderId }, 
        callback_url: callbackUrl
      },
      { 
        headers: { 
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    res.json(response.data); // Returns { status: true, data: { authorization_url: ... } }
  } catch (err) {
    console.log("Paystack Init Error:", err.response?.data || err.message);
    res.status(500).json({ 
      status: false, 
      message: err.response?.data?.message || err.message 
    });
  }
});

module.exports = router;
