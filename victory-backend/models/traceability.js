const mongoose = require('mongoose');

const traceabilitySchema = new mongoose.Schema({
  batchCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  pondIdentifier: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    default: 'Clarias Gariepinus (African Catfish)'
  },
  hatchDate: {
    type: Date,
    required: true
  },
  harvestDate: {
    type: Date,
    required: true
  },
  feedTypeUsed: {
    type: String,
    required: true
  },
  waterQualityStatus: {
    type: String,
    enum: ['Optimal', 'Good', 'Monitored'],
    default: 'Optimal'
  },
  organicCertified: {
    type: Boolean,
    default: true
  },
  veterinaryInspectionPassed: {
    type: Boolean,
    default: true
  },
  harvestWeightKg: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: 'Raised with high-protein eco-friendly floating feed under standard biosecurity protocols.'
  }
}, { timestamps: true });

module.exports = mongoose.model('Traceability', traceabilitySchema);