import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../../shared/api/axiosClient';
// quan ly state dung chung cho toan bo frontend.

export const GlobalState = createContext();
// cung cap token, user va du lieu khoa hoc cho cac component con.
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
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [callback, setCallback] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: 'Xác nhận',
        message: '',
        onConfirm: () => {},
        onCancel: () => {}
    });
    useEffect(() => {
        if (token) {
            // lay thong tin user dang dang nhap tu backend.
            const getUserInfo = async () => {
                try {
                    const res = await axiosClient.get('/users/infor', {
                        headers: { Authorization: `Bearer ${token}` }
                    }); 
                    
                    setUser(res.data);
                    setIsLogged(true);

                    // cap nhat quyen admin dua tren role.
                    if (Number(res.data.role) === 1) {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }

                } catch (err) {
                    // reset trang thai dang nhap khi token khong hop le.
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
    useEffect(() => {
        // lay danh sach khoa hoc de dung chung trong giao dien.
        const getCourses = async () => {
            try {
                const res = await axiosClient.get('/courses');
                setCourses(res.data.courses || []); 
            } catch (err) {
                console.error("Lỗi lấy danh sách khóa học:", err);
            }
        };
        getCourses();
    }, [callback]); 
    const state = {
        token: [token, setToken],
        userAPI: {
            isLogged: [isLogged, setIsLogged],
            isAdmin: [isAdmin, setIsAdmin],
            user: [user, setUser]
        },
        coursesAPI: {
            courses: [courses, setCourses],
            callback: [callback, setCallback]
        },
        confirmDialog: [confirmDialog, setConfirmDialog]
    };

    return (
        <GlobalState.Provider value={state}>
            {children}
        </GlobalState.Provider>
    );
};