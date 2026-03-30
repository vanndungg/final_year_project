import React, { useState, useEffect, useContext, useMemo } from 'react';
import { GlobalState } from '../../../../app/providers/GlobalState';
import axiosClient from '../../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
import AdminPanelLayout from '../../pages/AdminPanelLayout';
import { showConfirm } from '../../../../shared/utils/confirmUtils';

const STAFF_ROLE_OPTIONS = [
    { value: 1, label: 'Admin' },
    { value: 2, label: 'Giáo viên' }
];

// trang quan ly tai khoan can bo (chi admin).
const ManageStaffAccountsPage = () => {
    const state = useContext(GlobalState);
    const [token = ''] = state?.token || [''];
    const [confirmDialog, setConfirmDialog] = state.confirmDialog;
    const [staffAccounts, setStaffAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [callback, setCallback] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');

    useEffect(() => {
        const getStaffAccounts = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get('/users/all_info');
                const users = Array.isArray(res.data) ? res.data : [];
                const staffs = users.filter((item) => {
                    const role = Number(item?.role);
                    return role === 1 || role === 2;
                });

                setStaffAccounts(staffs);
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Lỗi tải dữ liệu');
            }
            setLoading(false);
        };

        if (token) getStaffAccounts();
    }, [token, callback]);

    const handleRoleChange = async (userId, newRole) => {
        const roleNum = Number(newRole);
        const confirmed = await showConfirm(setConfirmDialog, {
            title: 'Xác nhận thay đổi vai trò',
            message: 'Bạn có chắc chắn muốn cập nhật vai trò tài khoản cán bộ không?'
        });
        if (!confirmed) return;
        try {
            await axiosClient.patch(`/users/update_role/${userId}`, { role: roleNum });
            toast.success('Cập nhật thành công!');
            setCallback((prev) => !prev);
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Lỗi cập nhật');
        }
    };

    const filteredStaffAccounts = useMemo(() => {
        const normalizedSearch = searchTerm.toLowerCase();

        return staffAccounts.filter((item) => {
            const name = item?.name?.toLowerCase() || '';
            const email = item?.email?.toLowerCase() || '';
            const role = Number(item?.role);
            const roleName = role === 1 ? 'Admin' : 'Teacher';

            const matchesSearch =
                name.includes(normalizedSearch) ||
                email.includes(normalizedSearch) ||
                roleName.toLowerCase().includes(normalizedSearch);

            const matchesRole =
                roleFilter === 'All Roles' ||
                (roleFilter === 'Admin' && role === 1) ||
                (roleFilter === 'Teacher' && role === 2);

            return matchesSearch && matchesRole;
        });
    }, [staffAccounts, searchTerm, roleFilter]);

    const totalStaff = staffAccounts.length;
    const adminCount = staffAccounts.filter((item) => Number(item?.role) === 1).length;
    const teacherCount = staffAccounts.filter((item) => Number(item?.role) === 2).length;

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff Accounts</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Quan ly tai khoan can bo va phan quyen Admin/Giao vien.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Staff</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalStaff}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Admins</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{adminCount}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Teachers</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{teacherCount}</p>
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
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>
                    <select
                        className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 text-slate-600 dark:text-slate-400"
                        value={roleFilter}
                        onChange={(event) => setRoleFilter(event.target.value)}
                    >
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Teacher</option>
                    </select>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Account</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-slate-500 dark:text-slate-400">Loading staff accounts...</td>
                                    </tr>
                                ) : filteredStaffAccounts.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                    <img src={item.avatar || 'https://via.placeholder.com/48'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="max-w-[220px]">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">ID: {item._id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.email}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={Number(item?.role) === 1 ? 1 : 2}
                                                onChange={(event) => handleRoleChange(item._id, event.target.value)}
                                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-1 pl-3 pr-8 text-sm focus:ring-2 focus:ring-primary/20 text-slate-600 dark:text-slate-400"
                                            >
                                                {STAFF_ROLE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredStaffAccounts.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalStaff}</span> staff accounts
                        </p>
                    </div>
                </div>
            </div>
        </AdminPanelLayout>
    );
};

export default ManageStaffAccountsPage;
