

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

const TEACHERS = [
    { name: 'Nguyễn Thành Công', nationality: 'vi' },
    { name: 'Trần Minh Hương', nationality: 'vi' },
    { name: 'Lê Văn An', nationality: 'vi' },
    { name: 'Phạm Bảo Nam', nationality: 'vi' },
    { name: 'Bùi Thị Lan', nationality: 'vi' },
    { name: 'Anna Müller', nationality: 'de' },
    { name: 'John Smith', nationality: 'us' },
    { name: 'Sophia Davis', nationality: 'us' },
    { name: 'Emma Johansson', nationality: 'se' },
    { name: 'Carlos Fernandez', nationality: 'es' }
];

const COURSE_CATEGORIES = ['Development', 'Design & Creative', 'Marketing', 'Business', 'Data'];
const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced', 'all-levels'];
const LESSON_TYPES = ['video', 'document', 'quiz', 'assignment'];

const REVIEW_COMMENTS = [
    'Khóa học rất hữu ích, dễ hiểu và ứng dụng được ngay vào thực tế.',
    'Giáo viên giảng dạy tuyệt vời, từng bước từng chi tiết rất rõ ràng.',
    'Bài tập và quiz giúp tôi vạch rõ những điểm yếu trong kỹ năng của mình.',
    'Phù hợp cho người mới bắt đầu, cấu trúc bài học rất logic và khoa học.',
    'Chất lượng nội dung ổn định, sẽ tiếp tục học các khóa khác của giáo viên này.'
];

const QUIZ_QUESTION_BANK = [
    {
        question: 'What is the main objective of this lesson?',
        options: ['Understand core concepts', 'Memorize theory', 'Read additional documents'],
        correctOptionIndex: 0
    },
    {
        question: 'Which step should you take before practicing?',
        options: ['Read the guide carefully', 'Start exercises immediately', 'Skip the introduction'],
        correctOptionIndex: 0
    },
    {
        question: 'What is the correct metric to evaluate results?',
        options: ['Completion rate', 'Number of clicks', 'Interface color'],
        correctOptionIndex: 0
    },
    {
        question: 'How do you implement best practices in your code?',
        options: ['Follow conventions and principles', 'Write code quickly', 'Use any approach that works'],
        correctOptionIndex: 0
    },
    {
        question: 'What is a key benefit of code documentation?',
        options: ['Helps others understand your code', 'Makes code run faster', 'Reduces file size'],
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

const buildPaymentPayload = ({ student, course }) => {
    const createdAt = new Date(Date.now() - randomInt(1, 20) * 24 * 60 * 60 * 1000);
    const total = Number(course.price || 0);

    return {
        user_id: String(student._id),
        name: student.name,
        email: student.email,
        paymentID: `PAY-${course._id.toString().slice(-4)}-${student._id.toString().slice(-4)}`,
        paymentCode: `SEED-${course._id.toString().slice(-3).toUpperCase()}-${student._id.toString().slice(-3).toUpperCase()}`,
        cart: [course],
        subtotal: total,
        discount: 0,
        couponCode: '',
        total,
        status: 'paid',
        gateway: total > 0 ? 'VNPAY' : 'FREE',
        transferAmount: total,
        isFulfilled: true,
        paidAt: createdAt,
        createdAt,
        updatedAt: createdAt
    };
};

const getTeacherAvatar = (index) => `https://i.pravatar.cc/200?img=${20 + index}`;
const getStudentAvatar = (index) => `https://i.pravatar.cc/200?img=${50 + index}`;
const getCourseTitle = (teacher, index) => `${teacher.name.split(' ')[0]} Course ${index + 1}`;
const getCourseDescription = (teacher, index) => `Khóa học toàn diện từ giảng viên ${teacher.name} với nội dung bài bản và thực tiễn. Bao gồm video giải thích chi tiết, tài liệu hỗ trợ, bài kiểm tra để đánh giá kiến thức, và bài tập thực hành để áp dụng kỹ năng. Phù hợp cho cả người mới bắt đầu và những người muốn nâng cao kỹ năng.`;
const getRandomCoursePrice = (index) => 150000 + index * 15000;

const seedData = async () => {
    let connected = false;

    try {
        const uri = process.env.MONGODB_URL;
        if (!uri) {
            throw new Error('Thieu MONGODB_URL trong file .env');
        }

        await mongoose.connect(uri);
        connected = true;

        console.log('Bat dau reset va seed du lieu mau...');

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

        const teacherUsers = await User.insertMany(
            TEACHERS.map((teacher, index) => ({
                name: teacher.name,
                email: `teacher${index + 1}@gmail.com`,
                password: passwordHash,
                role: 2,
                avatar: getTeacherAvatar(index),
                enrolledCourses: []
            }))
        );

        const studentUsers = await User.insertMany(
            Array.from({ length: 10 }, (_, index) => ({
                name: `Hoc vien ${index + 1}`,
                email: `student${index + 1}@gmail.com`,
                password: passwordHash,
                role: 0,
                avatar: getStudentAvatar(index),
                enrolledCourses: []
            }))
        );

        const coursePayloads = [];
        teacherUsers.forEach((teacher, teacherIndex) => {
            for (let courseIndex = 0; courseIndex < 2; courseIndex += 1) {
                const courseNumber = teacherIndex * 2 + courseIndex + 1;
                const isFree = courseNumber % 4 === 0;
                coursePayloads.push({
                    title: getCourseTitle(teacher, courseIndex),
                    description: getCourseDescription(teacher, courseIndex),
                    category: COURSE_CATEGORIES[courseNumber % COURSE_CATEGORIES.length],
                    image: `https://picsum.photos/seed/course-${courseNumber}/800/500`,
                    status: 'publish',
                    pricingType: isFree ? 'free' : 'paid',
                    price: isFree ? 0 : getRandomCoursePrice(courseNumber),
                    currency: 'VND',
                    teacher: teacher.name,
                    visibility: 'public',
                    level: COURSE_LEVELS[courseNumber % COURSE_LEVELS.length]
                });
            }
        });

        const courses = await Course.insertMany(coursePayloads);

        const allLessonPayloads = [];
        courses.forEach((course) => {
            const lessonCount = randomInt(4, 10);
            const requiredTypes = [...LESSON_TYPES];
            const extraTypes = Array.from({ length: Math.max(0, lessonCount - requiredTypes.length) }, () => LESSON_TYPES[randomInt(0, LESSON_TYPES.length - 1)]);
            const lessonTypes = shuffle([...requiredTypes, ...extraTypes]);

            lessonTypes.forEach((lessonType, lessonIndex) => {
                const basePayload = {
                    title: `Lesson ${lessonIndex + 1}: ${course.title}`,
                    description: `Learn key concepts and practical skills for ${course.title}. This lesson covers important topics with examples and exercises.`,
                    lessonType,
                    courseId: course._id,
                    order: lessonIndex + 1,
                    publishStatus: 'publish',
                    isPreview: lessonIndex === 0,
                    isDownloadable: false,
                    notifyOnPublish: false,
                    requireCompletion: false,
                    dripDays: Math.max(0, lessonIndex),
                    durationMinutes: randomInt(8, 24),
                    thumbnail: `https://picsum.photos/seed/${course._id.toString().slice(-6)}-lesson-${lessonIndex + 1}/1280/720`
                };

                if (lessonType === 'video') {
                    allLessonPayloads.push({
                        ...basePayload,
                        video_id: lessonIndex === 0 ? 'RGKi6LSPDLU' : 'TNhaISOUy6Q',
                        videoUrl: '',
                        videoUploadData: '',
                        videoUploadName: ''
                    });
                    return;
                }

                if (lessonType === 'document') {
                    allLessonPayloads.push({
                        ...basePayload,
                        content: `<h2>Document Lesson ${lessonIndex + 1}</h2><p>This document covers essential concepts and best practices related to ${course.title}. Study the following key points carefully:</p><ul><li>Understand fundamental principles</li><li>Learn practical applications</li><li>Review common mistakes and how to avoid them</li><li>Practice with real-world examples</li></ul><p><strong>Remember:</strong> Mastering these concepts will help you succeed in this course.</p>`,
                        resourceUrl: ''
                    });
                    return;
                }

                if (lessonType === 'quiz') {
                    const quizQuestions = buildQuizQuestions();
                    allLessonPayloads.push({
                        ...basePayload,
                        quizQuestions,
                        quizQuestionCount: quizQuestions.length,
                        quizPassingScore: randomInt(70, 85),
                        quizTimeLimitMinutes: randomInt(10, 20),
                        quizAttemptsAllowed: randomInt(1, 2)
                    });
                    return;
                }

                allLessonPayloads.push({
                    ...basePayload,
                    content: `<h2>Assignment: Apply Your Knowledge</h2><p>For this assignment, please complete the following task:</p><p><strong>Task:</strong> Demonstrate how to apply the concepts from ${course.title} to a real-world project. Include:</p><ul><li>Problem description and context</li><li>Your approach and solution</li><li>Code examples or documentation</li><li>Challenges faced and how you overcame them</li><li>Results and what you learned</li></ul><p>Submit your work as a document or code repository with clear explanations.</p>`,
                    assignmentMaxPoints: 100,
                    assignmentDeadline: new Date(Date.now() + randomInt(5, 15) * 24 * 60 * 60 * 1000),
                    allowLateSubmission: false
                });
            });
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

        const courseIds = courses.map((course) => course._id);
        const progressDocuments = [];
        const payments = [];
        const reviews = [];

        for (const student of studentUsers) {
            const selectedCourses = shuffle(courseIds).slice(0, 5);
            student.enrolledCourses = selectedCourses;
            await student.save();

            for (const courseId of selectedCourses) {
                const course = courses.find((item) => String(item._id) === String(courseId));
                const courseLessons = shuffle(lessonsByCourseMap.get(String(courseId)) || []);
                const completedCount = randomInt(1, Math.max(1, courseLessons.length - 1));
                const completedLessons = courseLessons.slice(0, completedCount).map((lesson) => lesson._id);
                const assignmentLesson = courseLessons.find((lesson) => lesson.lessonType === 'assignment');
                const assignmentSubmissions = [];

                if (assignmentLesson && Math.random() > 0.4) {
                    assignmentSubmissions.push({
                        lessonId: assignmentLesson._id,
                        answer: `Bai nop mau cua ${student.name} cho ${course.title}.`,
                        submittedAt: new Date(Date.now() - randomInt(1, 10) * 24 * 60 * 60 * 1000)
                    });
                }

                progressDocuments.push({
                    userId: student._id,
                    courseId: course._id,
                    completedLessons,
                    assignmentSubmissions
                });

                payments.push(buildPaymentPayload({ student, course }));

                if (Math.random() > 0.3) {
                    reviews.push({
                        courseId: course._id,
                        userId: student._id,
                        rating: randomInt(4, 5),
                        comment: REVIEW_COMMENTS[randomInt(0, REVIEW_COMMENTS.length - 1)]
                    });
                }
            }
        }

        await Promise.all([
            Progress.insertMany(progressDocuments),
            Payment.insertMany(payments),
            Review.insertMany(reviews)
        ]);

        console.log('-----------------------------------------');
        console.log('Seed thanh cong voi du lieu mau:');
        console.log(`- Admin: ${ACCOUNT_SEEDS.admin.email} / ${DEFAULT_PASSWORD}`);
        console.log(`- ${teacherUsers.length} giang vien (Viet Nam + nuoc ngoai)`);
        console.log(`- ${studentUsers.length} hoc vien, moi hoc vien dang ky 5 khoa hoc`);
        console.log(`- ${courses.length} khoa hoc (2 khoa hoc/giang vien)`);
        console.log(`- Moi khoa hoc co tu 4 den 10 lesson voi cac loai video, document, quiz, assignment`);
        console.log('- Du lieu bao gom progress, payment va review mau');
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