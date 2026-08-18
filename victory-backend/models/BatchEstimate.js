const mongoose = require('mongoose');

const batchEstimateSchema = new mongoose.Schema({
  stockCount: { type: Number, required: true },
  targetWeightKg: { type: Number, required: true },
  mortalityRatePercent: { type: Number, required: true, default: 5 },
  fingerlingCost: { type: Number, required: true },
  feedCostPerBag: { type: Number, required: true },
  sellingPricePerKg: { type: Number, required: true },
  otherExpenses: { type: Number, default: 0 },
  calculatedMetrics: {
    survivingFish: { type: Number, required: true },
    totalBiomassKg: { type: Number, required: true },
    totalFeedBagsNeeded: { type: Number, required: true },
    totalFeedCost: { type: Number, required: true },
    totalProductionCost: { type: Number, required: true },
    projectedRevenue: { type: Number, required: true },
    projectedNetProfit: { type: Number, required: true },
    roiPercent: { type: Number, required: true },
    profitMarginPercent: { type: Number, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BatchEstimate', batchEstimateSchema);