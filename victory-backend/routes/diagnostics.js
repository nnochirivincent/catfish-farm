const express = require('express');
const router = express.Router();
const Diagnostic = require('../models/diagnostic');

// 1. GET ALL DIAGNOSTIC SYMPTOMS FOR FRONTEND WIZARD
router.get('/symptoms', async (req, res) => {
  try {
    const symptoms = await Diagnostic.find({});
    res.json({ success: true, data: symptoms });
  } catch (err) {
    console.error("Diagnostic symptoms fetch error:", err.message);
    res.status(500).json({ success: false, message: "Error fetching diagnostic data." });
  }
});

// 2. ANALYZE SELECTED SYMPTOMS AND GENERATE DIAGNOSTIC REPORT
router.post('/analyze', async (req, res) => {
  try {
    const { selectedKeys } = req.body;

    if (!selectedKeys || !Array.isArray(selectedKeys) || selectedKeys.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one symptom to analyze." });
    }

    const matches = await Diagnostic.find({ symptomKey: { $in: selectedKeys } });

    if (matches.length === 0) {
      return res.status(404).json({ success: false, message: "No matching diagnostic records found." });
    }

    let maxSeverity = 'Low';
    const severityMap = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };

    const causesSet = new Set();
    const actionsSet = new Set();

    matches.forEach(item => {
      if (severityMap[item.severity] > severityMap[maxSeverity]) {
        maxSeverity = item.severity;
      }
      item.possibleCauses.forEach(cause => causesSet.add(cause));
      item.recommendedActions.forEach(action => actionsSet.add(action));
    });

    res.json({
      success: true,
      data: {
        riskLevel: maxSeverity,
        matchedSymptomsCount: matches.length,
        possibleCauses: Array.from(causesSet),
        recommendedActions: Array.from(actionsSet)
      }
    });
  } catch (err) {
    console.error("Diagnostic analysis error:", err.message);
    res.status(500).json({ success: false, message: "Error performing diagnostic analysis." });
  }
});

module.exports = router;
