 const dns = require('node:dns');
 dns.setServers(['1.1.1.1', '8.8.8.8']);
 require('dotenv').config();
 const mongoose = require('mongoose');
 const Product = require('./models/Product');

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
     name: " Full Smoked Fish",
     category: "Smoked Fish",
     price: 5000,
     weight: "500g",
     description: "Oven smoked and properly smoked",
     image: ".assets/images/smoked-fish.jpeg"
   },
     {
     name: "Catfish Post-juvenile (100pcs)",
     category: "juvenile",
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
     image: ".assets/images/melagne.jpeg"
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
     category: "Fresh fish",
     price: 8000,
     weight: "15kg Bag",
     description: "well cooked and hot plate of catfish pepper-soup",
     image: "./assets/images/catfish-peppersoup.jpeg"
   },
    {
     name: " Grilled Cat-fish",
     category: "Grilled Fish",
     price: 12000,
     weight: "1 Litre bottle",
     description: " Well grilled and Garnished cat-fish ",
     image: "./assets/images/3rd-image.jpeg"
   }
 ];

 mongoose.connect(process.env.MONGO_URL).then(async () => {
   await Product.deleteMany(); // clear old
   await Product.insertMany(products);
   console.log("✅ Products Seeded Successfully!");
   mongoose.connection.close();
 });




// const dns = require('node:dns');
// dns.setServers(['1.1.1.1', '8.8.8.8']);
// require('dotenv').config();
// const mongoose = require('mongoose');
// const Product = require('./models/Product');

// const products = [
//   {
//     name: "Live African Catfish (1kg)",
//     category: "Live Fish",
//     price: 3500,
//     weight: "1kg per piece",
//     description: "Fresh Clarias Gariepinus straight from our ponds.",
//     image: "./assets/images/live-catfish.jpeg"
//   },
//   {
//     name: "Smoked Catfish (Pack of 4)",
//     category: "Smoked Fish",
//     price: 5000,
//     weight: "4 pieces pack",
//     description: "Oven-dried, well dried and sand-free.",
//     image: "./assets/images/smoked-catfish.jpeg"
//   },
//   {
//     name: "Catfish Fingerlings (100pcs)",
//     category: "Fingerlings",
//     price: 8000,
//     weight: "100 pieces",
//     description: "3-4 weeks old healthy catfish juveniles.",
//     image: "./assets/images/3rd-image.jpeg"
//   },
//   {
//     name: "Catfish Post-Fingerlings (100pcs)",
//     category: "Fingerlings",
//     price: 12000,
//     weight: "100 pieces",
//     description: "Strong 5-6 week old fast-growing post-fingerlings.",
//     image: "./assets/images/fingelings.jpeg"
//   },
//   {
//     name: "Bulk Live Catfish (5kg)",
//     category: "Live Fish",
//     price: 17000,
//     weight: "5kg total",
//     description: "Bulk fresh live catfish ideal for restaurants and events.",
//     image: "./assets/images/live-catfish.jpeg"
//   },
//   {
//     name: "Smoked Catfish - 500g Pack",
//     category: "Smoked Fish",
//     price: 4500,
//     weight: "500g pack",
//     description: "Hygienically dried smoked catfish with no preservatives.",
//     image: "./assets/images/smoked-catfish.jpeg"
//   },
//   {
//     name: "Catfish Feed - 2mm Floating (15kg)",
//     category: "Fish Feed",
//     price: 18500,
//     weight: "15kg Bag",
//     description: "High-protein starter feed for fingerlings and juveniles.",
//     image: "./assets/images/3rd-image.jpeg"
//   },
//   {
//     name: "Catfish Feed - 4mm Growth (15kg)",
//     category: "Fish Feed",
//     price: 17500,
//     weight: "15kg Bag",
//     description: "Floating growth pellets designed for rapid weight gain.",
//     image: "./assets/images/3rd-image.jpeg"
//   },
//   {
//     name: "Mature Broodstock (Pair)",
//     category: "Breeding Stock",
//     price: 18000,
//     weight: "2 mature fish",
//     description: "Selected high-quality male and female breeders for fish farming.",
//     image: "./assets/images/live-catfish.jpeg"
//   },
//   {
//     name: "Pond Water Treatment Solution (1L)",
//     category: "Farm Supplies",
//     price: 6500,
//     weight: "1 Litre bottle",
//     description: "Helps maintain optimal pH levels and clear pond water.",
//     image: "./assets/images/3rd-image.jpeg"
//   }
// ];

// mongoose.connect(process.env.MONGO_URL)
//   .then(async () => {
//     await Product.deleteMany(); // clear old database products
//     await Product.insertMany(products);
//     console.log("✅ Products Seeded Successfully!");
//     mongoose.connection.close();
//   })
//   .catch((err) => {
//     console.error("❌ Database seeding error:", err);
//   });
