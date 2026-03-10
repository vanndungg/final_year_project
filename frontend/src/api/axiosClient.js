import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Cổng 5000 của Backend
    headers: {
        'Content-Type': 'application/json'
    },
    // Chờ tối đa 10 giây, nếu lâu hơn sẽ báo lỗi Timeout
    timeout: 10000 
});

// 1. INTERCEPTOR CHO REQUEST: Gửi Token đi
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. INTERCEPTOR CHO RESPONSE: Nhận phản hồi và xử lý lỗi tập trung
axiosClient.interceptors.response.use(
    (response) => {
        // Nếu API thành công, trả về dữ liệu ngay
        return response;
    },
    (error) => {
        // Kiểm tra nếu Server có phản hồi lỗi (ví dụ 400, 401, 404, 500)
        if (error.response) {
            const { status, data } = error.response;

            // Xử lý lỗi Token hết hạn hoặc không hợp lệ (401 hoặc 403)
            if (status === 401 || status === 403) {
                console.error("Token không hợp lệ hoặc hết hạn. Đang đăng xuất...");
                localStorage.removeItem('firstLogin');
                localStorage.removeItem('access_token');
                
                // Tùy chọn: Chuyển hướng về trang login nếu cần
                // window.location.href = '/login'; 
            }

            // In lỗi chi tiết từ Backend ra Console để bạn dễ debug
            console.error(`[API Error ${status}]:`, data.msg || data);
        } else if (error.request) {
            // Lỗi do không kết nối được tới Server (Server chưa bật)
            console.error("[Network Error]: Không thể kết nối tới Server. Hãy kiểm tra Backend!");
        } else {
            console.error("[Error]:", error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;