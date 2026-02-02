const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Thư viện Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// --- CẤU HÌNH MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Hỗ trợ gửi data qua form

// Cấu hình CORS để cho phép Frontend (Vite) truy cập
app.use(cors({
    origin: 'http://localhost:5173', // Địa chỉ Frontend của bạn
    credentials: true
}));

// --- 1. CẤU HÌNH SWAGGER ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Learning API Documentation',
            version: '1.0.0',
            description: 'Tài liệu API cho hệ thống học trực tuyến - Full Logic',
            contact: { name: 'Văn Dũng' }
        },
        servers: [{ url: 'http://localhost:5000', description: 'Local Server' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Dán mã access_token vào đây'
                }
            }
        }
    },
    apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- 2. CÁC ĐƯỜNG DẪN ROUTE (ĐÃ PHÂN TÁCH PREFIX) ---

app.use('/api', require('./routes/authRouter')); 
app.use('/api/courses', require('./routes/courseRouter')); 
app.use('/api/users', require('./routes/userRouter'));
app.use('/api/lessons', require('./routes/lessonRouter')); 
app.use('/api/reviews', require('./routes/reviewRouter'));
app.use('/api/progress', require('./routes/progressRouter'));

// --- 3. KẾT NỐI DATABASE ---
const URI = process.env.MONGODB_URL;
mongoose.connect(URI)
    .then(() => console.log("✅ Đã kết nối thành công tới MongoDB"))
    .catch(err => {
        console.error("❌ Lỗi kết nối MongoDB:");
        console.error(err.message);
    });

// Route mặc định
app.get('/', (req, res) => {
    res.send("Backend đang hoạt động. Truy cập <a href='/api-docs'>/api-docs</a> để xem tài liệu API!");
});

// --- 4. KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📖 Swagger UI: http://localhost:5000/api-docs`);
});