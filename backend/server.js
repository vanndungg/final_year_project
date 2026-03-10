const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// --- 1. CẤU HÌNH MIDDLEWARE (Đặt trên cùng) ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ contentSecurityPolicy: false }));

// Cấu hình CORS: Cho phép Frontend truy cập
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', /\.ngrok-free\.app$/, /\.ngrok-free\.dev$/],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Thêm PATCH cho update role/cart
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- 2. CẤU HÌNH SWAGGER ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Learning API Documentation',
            version: '1.0.0',
            description: 'Tài liệu API cho hệ thống học trực tuyến',
        },
        servers: [
            { url: 'http://localhost:5000', description: 'Local Server' },
            { url: 'https://seminivorous-mozelle-postesophageal.ngrok-free.dev', description: 'Ngrok Server' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- 3. ĐĂNG KÝ CÁC ROUTES (Sắp xếp lại logic) ---

// Nhóm Auth: Xử lý Đăng ký / Đăng nhập
// Lưu ý: Đảm bảo trong authRouter dùng userCtrl đồng nhất với hệ thống số (0/1)
app.use('/api', require('./routes/authRouter')); 

// Nhóm Users: Xử lý Profile, Giỏ hàng, Admin quản lý User
app.use('/api/users', require('./routes/userRouter'));

// Nhóm Courses & Nội dung
app.use('/api/courses', require('./routes/courseRouter')); 
app.use('/api/lessons', require('./routes/lessonRouter')); 
app.use('/api/reviews', require('./routes/reviewRouter'));
app.use('/api/progress', require('./routes/progressRouter'));

// --- 4. TRANG CHỦ BACKEND ---
app.get('/', (req, res) => {
    res.send("🚀 Backend E-Learning đang hoạt động. Truy cập <a href='/api-docs'>/api-docs</a> để xem tài liệu!");
});

// --- 5. XỬ LÝ LỖI TẬP TRUNG (ERROR HANDLING) ---
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        msg: err.message || "Lỗi server nội bộ",
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// --- 6. KẾT NỐI DATABASE VÀ KHỞI CHẠY ---
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URL;

mongoose.set('strictQuery', false);
mongoose.connect(URI)
    .then(() => {
        console.log("✅ Đã kết nối thành công tới MongoDB");
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📖 Swagger UI: http://localhost:5000/api-docs`);
        });
    })
    .catch(err => {
        console.error("❌ Lỗi kết nối MongoDB:", err.message);
        process.exit(1);
    });