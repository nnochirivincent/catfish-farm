const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: "Live Catfish - 1kg",
    category: "Live Fish",
    price: 3500,
    weight: "1kg per piece",
    description: "Fresh, healthy live catfish. Ready for market or home cooking.",
    image: "/images/live-1kg.jpg"
  },
  {
    name: "Smoked Catfish - 500g",
    category: "Smoked Fish",
    price: 4500,
    weight: "500g pack",
    description: "Dry smoked catfish. No preservatives. 3-6 months shelf life.",
    image: "/images/smoked-500g.jpg"
  },
  {
    name: "Catfish Fingerlings - 100pcs",
    category: "Fingerlings",
    price: 15000,
    weight: "100 pieces",
    description: "Healthy 4-6 weeks old fingerlings. High survival rate.",
    image: "/images/fingerlings.jpg"
  },
  {
    name: "Catfish Feed - 15kg Bag",
    category: "Fish Feed",
    price: 18500,
    weight: "15kg Bag",
    description: "High protein floating feed. For faster growth.",
    image: "/images/feed-15kg.jpg"
  },
  {
    name: "Live Catfish - 5kg",
    category: "Live Fish",
    price: 17000,
    weight: "5kg total",
    description: "Bulk live catfish for restaurants and resellers.",
    image: "/images/live-5kg.jpg"
  }
];

mongoose.connect(process.env.MONGO_URL).then(async () => {
  await Product.deleteMany(); // clear old
  await Product.insertMany(products);
  console.log("✅ Products Seeded Successfully!");
  mongoose.connection.close();
});