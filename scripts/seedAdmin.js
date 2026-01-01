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
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.error('❌ ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file');
            console.log('Please create a .env file with:');
            console.log('ADMIN_EMAIL=your-email@example.com');
            console.log('ADMIN_PASSWORD=your-secure-password');
            process.exit(1);
        }

        const admin = await Admin.create({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            name: process.env.ADMIN_NAME || 'Administrator',
            role: 'admin'
        });

        console.log('\n✅ Default admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:', admin.email);
        console.log('Name:', admin.name);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANT: Keep your .env file secure!\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
