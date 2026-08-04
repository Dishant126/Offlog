import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

const ADMIN_EMAIL = 'admin@offlog.com';
const ADMIN_PASSWORD = 'Admin@1234';

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check for existing admin by email
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    // Password hashing is handled by User model pre-save hook
    await User.create({
      name: 'System Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'ADMIN',
      bio: 'Platform administrator'
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
