const express = require('express');
const router = express.Router();
const Traceability = require('../models/traceability');

// 1. LOOKUP BATCH BY BATCH CODE
router.get('/:batchCode', async (req, res) => {
  try {
    const code = req.params.batchCode.toUpperCase().trim();
    const record = await Traceability.findOne({ batchCode: code });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `No verification record found for Batch Code: ${code}`
      });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    console.error("Traceability lookup error:", err.message);
    res.status(500).json({ success: false, message: "Error looking up batch traceability data." });
  }
});

// 2. CREATE A NEW TRACEABILITY RECORD
router.post('/create', async (req, res) => {
  try {
    const {
      batchCode,
      pondIdentifier,
      species,
      hatchDate,
      harvestDate,
      feedTypeUsed,
      waterQualityStatus,
      organicCertified,
      veterinaryInspectionPassed,
      harvestWeightKg,
      notes
    } = req.body;

    if (!batchCode || !pondIdentifier || !hatchDate || !harvestDate || !feedTypeUsed || !harvestWeightKg) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }

    const newRecord = new Traceability({
      batchCode: batchCode.toUpperCase().trim(),
      pondIdentifier,
      species: species || 'Clarias Gariepinus (African Catfish)',
      hatchDate: new Date(hatchDate),
      harvestDate: new Date(harvestDate),
      feedTypeUsed,
      waterQualityStatus: waterQualityStatus || 'Optimal',
      organicCertified: organicCertified !== undefined ? organicCertified : true,
      veterinaryInspectionPassed: veterinaryInspectionPassed !== undefined ? veterinaryInspectionPassed : true,
      harvestWeightKg: Number(harvestWeightKg),
      notes: notes || 'Raised with high-protein eco-friendly floating feed.'
    });

    await newRecord.save();
    res.status(201).json({ success: true, data: newRecord, message: "Traceability record created successfully." });
  } catch (err) {
    console.error("Error creating traceability record:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;