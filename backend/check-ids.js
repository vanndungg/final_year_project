const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Course = require('./models/Course');
// ket noi database va in id cua user/course de doi chieu du lieu.
async function checkIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        
        const users = await User.find();
        const courses = await Course.find();
        
        console.log('?? Users:');
        users.forEach(u => {
            const suffix = u._id.toString().slice(-6);
            console.log(`  ${u.name}: ${u._id} (suffix: ${suffix})`);
        });
        
        console.log('\n?? Courses:');
        courses.forEach(c => {
            const suffix = c._id.toString().slice(-6);
            console.log(`  ${c.title}: ${c._id} (suffix: ${suffix})`);
        });
        
        process.exit();
    } catch(e) {
        console.error(e.message);
        process.exit(1);
    }
}

checkIds();