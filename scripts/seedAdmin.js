const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB Connected');

        // Check if admin already exists
        const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

        if (adminExists) {
            console.log('Admin already exists!');
            console.log('Email:', adminExists.email);
            process.exit(0);
        }

        // Create default admin
        const admin = await Admin.create({
            email: process.env.ADMIN_EMAIL || 'admin@linkedindesign.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123456',
            name: 'Administrator',
            role: 'admin'
        });

        console.log('\n✅ Default admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:', admin.email);
        console.log('Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
