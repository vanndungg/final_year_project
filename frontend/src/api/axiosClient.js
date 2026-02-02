import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Đảm bảo trùng cổng với Backend
    headers: {
        'Content-Type': 'application/json'
    }
});

// Tự động đính kèm Token vào Header mỗi khi gọi API
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;