const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Course = require('../models/Course');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const Progress = require('../models/Progress');

const DEFAULT_PASSWORD = '123456';

const ACCOUNT_SEEDS = {
    admin: {
        name: 'Admin EduLearn',
        email: 'admin@gmail.com',
        role: 1,
        avatar: 'https://i.pravatar.cc/200?img=12'
    }
};

const seedClean = async () => {
    let connected = false;

    try {
        const uri = process.env.MONGODB_URL;
        if (!uri) {
            throw new Error('Thieu MONGODB_URL trong file .env');
        }

        await mongoose.connect(uri);
        connected = true;

        console.log('Bat dau xoa toan bo du lieu...');

        await Promise.all([
            Progress.deleteMany({}),
            Review.deleteMany({}),
            Lesson.deleteMany({}),
            Payment.deleteMany({}),
            Course.deleteMany({}),
            User.deleteMany({})
        ]);

        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        await User.create({
            name: ACCOUNT_SEEDS.admin.name,
            email: ACCOUNT_SEEDS.admin.email,
            password: passwordHash,
            role: ACCOUNT_SEEDS.admin.role,
            avatar: ACCOUNT_SEEDS.admin.avatar
        });

        console.log('-----------------------------------------');
        console.log('Xoa du lieu thanh cong!');
        console.log('Chi giu lai tai khoan admin:');
        console.log(`- Email: ${ACCOUNT_SEEDS.admin.email}`);
        console.log(`- Password: ${DEFAULT_PASSWORD}`);
        console.log('-----------------------------------------');
    } catch (error) {
        console.error('Loi seed data:', error.message);
        process.exitCode = 1;
    } finally {
        if (connected) {
            await mongoose.disconnect();
        }
    }
};

seedClean();
