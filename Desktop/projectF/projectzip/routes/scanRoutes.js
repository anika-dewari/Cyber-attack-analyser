const express = require('express');
const router = express.Router();
const { createScan, getScanHistory } = require('../controllers/scanController');

// Scan routes
router.post('/', createScan);
router.get('/:userId', getScanHistory);

module.exports = router; 