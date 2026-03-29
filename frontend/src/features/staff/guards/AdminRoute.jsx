import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { GlobalState } from '../../../app/providers/GlobalState';

const AdminRoute = () => {
    const state = useContext(GlobalState);
    const [isLogged] = state.userAPI.isLogged;
    const [user] = state.userAPI.user;

    // Đợi tải dữ liệu user xong
    if (!user) return <div className="text-center mt-10">Đang kiểm tra quyền truy cập...</div>;

    // Nếu đã đăng nhập VÀ role là admin thì cho phép vào (Outlet)
    // Ngược lại đá về trang Home
    return isLogged && user.role === 1 ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;