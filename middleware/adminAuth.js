const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Protect admin routes - verify admin JWT token
const protectAdmin = async (req, res, next) => {
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
                message: 'Not authorized. Admin access required.'
            });
        }

        try {
            // Verify admin token
            const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

            // Get admin from token
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found. Please login again.'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired admin token. Please login again.'
            });
        }
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Admin authentication failed'
        });
    }
};

// Generate admin JWT token
const generateAdminToken = (id, expiresIn = process.env.JWT_EXPIRE || '7d') => {
    return jwt.sign({ id }, process.env.JWT_ADMIN_SECRET, { expiresIn });
};

module.exports = {
    protectAdmin,
    generateAdminToken
};
