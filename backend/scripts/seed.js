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

const STUDENT_COUNT = 5;
const COURSE_COUNT = 5;
const LESSONS_PER_COURSE = 5;

const COURSE_CATEGORIES = ['Development', 'Design & Creative', 'Marketing', 'Business', 'Data'];
const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced', 'all-levels', 'beginner'];
const LESSON_TYPE_SEQUENCE = ['video', 'document', 'quiz', 'assignment', 'video'];

const REVIEW_COMMENTS = [
    'Noi dung de hieu, hoc xong ung dung duoc ngay.',
    'Bai giang chi tiet, dan dat logic.',
    'Quiz va assignment rat huu ich.',
    'Phu hop cho nguoi moi bat dau.',
    'Chat luong on dinh, dang hoc tiep cac khoa khac.'
];

const QUIZ_QUESTION_BANK = [
    {
        question: 'Muc tieu chinh cua bai hoc nay la gi?',
        options: ['Nam vung khai niem co ban', 'Ghi nho ly thuyet thuong mai', 'Doc them tai lieu ngoai'],
        correctOptionIndex: 0
    },
    {
        question: 'Buoc nao nen lam truoc khi thuc hanh?',
        options: ['Doc huong dan', 'Lam bai tap ngay', 'Bo qua phan gioi thieu'],
        correctOptionIndex: 0
    },
    {
        question: 'Chi so nao dung de danh gia ket qua?',
        options: ['Muc do hoan thanh', 'So lan click', 'Mau sac giao dien'],
        correctOptionIndex: 0
    }
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = (arr) => {
    const cloned = [...arr];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
};

const buildQuizQuestions = () => {
    const questions = shuffle(QUIZ_QUESTION_BANK).slice(0, randomInt(2, 3));
    return questions.map((item) => ({
        question: item.question,
        options: item.options,
        correctOptionIndex: item.correctOptionIndex
    }));
};

const buildLessonPayload = (course, lessonIndex) => {
    const lessonType = LESSON_TYPE_SEQUENCE[lessonIndex - 1] || 'video';

    const commonPayload = {
        title: `Lesson ${lessonIndex}: ${course.title}`,
        description: `Noi dung tong quan cho lesson ${lessonIndex} cua ${course.title}.`,
        lessonType,
        courseId: course._id,
        order: lessonIndex,
        publishStatus: 'publish',
        isPreview: false,
        isDownloadable: false,
        notifyOnPublish: false,
        requireCompletion: false,
        dripDays: Math.max(0, lessonIndex - 1),
        durationMinutes: randomInt(8, 24),
        thumbnail: `https://picsum.photos/seed/${course._id.toString().slice(-6)}-lesson-${lessonIndex}/1280/720`
    };

    if (lessonType === 'video') {
        return {
            ...commonPayload,
            isPreview: lessonIndex === 1,
            video_id: lessonIndex === 1 ? 'RGKi6LSPDLU' : 'TNhaISOUy6Q',
            videoUrl: '',
            videoUploadData: '',
            videoUploadName: ''
        };
    }

    if (lessonType === 'document') {
        return {
            ...commonPayload,
            content: `<p><strong>Document Lesson ${lessonIndex}</strong></p><p>Day la noi dung tai lieu mau cho ${course.title}.</p><p><span style="font-size:18px;">Phan noi dung nhan manh.</span></p>`,
            resourceUrl: ''
        };
    }

    if (lessonType === 'quiz') {
        const quizQuestions = buildQuizQuestions();
        return {
            ...commonPayload,
            quizQuestions,
            quizQuestionCount: quizQuestions.length,
            quizPassingScore: randomInt(70, 85),
            quizTimeLimitMinutes: randomInt(10, 20),
            quizAttemptsAllowed: randomInt(1, 2)
        };
    }

    return {
        ...commonPayload,
        content: `Assignment question: Hay trinh bay cach ban ap dung kien thuc tu ${course.title} vao du an thuc te.`,
        assignmentMaxPoints: 100,
        assignmentDeadline: new Date(Date.now() + randomInt(5, 15) * 24 * 60 * 60 * 1000),
        allowLateSubmission: false
    };
};

const seedData = async () => {
    let connected = false;

    try {
        const uri = process.env.MONGODB_URL;
        if (!uri) {
            throw new Error('Thieu MONGODB_URL trong file .env');
        }

        await mongoose.connect(uri);
        connected = true;

        console.log('Bat dau reset va seed du lieu test...');

        await Promise.all([
            Progress.deleteMany({}),
            Review.deleteMany({}),
            Lesson.deleteMany({}),
            Payment.deleteMany({}),
            Course.deleteMany({}),
            User.deleteMany({})
        ]);

        const passwordHash = await bcrypt.hash('123456', 10);

        const admin = await User.create({
            name: 'Admin EduLearn',
            email: 'admin@edulearn.local',
            password: passwordHash,
            role: 1
        });

        const studentPayloads = Array.from({ length: STUDENT_COUNT }, (_, index) => ({
            name: `Hoc vien ${index + 1}`,
            email: `student${index + 1}@edulearn.local`,
            password: passwordHash,
            role: 0,
            enrolledCourses: []
        }));

        const students = await User.insertMany(studentPayloads);

        const coursePayloads = Array.from({ length: COURSE_COUNT }, (_, index) => {
            const isFree = index % 3 === 0;
            return {
                title: `Khoa hoc test ${index + 1}`,
                description: `Mo ta tong quan cho khoa hoc test ${index + 1}.`,
                category: COURSE_CATEGORIES[index % COURSE_CATEGORIES.length],
                image: `https://picsum.photos/seed/course-${index + 1}/800/500`,
                status: 'publish',
                pricingType: isFree ? 'free' : 'paid',
                price: isFree ? 0 : 300000 + index * 50000,
                currency: 'VND',
                teacher: admin.name,
                visibility: 'public',
                level: COURSE_LEVELS[index % COURSE_LEVELS.length]
            };
        });

        const courses = await Course.insertMany(coursePayloads);

        const allLessonPayloads = [];
        courses.forEach((course) => {
            for (let lessonIndex = 1; lessonIndex <= LESSONS_PER_COURSE; lessonIndex += 1) {
                allLessonPayloads.push(buildLessonPayload(course, lessonIndex));
            }
        });

        const lessons = await Lesson.insertMany(allLessonPayloads);

        const lessonsByCourseMap = new Map();
        lessons.forEach((lesson) => {
            const key = String(lesson.courseId);
            if (!lessonsByCourseMap.has(key)) {
                lessonsByCourseMap.set(key, []);
            }
            lessonsByCourseMap.get(key).push(lesson);
        });

        const payments = [];
        const reviews = [];
        const progresses = [];
        const studentCourseMap = new Map(students.map((student) => [String(student._id), new Set()]));

        for (const course of courses) {
            const courseLessons = lessonsByCourseMap.get(String(course._id)) || [];
            const assignmentLesson = courseLessons.find((lesson) => lesson.lessonType === 'assignment');

            const enrolledCount = randomInt(3, 5);
            const enrolledStudents = shuffle(students).slice(0, enrolledCount);

            for (const student of enrolledStudents) {
                studentCourseMap.get(String(student._id)).add(course._id);

                const completedCandidates = shuffle(courseLessons).slice(0, randomInt(1, 2)).map((lesson) => lesson._id);
                const assignmentSubmissions = [];

                if (assignmentLesson && Math.random() > 0.35) {
                    assignmentSubmissions.push({
                        lessonId: assignmentLesson._id,
                        answer: `Bai nop mau cua ${student.name} cho ${course.title}.`,
                        submittedAt: new Date(Date.now() - randomInt(1, 7) * 24 * 60 * 60 * 1000)
                    });
                }

                progresses.push({
                    userId: student._id,
                    courseId: course._id,
                    completedLessons: completedCandidates,
                    assignmentSubmissions
                });

                payments.push({
                    user_id: String(student._id),
                    name: student.name,
                    email: student.email,
                    paymentID: `PAY-${course._id.toString().slice(-4)}-${student._id.toString().slice(-4)}`,
                    cart: [course],
                    total: Number(course.price || 0),
                    status: true,
                    createdAt: new Date(Date.now() - randomInt(1, 20) * 24 * 60 * 60 * 1000)
                });
            }

            const reviewCount = randomInt(1, 3);
            const reviewStudents = shuffle(enrolledStudents).slice(0, reviewCount);

            reviewStudents.forEach((student, reviewIndex) => {
                reviews.push({
                    courseId: course._id,
                    userId: student._id,
                    rating: randomInt(4, 5),
                    comment: REVIEW_COMMENTS[(reviewIndex + randomInt(0, REVIEW_COMMENTS.length - 1)) % REVIEW_COMMENTS.length]
                });
            });
        }

        await Promise.all([
            User.bulkWrite(
                [...studentCourseMap.entries()].map(([studentId, enrolledSet]) => ({
                    updateOne: {
                        filter: { _id: studentId },
                        update: { $set: { enrolledCourses: [...enrolledSet] } }
                    }
                }))
            ),
            Progress.insertMany(progresses),
            Payment.insertMany(payments),
            Review.insertMany(reviews)
        ]);

        console.log('-----------------------------------------');
        console.log('Seed thanh cong voi du lieu test nho gon:');
        console.log('- 1 tai khoan admin');
        console.log('- 5 tai khoan hoc vien');
        console.log('- 5 khoa hoc (moi khoa 3-5 hoc vien)');
        console.log('- Moi khoa hoc co 5 lessons');
        console.log('- Quiz lesson co bo cau hoi + dap an dung');
        console.log('- Assignment lesson co cau hoi va mot phan du lieu nop bai mau');
        console.log('- Moi khoa hoc co 1-3 reviews (schema hien tai review theo course)');
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

seedData();
