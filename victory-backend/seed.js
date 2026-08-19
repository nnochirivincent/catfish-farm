const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Batch = require('./models/batch');

const products = [
  {
    name: "Live African Catfish (1kg)",
    category: "Live Fish",
    price: 3500,
    weight: "1kg per piece",
    description: "Fresh Clarias Gariepinus straight from our ponds.",
    image: "./assets/images/live-catfish.jpeg"
  },
  {
    name: "Smoked Catfish (Pack of 4)",
    category: "Smoked Fish",
    price: 5000,
    weight: "4 pieces pack",
    description: "Oven-dried, well dried and sand-free.",
    image: "./assets/images/packet-fish.jpeg"
  },
  {
    name: "Catfish Post-Fingerlings (100pcs)",
    category: "Fingerlings",
    price: 12000,
    weight: "100 pieces",
    description: "Strong 5-6 week old fast-growing post-fingerlings.",
    image: "./assets/images/fingelings.jpeg"
  },
  {
    name: "Full Smoked Fish",
    category: "Smoked Fish",
    price: 5000,
    weight: "500g",
    description: "Oven smoked and properly smoked",
    image: "./assets/images/smoked-fish.jpeg"
  },
  {
    name: "Catfish Post-juvenile (100pcs)",
    category: "Fingerlings",
    price: 30000,
    weight: "100 pieces",
    description: "Strong 5-6 week old fast-growing post-juvenile.",
    image: "./assets/images/post-juvenile.jpeg"
  },
  {
    name: "Live melagne Fishes - 5kg",
    category: "Live Fish",
    price: 2700,
    weight: "500g total",
    description: "live catfish for restaurants and resellers.",
    image: "./assets/images/melagne.jpeg"
  },
  {
    name: "Bulk Live Catfish (5kg)",
    category: "Live Fish",
    price: 17000,
    weight: "5kg total",
    description: "Bulk fresh live catfish ideal for restaurants and events.",
    image: "./assets/images/brood-stuck-catfish.jpeg"
  },
  {
    name: "Catfish-pepper soup",
    category: "Live Fish",
    price: 8000,
    weight: "15kg Bag",
    description: "well cooked and hot plate of catfish pepper-soup",
    image: "./assets/images/catfish-peppersoup.jpeg"
  },
  {
    name: "Grilled Cat-fish",
    category: "Smoked Fish",
    price: 12000,
    weight: "1 Litre bottle",
    description: "Well grilled and Garnished cat-fish",
    image: "./assets/images/3rd-image.jpeg"
  }
];

mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    // 1. Clear and Seed Products
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("✅ Products Seeded Successfully!");

    // 2. Clear and Seed Batch Telemetry Data
   // Replace the Batch seeding section in seed.js with this:
await Batch.deleteMany({});
await Batch.create([
  {
    pondIdentifier: "Pond 1",
    batchName: "Alpha-2026 Batch",
    initialStockCount: 2000,
    currentStockCount: 1950,
    mortalityCount: 50,
    averageWeightGrams: 350,
    feedInventoryBags: 12,
    stage: "Post-Juvenile"
  },
  {
    pondIdentifier: "Pond 2",
    batchName: "Beta-2026 Batch",
    initialStockCount: 3000,
    currentStockCount: 2980,
    mortalityCount: 20,
    averageWeightGrams: 120,
    feedInventoryBags: 25,
    stage: "Juvenile"
  }
]);
console.log("✅ Batch Data Seeded Successfully!");

    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ Database seeding error:", err);
  });
