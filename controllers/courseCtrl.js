const Courses = require('../models/Course');

const courseCtrl = {
    getCourses: async (req, res) => {
        try {
            const courses = await Courses.find();
            res.json(courses);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    createCourse: async (req, res) => {
        try {
            const { title, description, price, image, category, teacher } = req.body;

            const newCourse = new Courses({
                title, description, price, image, category, teacher
            });

            await newCourse.save();
            res.json({ msg: "Đã tạo khóa học thành công!" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = courseCtrl;