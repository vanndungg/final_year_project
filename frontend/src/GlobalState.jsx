import React, { createContext, useState, useEffect } from 'react';
import axiosClient from './api/axiosClient';

export const GlobalState = createContext();

export const DataProvider = ({ children }) => {
    const [token, setToken] = useState(false);
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState(null);

    // 1. Kiểm tra trạng thái đăng nhập khi load lại trang (F5)
    useEffect(() => {
        const firstLogin = localStorage.getItem('firstLogin');
        if (firstLogin) {
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
                setToken(accessToken);
                setIsLogged(true);
            }
        }
    }, []);

    // 2. Lấy thông tin User khi có Token
    useEffect(() => {
        if (token) {
            const getUserInfo = async () => {
                try {
                    // Gọi API /users/infor (Khớp với app.use('/api/users'...) ở server.js)
                    const res = await axiosClient.get('/users/infor', {
                        headers: { Authorization: `Bearer ${token}` }
                    }); 
                    
                    // Cập nhật thông tin User vào state
                    setUser(res.data);
                    setIsLogged(true);

                    console.log("Dữ liệu User đã tải:", res.data);
                } catch (err) {
                    console.error("Lỗi lấy thông tin user:", err.response?.data?.msg || err.message);
                    
                    // Nếu Token lỗi hoặc hết hạn (Status 400/401)
                    if (err.response?.status === 400 || err.response?.status === 401) {
                        localStorage.removeItem('firstLogin');
                        localStorage.removeItem('access_token');
                        setToken(false);
                        setIsLogged(false);
                        setUser(null);
                    }
                }
            };
            getUserInfo();
        }
    }, [token]); // Chạy lại mỗi khi token thay đổi (Lúc mới đăng nhập xong)

    const state = {
        token: [token, setToken],
        userAPI: {
            isLogged: [isLogged, setIsLogged],
            user: [user, setUser]
        }
    };

    return (
        <GlobalState.Provider value={state}>
            {children}
        </GlobalState.Provider>
    );
};