/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../../shared/api/axiosClient';

/*
    ==================== BƯỚC 2: GLOBAL STATE ====================
    File này là nơi giữ trạng thái dùng chung của frontend.

    Cách hiểu đơn giản cho người mới:
    - token: chìa khóa đăng nhập do backend cấp
    - user: thông tin người dùng hiện tại
    - isLogged: đã đăng nhập hay chưa
    - isAdmin: cờ kiểm tra nhanh giao diện admin
    - courses: danh sách khóa học dùng chung nhiều nơi

    Luồng dữ liệu chính:
    1) Đọc token từ localStorage
    2) Nếu có token -> gọi /users/infor -> lấy user + role
    3) Gọi /courses -> lấy danh sách khóa học chung
    4) Đưa tất cả ra ngoài bằng React Context (GlobalState)
    ============================================================
*/

export const GlobalState = createContext();

export const DataProvider = ({ children }) => {
    // 1) Khởi tạo token một lần khi app bắt đầu chạy.
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

    // 2) Nếu có token thì lấy thông tin user hiện tại.
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

    // 3) Tải danh sách khóa học dùng chung toàn app.
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

    // 4) Xuất state dùng chung cho toàn bộ page/component.
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