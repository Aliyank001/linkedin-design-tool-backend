const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminAuth');
const {
    adminLogin,
    getDashboard,
    getAllUsers,
    getUserById,
    approveUser,
    rejectUser,
    deleteUser
} = require('../controllers/adminController');

// Admin login (public)
router.post('/login', adminLogin);

// Protected admin routes
router.use(protectAdmin); // All routes below require admin authentication

// Dashboard analytics
router.get('/dashboard', getDashboard);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users/:id/approve', approveUser);
router.post('/users/:id/reject', rejectUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
