const express = require('express');
const router = express.Router();
const Batch = require('../models/batch');

// 1. GET ALL ACTIVE BATCHES
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ startDate: -1 });
    res.json({ success: true, count: batches.length, data: batches });
  } catch (err) {
    console.error("Error fetching batches:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch batch inventory data." });
  }
});

// 2. CREATE A NEW BATCH
router.post('/create', async (req, res) => {
  try {
    const { pondIdentifier, batchName, initialStockCount, averageWeightGrams, feedInventoryBags, stage } = req.body;

    if (!pondIdentifier || !batchName || !initialStockCount || !averageWeightGrams) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }

    const newBatch = new Batch({
      pondIdentifier,
      batchName,
      initialStockCount: Number(initialStockCount),
      currentStockCount: Number(initialStockCount),
      mortalityCount: 0,
      averageWeightGrams: Number(averageWeightGrams),
      feedInventoryBags: Number(feedInventoryBags) || 0,
      stage: stage || 'Juvenile'
    });

    await newBatch.save();
    res.status(201).json({ success: true, data: newBatch, message: "New batch registered successfully." });
  } catch (err) {
    console.error("Error creating batch:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// 3. LOG DAILY MORTALITY OR WEIGHT/FEED UPDATE
router.patch('/update-log/:id', async (req, res) => {
  try {
    const { newMortality, newAvgWeight, feedBagsUsed } = req.body;
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    if (newMortality) {
      const addedMortality = Number(newMortality);
      batch.mortalityCount += addedMortality;
      batch.currentStockCount = Math.max(0, batch.currentStockCount - addedMortality);
    }

    if (newAvgWeight) {
      batch.averageWeightGrams = Number(newAvgWeight);
    }

    if (feedBagsUsed) {
      batch.feedInventoryBags = Math.max(0, batch.feedInventoryBags - Number(feedBagsUsed));
    }

    await batch.save();
    res.json({ success: true, data: batch, message: "Batch updated successfully." });
  } catch (err) {
    console.error("Error updating batch log:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;