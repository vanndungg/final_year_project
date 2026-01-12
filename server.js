const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Thêm 2 thư viện Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());
app.use(cors());

// --- CẤU HÌNH SWAGGER ---
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Learning API Documentation',
            version: '1.0.0',
            description: 'Tài liệu API cho đồ án tốt nghiệp - Hệ thống học trực tuyến',
            contact: {
                name: 'Văn Dũng'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Server'
            }
        ],
        components: {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjRiMzBlZjk2YjkwZmVkMjI0ZDdlZiIsImlhdCI6MTc2ODIwNzE5MywiZXhwIjoxNzY4MjkzNTkzfQ.V99amAaj1EnqrFD-h3f7ujYXIyVwOgzpuMF9w15ma04'
        }
    }
}
    },
    // Trỏ đến tất cả các file trong thư mục routes để quét chú thích
    apis: ["./routes/*.js", "./server.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// -----------------------

// --- CÁC ĐƯỜNG DẪN ROUTE ---
app.use('/api', require('./routes/authRouter')); 
app.use('/api', require('./routes/courseRouter')); 

const URI = process.env.MONGODB_URL;

mongoose.connect(URI)
    .then(() => {
        console.log("✅ Đã kết nối thành công tới MongoDB");
    })
    .catch(err => {
        console.error("❌ Lỗi kết nối MongoDB rồi bạn ơi:");
        console.error(err.message);
    });

app.get('/', (req, res) => {
    res.send("Server đang chạy tốt. Truy cập /api-docs để xem tài liệu API!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📖 Swagger UI tại địa chỉ: http://localhost:5000/api-docs`);
});