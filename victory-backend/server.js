require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('node:dns');

// 1. SET DNS SERVERS FOR MONGO ATLAS RESOLUTION
dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();
const PORT = process.env.PORT || 3000;

// 2. MIDDLEWARE (MUST BE BEFORE ROUTES)
app.use(cors({ origin: '*' })); // Allows requests from local live-server (127.0.0.1 / localhost)
app.use(express.json());

// 3. IMPORT ROUTES
const productRoutes = require('./routes/product');
const paymentRoutes = require('./routes/payment');
const estimatorRoutes = require('./routes/estimator'); // <-- ADDED ESTIMATOR ROUTE

app.use('/api', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/estimator', estimatorRoutes); // <-- MOUNTED ESTIMATOR ROUTE

// 4. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error: ", err));

app.get('/', (req, res) => {
  res.json({ message: "Victory Catfish Backend is Running ✅" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
