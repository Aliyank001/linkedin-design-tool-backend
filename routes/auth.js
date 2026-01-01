const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { register, login, getUserStatus } = require('../controllers/authController');

// Register new user (with payment screenshot upload)
router.post('/register', upload.single('paymentScreenshot'), register);

// Login user
router.post('/login', login);

// Get user status by email
router.get('/status', getUserStatus);

module.exports = router;
