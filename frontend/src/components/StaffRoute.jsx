import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { GlobalState } from '../GlobalState';

const StaffRoute = () => {
    const state = useContext(GlobalState);
    const [isLogged] = state?.userAPI?.isLogged || [false];
    const [user] = state?.userAPI?.user || [null];

    if (!user) {
        return <div className="text-center mt-10">Dang kiem tra quyen truy cap...</div>;
    }

    const role = Number(user?.role);
    const isStaff = role === 1 || role === 2;

    return isLogged && isStaff ? <Outlet /> : <Navigate to="/" />;
};

export default StaffRoute;
