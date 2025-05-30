const express = require('express');
const router = express.Router();
const { register, login, getScanHistory } = require('../controllers/userController');

// User routes
router.post('/register', register);
router.post('/login', login);
router.get('/:userId/scans', getScanHistory);

module.exports = router;

 