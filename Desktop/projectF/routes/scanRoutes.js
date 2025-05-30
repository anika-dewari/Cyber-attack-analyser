const express = require('express');
const router = express.Router();
const { createScan, getScanHistory } = require('../controllers/scanController');
const { authMiddleware } = require('../middleware/auth');

// Scan routes
router.post('/:type', authMiddleware, createScan); // For specific scan types
router.get('/history', authMiddleware, getScanHistory); // For getting user's scan history

module.exports = router; 