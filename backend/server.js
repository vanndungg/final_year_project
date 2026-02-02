const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); // Thêm bảo mật header
require('dotenv').config();

// Thư viện Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// --- CẤU HÌNH MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ contentSecurityPolicy: false })); // Bảo mật cơ bản cho server

// Cấu hình CORS
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- 1. CẤU HÌNH SWAGGER ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Learning API Documentation',
            version: '1.0.0',
            description: 'Tài liệu API cho hệ thống học trực tuyến',
            contact: { name: 'Văn Dũng' }
        },
        servers: [{ url: 'http://localhost:5000', description: 'Local Server' }],
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

// --- 2. CÁC ĐƯỜNG DẪN ROUTE (API PREFIX) ---

app.use('/api', require('./routes/authRouter')); 
app.use('/api/courses', require('./routes/courseRouter')); 
app.use('/api/users', require('./routes/userRouter'));
app.use('/api/lessons', require('./routes/lessonRouter')); 
app.use('/api/reviews', require('./routes/reviewRouter'));
app.use('/api/progress', require('./routes/progressRouter'));

// --- 3. XỬ LÝ LỖI TẬP TRUNG (GLOBAL ERROR HANDLER) ---
// Middleware này sẽ bắt mọi lỗi từ các route để trả về JSON cho Frontend
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        msg: err.message || "Lỗi server nội bộ",
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// --- 4. KẾT NỐI DATABASE ---
const URI = process.env.MONGODB_URL;
mongoose.set('strictQuery', false); // Tránh cảnh báo của Mongoose mới
mongoose.connect(URI)
    .then(() => console.log("✅ Đã kết nối thành công tới MongoDB"))
    .catch(err => {
        console.error("❌ Lỗi kết nối MongoDB:", err.message);
        process.exit(1); // Dừng server nếu không kết nối được DB
    });

// Route mặc định
app.get('/', (req, res) => {
    res.send("Backend đang hoạt động. Truy cập <a href='/api-docs'>/api-docs</a> để xem tài liệu!");
});

// --- 5. KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📖 Swagger UI: http://localhost:5000/api-docs`);
});