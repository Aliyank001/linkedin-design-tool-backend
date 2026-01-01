const Admin = require('../models/Admin');
const User = require('../models/User');
const { generateAdminToken } = require('../middleware/adminAuth');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find admin and include password
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        // Check if password matches
        const isPasswordCorrect = await admin.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        // Update last login
        await admin.updateLastLogin();

        // Generate token
        const token = generateAdminToken(admin._id);

        res.json({
            success: true,
            message: 'Admin login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: error.message
        });
    }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboard = async (req, res) => {
    try {
        // Get counts
        const totalUsers = await User.countDocuments();
        const approvedUsers = await User.countDocuments({ status: 'approved', isApproved: true });
        const pendingUsers = await User.countDocuments({ status: 'pending' });
        const rejectedUsers = await User.countDocuments({ status: 'rejected' });

        // Active users (logged in within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeUsers = await User.countDocuments({
            lastLogin: { $gte: sevenDaysAgo },
            isApproved: true
        });

        // Recent registrations (last 7 days)
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Approval rate
        const approvalRate = totalUsers > 0 
            ? ((approvedUsers / totalUsers) * 100).toFixed(2) 
            : 0;

        // Get recent users
        const recentUsers = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get pending users
        const pendingUsersList = await User.find({ status: 'pending' })
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                analytics: {
                    totalUsers,
                    approvedUsers,
                    pendingUsers,
                    rejectedUsers,
                    activeUsers,
                    recentRegistrations,
                    approvalRate: parseFloat(approvalRate)
                },
                recentUsers,
                pendingUsersList
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard',
            error: error.message
        });
    }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        // Build query
        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count
        const total = await User.countDocuments(query);

        // Get users with pagination
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message
        });
    }
};

// @desc    Approve user
// @route   POST /api/admin/users/:id/approve
// @access  Private/Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isApproved = true;
        user.status = 'approved';
        user.rejectionReason = null;
        
        // Set subscription dates (30 days from approval)
        user.subscriptionStartDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days subscription
        user.subscriptionEndDate = endDate;
        await user.save();

        res.json({
            success: true,
            message: 'User approved successfully',
            data: {
                userId: user._id,
                name: user.name,
                email: user.email,
                status: user.status,
                isApproved: user.isApproved
            }
        });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve user',
            error: error.message
        });
    }
};

// @desc    Reject user
// @route   POST /api/admin/users/:id/reject
// @access  Private/Admin
const rejectUser = async (req, res) => {
    try {
        const { reason } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isApproved = false;
        user.status = 'rejected';
        user.rejectionReason = reason || 'Payment verification failed';
        await user.save();

        res.json({
            success: true,
            message: 'User rejected successfully',
            data: {
                userId: user._id,
                name: user.name,
                email: user.email,
                status: user.status,
                rejectionReason: user.rejectionReason
            }
        });
    } catch (error) {
        console.error('Reject user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject user',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

module.exports = {
    adminLogin,
    getDashboard,
    getAllUsers,
    getUserById,
    approveUser,
    rejectUser,
    deleteUser
};
