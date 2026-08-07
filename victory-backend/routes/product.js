const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET ALL PRODUCTS
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;