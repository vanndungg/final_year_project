

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
// khoi tao backend, gan middleware va route, ket noi db roi chay server.

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// cau hinh middleware de parse body, bao mat va cors.
// tang gioi han body de nhan duoc du lieu pdf base64 lon.
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(helmet({ contentSecurityPolicy: false }));

// cho phep frontend goi api tu domain local va ngrok.
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', /\.ngrok-free\.app$/, /\.ngrok-free\.dev$/],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// cau hinh swagger de hien thi tai lieu api.
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Learning API Documentation',
            version: '1.0.0',
            description: 'API Documentation for E-Learning System',
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

// dang ky route auth.
app.use('/api', require('./routes/authRouter')); 

// dang ky route nguoi dung.
app.use('/api/users', require('./routes/userRouter'));

// dang ky route khoa hoc, bai hoc, review, tien do va thanh toan vnpay.
app.use('/api/courses', require('./routes/courseRouter')); 
app.use('/api/lessons', require('./routes/lessonRouter')); 
app.use('/api/reviews', require('./routes/reviewRouter'));
app.use('/api/progress', require('./routes/progressRouter'));
app.use('/api/vnpay', require('./routes/vnpayRouter'));

// tra thong diep kiem tra backend dang chay.
app.get('/', (req, res) => {
    res.send("🚀 E-Learning Backend is running. Access <a href='/api-docs'>/api-docs</a> for documentation!");
});

// bat loi tap trung va tra ve json cho client.
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        msg: err.message || "Internal server error",
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// ket noi mongodb roi khoi dong server.
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URL;

mongoose.set('strictQuery', false);
mongoose.connect(URI)
    .then(() => {
        console.log("✅ Successfully connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📖 Swagger UI: http://localhost:5000/api-docs`);
        });
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });