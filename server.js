const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// Import database connection
const connectDB = require('./config/db');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin-panel')));

// Serve frontend website (main website)
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint - detailed status
app.get('/api/health', async (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    };

    // Check MongoDB connection
    try {
        if (mongoose.connection.readyState === 1) {
            healthCheck.database = 'connected';
        } else {
            healthCheck.database = 'disconnected';
            healthCheck.status = 'ERROR';
        }
    } catch (error) {
        healthCheck.database = 'error';
        healthCheck.status = 'ERROR';
    }

    // Check uploads directory
    try {
        const uploadsPath = path.join(__dirname, 'uploads/payment-screenshots');
        if (require('fs').existsSync(uploadsPath)) {
            healthCheck.uploads = 'ready';
        } else {
            healthCheck.uploads = 'missing';
        }
    } catch (error) {
        healthCheck.uploads = 'error';
    }

    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
});

// System stats endpoint (admin only in production)
app.get('/api/stats', (req, res) => {
    if (process.env.NODE_ENV === 'production' && !req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
    });
});

// 404 handler - Only return JSON for API routes
app.use((req, res) => {
    // If it's an API route, return JSON error
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            success: false, 
            message: 'API endpoint not found' 
        });
    }
    // For other routes, send 404 page or redirect to home
    res.status(404).sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   LinkedIn Design Tool - Backend API Server          ║
    ║                                                       ║
    ║   Server running on: http://localhost:${PORT}          ║
    ║   Admin Panel: http://localhost:${PORT}/admin          ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
