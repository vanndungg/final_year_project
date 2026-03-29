

import React, { useState, useEffect, useContext } from 'react';
import { GlobalState } from '../../../../app/providers/GlobalState';
import axiosClient from '../../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import AdminPanelLayout from '../../pages/AdminPanelLayout';
// hien thi danh sach user va cho phep admin doi role.
const ManageUsers = () => {
    const state = useContext(GlobalState);
    const navigate = useNavigate();
    const [token = ''] = state?.token || [''];
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [callback, setCallback] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const ROLES = [
        { value: 0, label: "Học viên", color: "bg-gray-100 text-gray-500" },
        { value: 1, label: "Admin", color: "bg-purple-100 text-purple-600 border-purple-200" },
        { value: 2, label: "Giáo viên", color: "bg-blue-100 text-blue-600" }
    ];

    useEffect(() => {
        // tai danh sach user de quan ly tren admin panel.
        const getUsers = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get('/users/all_info');
                setUsers(res.data);
            } catch (err) {
                toast.error(err.response?.data?.msg || "Lỗi tải dữ liệu");
            }
            setLoading(false);
        };
        if(token) getUsers();
    }, [token, callback]);
    // cap nhat role cua user duoc chon.
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

    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.role === 0).length;
    const newUsers = users.filter(user => {
        const joinedDate = new Date(user.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return joinedDate > oneMonthAgo;
    }).length;
    const adminUsers = users.filter(user => user.role === 1).length;

    const filteredUsers = users.filter(user => {
        const userName = user?.name?.toLowerCase() || '';
        const userEmail = user?.email?.toLowerCase() || '';
        const normalizedSearch = searchTerm.toLowerCase();
        const matchesSearch = userName.includes(normalizedSearch) || userEmail.includes(normalizedSearch);
        const matchesRole = roleFilter === 'All Roles' || 
                           (roleFilter === 'Student' && user.role === 0) ||
                           (roleFilter === 'Admin' && user.role === 1) ||
                           (roleFilter === 'Teacher' && user.role === 2);
        const matchesStatus = statusFilter === 'All Status' || 
                             (statusFilter === 'Active' && user.role !== undefined) ||
                             (statusFilter === 'Inactive' && false);
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Student Management</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage user accounts and permissions.</p>
                        </div>
                        <Link to="/coming-soon" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                            <span className="material-symbols-outlined text-xl">person_add</span>
                            Add New User
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined">group</span>
                                </div>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Total</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Users</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalUsers}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Active</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Students</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeUsers}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined">person_add</span>
                                </div>
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">New</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">New This Month</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{newUsers}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="size-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined">admin_panel_settings</span>
                                </div>
                                <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">Admins</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Admin Users</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{adminUsers}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[300px] relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input 
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="Search by name or email..." 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 text-slate-600 dark:text-slate-400"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option>All Roles</option>
                            <option>Student</option>
                            <option>Admin</option>
                            <option>Teacher</option>
                        </select>
                        <select 
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 text-slate-600 dark:text-slate-400"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-lg">filter_list</span>
                            More Filters
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-slate-500 dark:text-slate-400">Loading users...</td>
                                        </tr>
                                    ) : filteredUsers.map((user) => {
                                        let currentRoleValue = 0;
                                        if (user.role === 'admin' || user.role === 1) currentRoleValue = 1;
                                        else if (user.role === 'user' || user.role === 0) currentRoleValue = 0;
                                        else currentRoleValue = Number(user.role) || 0;

                                        return (
                                            <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                            <img src={user.avatar || 'https://via.placeholder.com/48'} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="max-w-[200px]">
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                                            <p className="text-xs text-slate-500 truncate">ID: {user._id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <select 
                                                        value={currentRoleValue}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-1 pl-3 pr-8 text-sm focus:ring-2 focus:ring-primary/20 text-slate-600 dark:text-slate-400"
                                                    >
                                                        {ROLES.map(r => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${currentRoleValue === 1 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                        <span className={`size-1.5 rounded-full ${currentRoleValue === 1 ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                                                        {currentRoleValue === 1 ? 'Admin' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-1">
                                                    <button 
                                                        onClick={() => navigate(`/admin/student-courses/${user._id}`)}
                                                        className="p-2 text-slate-400 hover:text-primary transition-colors" 
                                                        title="View"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-primary transition-colors" title="Edit">
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Showing <span className="font-bold text-slate-900 dark:text-white">1</span> to <span className="font-bold text-slate-900 dark:text-white">{filteredUsers.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalUsers}</span> users</p>
                            <div className="flex items-center gap-2">
                                <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-400 disabled:opacity-50 cursor-not-allowed">
                                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                                </button>
                                <button className="size-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-sm font-bold">1</button>
                                <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">2</button>
                                <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">3</button>
                                <button className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
            </div>
        </AdminPanelLayout>
    );
};

export default ManageUsers;