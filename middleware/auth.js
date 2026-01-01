const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please login again.'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Check if user is approved
const checkApproved = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Please login to continue'
            });
        }

        if (!req.user.isApproved || req.user.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Your account is not approved yet. Please wait for admin approval.',
                status: req.user.status,
                isApproved: req.user.isApproved
            });
        }

        next();
    } catch (error) {
        console.error('Approval check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authorization check failed'
        });
    }
};

// Generate JWT token
const generateToken = (id, expiresIn = process.env.JWT_EXPIRE || '7d') => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

module.exports = {
    protect,
    checkApproved,
    generateToken
};
