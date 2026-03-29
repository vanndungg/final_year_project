

import axios from 'axios';
// tao axios client dung chung cho toan bo frontend.

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 
});

// gan token vao moi request neu localStorage dang co access token.
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

// xu ly loi api tap trung va reset phien dang nhap neu token het han.
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            if (status === 401 || status === 403) {
                console.error("Token không hợp lệ hoặc hết hạn. Đang đăng xuất...");
                localStorage.removeItem('firstLogin');
                localStorage.removeItem('access_token');
            }

            console.error(`[API Error ${status}]:`, data.msg || data);
        } else if (error.request) {
            console.error("[Network Error]: Không thể kết nối tới Server. Hãy kiểm tra Backend!");
        } else {
            console.error("[Error]:", error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;