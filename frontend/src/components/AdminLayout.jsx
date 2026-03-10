import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    
    // Hàm kiểm tra link đang đứng để đổi màu active
    const isActive = (path) => 
        location.pathname === path 
        ? "bg-blue-600 font-bold shadow-lg text-white" 
        : "text-gray-300 hover:bg-gray-800 hover:text-white";

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* SIDEBAR CỐ ĐỊNH */}
            <div className="w-64 bg-gray-900 text-white p-6 hidden md:flex flex-col shadow-xl fixed h-full">
                <h2 className="text-2xl font-bold mb-2 text-amber-400 flex items-center gap-2">
                    <span className="text-xl">🛡️</span> Admin Panel
                </h2>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-8 border-b border-gray-800 pb-4">Hệ thống quản trị</p>
                
                <nav className="space-y-2 flex-1">
                    <Link to="/" className="flex items-center gap-3 p-3 mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all font-bold shadow-lg group text-white">
                        <span className="group-hover:-translate-x-1 transition-transform">🏠</span> 
                        Về Trang Chủ
                    </Link>

                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-3">Quản lý</div>
                    
                    <Link to="/admin/dashboard" className={`flex items-center gap-3 p-3 rounded-xl transition ${isActive('/admin/dashboard')}`}>
                        <span>📊</span> Thống kê
                    </Link>
                    <Link to="/admin/courses" className={`flex items-center gap-3 p-3 rounded-xl transition ${isActive('/admin/courses')}`}>
                        <span>📚</span> Quản lý Khóa học
                    </Link>
                    <Link to="/admin/users" className={`flex items-center gap-3 p-3 rounded-xl transition ${isActive('/admin/users')}`}>
                        <span>👥</span> Quản lý Tài khoản
                    </Link>
                </nav>

                <div className="pt-6 border-t border-gray-800">
                    <button className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-400 transition text-sm font-medium">
                        <span>🚪</span> Đăng xuất
                    </button>
                </div>
            </div>

            {/* NỘI DUNG THAY ĐỔI THEO TỪNG TRANG */}
            <div className="flex-1 ml-64 p-8">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;