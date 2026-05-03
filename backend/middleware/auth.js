

const jwt = require('jsonwebtoken');
// xac thuc JWT cho request.
const auth = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if(!token) return res.status(400).json({msg: "Invalid authentication."});
        // Nếu chuỗi bắt đầu bằng "Bearer " (không phân biệt hoa thường), lấy phần token thực
        if(/^Bearer\s+/i.test(token)){
            token = token.replace(/^Bearer\s+/i, '').trim();
        }
        // xac minh token bang secret.
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
            return res.status(400).json({msg: "Invalid authentication."});
        }
        req.user = result.user;
        next();
    } catch (err) {
        return res.status(500).json({msg: err.message});
    }
}
module.exports = auth;