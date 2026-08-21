const mongoose = require('mongoose');

const diagnosticSchema = new mongoose.Schema({
  symptomKey: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  symptomName: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  possibleCauses: [{
    type: String
  }],
  recommendedActions: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Diagnostic', diagnosticSchema);
