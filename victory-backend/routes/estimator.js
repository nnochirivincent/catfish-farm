const express = require('express');
const router = express.Router();
const BatchEstimate = require('../models/BatchEstimate');

// POST /api/estimator/calculate - Perform server-side calculation and optionally save
router.post('/calculate', async (req, res) => {
  try {
    const {
      stockCount,
      targetWeightKg,
      mortalityRatePercent,
      fingerlingCost,
      feedCostPerBag,
      sellingPricePerKg,
      otherExpenses,
      fcr, // Feed Conversion Ratio (default ~1.2 for catfish)
      saveCalculation
    } = req.body;

    const stock = Number(stockCount);
    const targetWeight = Number(targetWeightKg);
    const mortality = Number(mortalityRatePercent) / 100;
    const costPerFingerling = Number(fingerlingCost);
    const bagCost = Number(feedCostPerBag);
    const pricePerKg = Number(sellingPricePerKg);
    const overheads = Number(otherExpenses) || 0;
    const feedConversionRatio = Number(fcr) || 1.2;

    if (!stock || !targetWeight || !costPerFingerling || !bagCost || !pricePerKg) {
      return res.status(400).json({ success: false, message: 'Please provide all required parameters.' });
    }

    // Mathematical Calculations
    const survivingFish = Math.floor(stock * (1 - mortality));
    const totalBiomassKg = survivingFish * targetWeight;
    
    // Total feed required in KG = Biomass produced * FCR
    const totalFeedKgNeeded = totalBiomassKg * feedConversionRatio;
    const totalFeedBagsNeeded = Math.ceil(totalFeedKgNeeded / 15); // 15kg per standard feed bag
    const totalFeedCost = totalFeedBagsNeeded * bagCost;
    
    const totalFingerlingCost = stock * costPerFingerling;
    const totalProductionCost = totalFingerlingCost + totalFeedCost + overheads;
    
    const projectedRevenue = totalBiomassKg * pricePerKg;
    const projectedNetProfit = projectedRevenue - totalProductionCost;
    const roiPercent = totalProductionCost > 0 ? (projectedNetProfit / totalProductionCost) * 100 : 0;
    const profitMarginPercent = projectedRevenue > 0 ? (projectedNetProfit / projectedRevenue) * 100 : 0;

    const metrics = {
      survivingFish,
      totalBiomassKg: Number(totalBiomassKg.toFixed(2)),
      totalFeedBagsNeeded,
      totalFeedCost: Number(totalFeedCost.toFixed(2)),
      totalProductionCost: Number(totalProductionCost.toFixed(2)),
      projectedRevenue: Number(projectedRevenue.toFixed(2)),
      projectedNetProfit: Number(projectedNetProfit.toFixed(2)),
      roiPercent: Number(roiPercent.toFixed(1)),
      profitMarginPercent: Number(profitMarginPercent.toFixed(1))
    };

    if (saveCalculation) {
      const savedEstimate = new BatchEstimate({
        stockCount: stock,
        targetWeightKg: targetWeight,
        mortalityRatePercent: Number(mortalityRatePercent),
        fingerlingCost: costPerFingerling,
        feedCostPerBag: bagCost,
        sellingPricePerKg: pricePerKg,
        otherExpenses: overheads,
        calculatedMetrics: metrics
      });
      await savedEstimate.save();
    }

    return res.status(200).json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Estimator Route Error:', error);
    return res.status(500).json({ success: false, message: 'Server calculation error.' });
  }
});

// GET /api/estimator/saved - Fetch all saved estimates sorted by newest first
router.get('/saved', async (req, res) => {
  try {
    const estimates = await BatchEstimate.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: estimates.length,
      data: estimates
    });
  } catch (error) {
    console.error('Fetch Estimates Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve estimates.' });
  }
});

module.exports = router;
