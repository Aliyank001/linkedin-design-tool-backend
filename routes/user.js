const express = require('express');
const router = express.Router();
const { protect, checkApproved } = require('../middleware/auth');
const { getProfile, checkDesignAccess, updateProfile } = require('../controllers/userController');

// Get current user profile (requires login)
router.get('/profile', protect, getProfile);

// Check if user can access designer (requires login + approval)
router.get('/design-access', protect, checkApproved, checkDesignAccess);

// Update user profile (requires login)
router.put('/profile', protect, updateProfile);

module.exports = router;
