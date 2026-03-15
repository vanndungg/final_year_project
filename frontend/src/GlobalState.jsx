/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import axiosClient from './api/axiosClient';

export const GlobalState = createContext();

export const DataProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        if (typeof window === 'undefined') return false;
        const firstLogin = localStorage.getItem('firstLogin');
        if (firstLogin) {
            return localStorage.getItem('access_token') || false;
        }
        return false;
    });
    const [isLogged, setIsLogged] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // 🆕 Thêm state kiểm tra Admin
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [callback, setCallback] = useState(false);

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

                    // 🆕 Kiểm tra Role bằng số: 1 là Admin
                    if (Number(res.data.role) === 1) {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }

                } catch (err) {
                    // Nếu token hết hạn hoặc lỗi xác thực
                    console.error("Lỗi lấy thông tin user:", err);
                    localStorage.removeItem('firstLogin');
                    localStorage.removeItem('access_token');
                    setToken(false);
                    setIsLogged(false);
                    setIsAdmin(false);
                    setUser(null);
                }
            };
            getUserInfo();
        }
    }, [token]);

    // 3. Lấy danh sách khóa học
    useEffect(() => {
        const getCourses = async () => {
            try {
                const res = await axiosClient.get('/courses');
                // Backend trả về { courses: [...] }
                setCourses(res.data.courses || []); 
            } catch (err) {
                console.error("Lỗi lấy danh sách khóa học:", err);
            }
        };
        getCourses();
    }, [callback]); 

    // Gom tất cả state vào một object để truyền xuống các con
    const state = {
        token: [token, setToken],
        userAPI: {
            isLogged: [isLogged, setIsLogged],
            isAdmin: [isAdmin, setIsAdmin], // 🆕 Xuất isAdmin ra ngoài
            user: [user, setUser]
        },
        coursesAPI: {
            courses: [courses, setCourses],
            callback: [callback, setCallback]
        }
    };

    return (
        <GlobalState.Provider value={state}>
            {children}
        </GlobalState.Provider>
    );
};