

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { GlobalState } from '../../../../app/providers/GlobalState';
import axiosClient from '../../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import AdminPanelLayout from '../../pages/AdminPanelLayout';

// hien thi danh sach hoc vien de admin/giao vien quan ly.
const ManageUsers = () => {
    const state = useContext(GlobalState);
    const navigate = useNavigate();
    const [token = ''] = state?.token || [''];
    const [user] = state?.userAPI?.user || [null];
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const isAdmin = Number(user?.role) === 1;

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get('/users/all_info');
                setUsers(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Lỗi tải dữ liệu');
            }
            setLoading(false);
        };

        if (token) getUsers();
    }, [token]);

    const students = useMemo(
        () => users.filter((item) => Number(item?.role) === 0),
        [users]
    );

    const filteredStudents = useMemo(() => {
        const normalizedSearch = searchTerm.toLowerCase();

        return students.filter((student) => {
            const studentName = student?.name?.toLowerCase() || '';
            const studentEmail = student?.email?.toLowerCase() || '';
            return studentName.includes(normalizedSearch) || studentEmail.includes(normalizedSearch);
        });
    }, [students, searchTerm]);

    const newStudents = students.filter((student) => {
        const joinedDate = new Date(student.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return joinedDate > oneMonthAgo;
    }).length;

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Student Management</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Theo doi hoc vien va tien do hoc tap theo tung khoa hoc.</p>
                    </div>
                    {isAdmin && (
                        <Link to="/admin/staff-accounts" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                            <span className="material-symbols-outlined text-xl">badge</span>
                            Staff Accounts
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Students</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{students.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">New This Month</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{newStudents}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Found By Search</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{filteredStudents.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Search by student name or email..."
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-500 dark:text-slate-400">Loading students...</td>
                                    </tr>
                                ) : filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                    <img src={student.avatar || 'https://via.placeholder.com/48'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="max-w-[220px]">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{student.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">ID: {student._id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{student.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(student.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                <span className="size-1.5 rounded-full bg-green-500"></span>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/admin/student-courses/${student._id}`)}
                                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                title="View"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredStudents.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{students.length}</span> students
                        </p>
                    </div>
                </div>
            </div>
        </AdminPanelLayout>
    );
};

export default ManageUsers;