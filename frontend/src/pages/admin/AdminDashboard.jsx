import React, { useContext } from 'react';
import { GlobalState } from '../../GlobalState';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
    const state = useContext(GlobalState);
    const [courses] = state.coursesAPI.courses;

    const stats = [
        { title: "Tổng khóa học", value: courses.length, icon: "📚", color: "from-blue-500 to-blue-600" },
        { title: "Tổng học viên", value: "1,250", icon: "👥", color: "from-emerald-500 to-teal-600" },
        { title: "Doanh thu tháng", value: "45.000.000đ", icon: "💰", color: "from-amber-500 to-orange-600" }
    ];

    return (
        <AdminLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Bảng điều khiển</h1>
                <p className="text-gray-500">Tổng quan dữ liệu hệ thống của bạn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((item, index) => (
                    <div key={index} className={`bg-gradient-to-br ${item.color} p-8 rounded-3xl text-white shadow-xl transform hover:scale-105 transition-all`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white/70 uppercase text-xs font-bold tracking-widest">{item.title}</p>
                                <h2 className="text-4xl font-black mt-2">{item.value}</h2>
                            </div>
                            <span className="text-3xl bg-white/20 p-3 rounded-2xl">{item.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                <p className="text-gray-400 italic">Biểu đồ tăng trưởng sẽ được cập nhật trong phiên bản kế tiếp...</p>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
