import React, { createContext, useState, useEffect } from 'react';
import axiosClient from './api/axiosClient';

export const GlobalState = createContext();

export const DataProvider = ({ children }) => {
    const [token, setToken] = useState(false);
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);

    // 1. Kiểm tra đăng nhập (F5)
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
                    const res = await axiosClient.get('/users/infor', {
                        headers: { Authorization: `Bearer ${token}` }
                    }); 
                    setUser(res.data);
                    setIsLogged(true);
                } catch (err) {
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
    }, [token]);

    // 3. Lấy danh sách khóa học từ Backend
    useEffect(() => {
        const getCourses = async () => {
            try {
                const res = await axiosClient.get('/courses');
                // Lưu ý: Backend của bạn trả về { status, result, courses: [...] }
                setCourses(res.data.courses); 
            } catch (err) {
                console.error("Lỗi lấy danh sách khóa học:", err);
            }
        };
        getCourses();
    }, []);

    const state = {
        token: [token, setToken],
        userAPI: {
            isLogged: [isLogged, setIsLogged],
            user: [user, setUser]
        },
        coursesAPI: {
            courses: [courses, setCourses]
        }
    };

    return (
        <GlobalState.Provider value={state}>
            {children}
        </GlobalState.Provider>
    );
};