const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
};

// @desc    Check if user can access designer
// @route   GET /api/user/design-access
// @access  Private
const checkDesignAccess = async (req, res) => {
    try {
        const user = req.user;

        const canAccess = user.canAccessDesigner();

        if (!canAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to the designer. Please wait for approval.',
                status: user.status,
                isApproved: user.isApproved
            });
        }

        res.json({
            success: true,
            message: 'Access granted',
            canAccess: true
        });
    } catch (error) {
        console.error('Check access error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check access',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (name) user.name = name;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    checkDesignAccess,
    updateProfile
};
