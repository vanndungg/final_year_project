import React, { useState, useEffect, useContext } from 'react';
import { GlobalState } from '../../GlobalState';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';

const AdminUsers = () => {
    const state = useContext(GlobalState);
    const [token] = state.token;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [callback, setCallback] = useState(false);

    // Cấu trúc Role dựa trên Number
    const ROLES = [
        { value: 0, label: "Học viên", color: "bg-gray-100 text-gray-500" },
        { value: 1, label: "Admin", color: "bg-purple-100 text-purple-600 border-purple-200" },
        { value: 2, label: "Biên tập viên", color: "bg-blue-100 text-blue-600" }
    ];

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get('/users/all_info');
                // Backend của bạn trả về mảng users trực tiếp: res.json(users)
                setUsers(res.data);
            } catch (err) {
                toast.error(err.response?.data?.msg || "Lỗi tải dữ liệu");
            }
            setLoading(false);
        };
        if(token) getUsers();
    }, [token, callback]);

    const handleRoleChange = async (userId, newRole) => {
        const roleNum = Number(newRole);
        if (window.confirm(`Xác nhận thay đổi quyền hạn?`)) {
            try {
                await axiosClient.patch(`/users/update_role/${userId}`, { role: roleNum });
                toast.success("Cập nhật thành công!");
                setCallback(!callback);
            } catch (err) {
                toast.error(err.response?.data?.msg || "Lỗi cập nhật");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Quản lý tài khoản</h1>
                <p className="text-gray-500 text-sm mt-1 font-medium">Lựa chọn vai trò phù hợp cho từng thành viên</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Hội viên</th>
                            <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Email</th>
                            <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-center">Vai trò hiện tại</th>
                            <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="p-10 text-center italic text-gray-400">Đang tải...</td></tr>
                        ) : users.map(user => {
                            // Xử lý logic hiển thị Role
                            // Nếu DB cũ vẫn là 'admin'/'user', chúng ta ép kiểu về Number sẽ ra NaN
                            // Do đó ta cần check kỹ:
                            let currentRoleValue = 0;
                            if (user.role === 'admin' || user.role === 1) currentRoleValue = 1;
                            else if (user.role === 'user' || user.role === 0) currentRoleValue = 0;
                            else currentRoleValue = Number(user.role) || 0;

                            const roleData = ROLES.find(r => r.value === currentRoleValue) || ROLES[0];

                            return (
                                <tr key={user._id} className="border-b border-gray-50 hover:bg-blue-50/20 transition">
                                    <td className="p-5 font-bold text-gray-800">{user.name}</td>
                                    <td className="p-5 text-gray-600">{user.email}</td>
                                    <td className="p-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase ${roleData.color}`}>
                                            {roleData.label}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <select 
                                            value={currentRoleValue}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="bg-gray-50 border border-gray-200 text-[11px] font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        >
                                            {ROLES.map(r => (
                                                <option key={r.value} value={r.value}>Đặt làm: {r.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
