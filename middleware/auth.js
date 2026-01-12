const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if(!token) return res.status(400).json({msg: "Xác thực không hợp lệ."});

        // Nếu chuỗi bắt đầu bằng "Bearer " (không phân biệt hoa thường), lấy phần token thực
        if(/^Bearer\s+/i.test(token)){
            token = token.replace(/^Bearer\s+/i, '').trim();
        }

        // Helper để verify bằng secret (callback -> promise)
        const verifyWith = (secret) => new Promise(resolve => {
            jwt.verify(token, secret, (err, user) => resolve({ err, user }));
        });

        // Thử verify bằng ACCESS_TOKEN_SECRET, nếu thất bại thử bằng JWT_SECRET
        let result = await verifyWith(process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'secret123');
        if (result.err && process.env.JWT_SECRET && process.env.JWT_SECRET !== process.env.ACCESS_TOKEN_SECRET) {
            result = await verifyWith(process.env.JWT_SECRET);
        }

        if (result.err) {
            console.error('JWT verification failed:', result.err);
            return res.status(400).json({msg: "Xác thực không hợp lệ."});
        }

        req.user = result.user;
        next();
    } catch (err) {
        return res.status(500).json({msg: err.message});
    }
}

module.exports = auth;