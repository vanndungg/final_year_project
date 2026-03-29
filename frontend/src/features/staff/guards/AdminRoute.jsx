

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { GlobalState } from '../../../app/providers/GlobalState';
// chi cho phep admin truy cap vao route ben trong.
const AdminRoute = () => {
    const state = useContext(GlobalState);
    const [isLogged] = state.userAPI.isLogged;
    const [user] = state.userAPI.user;

    if (!user) return <div className="text-center mt-10">Đang kiểm tra quyền truy cập...</div>;

    return isLogged && user.role === 1 ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;