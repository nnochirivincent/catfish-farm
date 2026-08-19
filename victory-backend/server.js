require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('node:dns');

// 1. SET DNS SERVERS FOR MONGO ATLAS RESOLUTION
dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();
const PORT = process.env.PORT || 3000;

// 2. MIDDLEWARE
app.use(cors({ origin: '*' }));
app.use(express.json());

// 3. IMPORT ROUTES
const productRoutes = require('./routes/product');
const paymentRoutes = require('./routes/payment');
const estimatorRoutes = require('./routes/estimator');
const batchRoutes = require('./routes/batch');

// Mount routes
app.use('/api', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/estimator', estimatorRoutes);
app.use('/api/batch', batchRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ status: true, message: "Victory Catfish Backend is Running ✅" });
});

// 4. FALLBACK FOR UNMATCHED ROUTES (Prevents <!DOCTYPE html> HTML 404 responses)
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: `API Route Not Found: ${req.method} ${req.originalUrl}`
  });
});

// 5. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error: ", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
