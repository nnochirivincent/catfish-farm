const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  pondIdentifier: {
    type: String,
    required: true,
    trim: true
  },
  batchName: {
    type: String,
    required: true,
    trim: true
  },
  initialStockCount: {
    type: Number,
    required: true,
    min: 0
  },
  currentStockCount: {
    type: Number,
    required: true,
    min: 0
  },
  mortalityCount: {
    type: Number,
    default: 0,
    min: 0
  },
  averageWeightGrams: {
    type: Number,
    required: true,
    min: 0
  },
  feedInventoryBags: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  stage: {
    type: String,
    enum: ['Fingerling', 'Juvenile', 'Post-Juvenile', 'Melange', 'Table-Size'],
    default: 'Juvenile'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Auto-update timestamp on save
batchSchema.pre('save', function() {
  this.lastUpdated = Date.now();
});
module.exports = mongoose.model('Batch', batchSchema);
