

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalState } from '../../../../app/providers/GlobalState';
import axiosClient from '../../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import AdminPanelLayout from '../../pages/AdminPanelLayout';
import { showConfirm } from '../../../../shared/utils/confirmUtils';

// hien thi danh sach hoc vien de admin/giao vien quan ly.
const ManageUsers = () => {
    const { t } = useTranslation();
    const state = useContext(GlobalState);
    const navigate = useNavigate();
    const [token = ''] = state?.token || [''];
    const [user] = state?.userAPI?.user || [null];
    const [confirmDialog, setConfirmDialog] = state.confirmDialog;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [callback, setCallback] = useState(false);

    const isAdmin = Number(user?.role) === 1;

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get('/users/all_info');
                setUsers(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                toast.error(err.response?.data?.msg || t('errors.serverError'));
            }
            setLoading(false);
        };

        if (token) getUsers();
    }, [token, callback]);

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

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
            toast.error(t('admin.requiredFields'));
            return;
        }

        if (formData.password.length < 6) {
            toast.error(t('admin.passwordMinLength'));
            return;
        }

        setCreateLoading(true);
        try {
            await axiosClient.post('/users/create_user', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 0 // student role
            });
            toast.success(t('admin.createStudentSuccess'));
            setFormData({ name: '', email: '', password: '' });
            setShowCreateForm(false);
            setCallback((prev) => !prev);
        } catch (err) {
            toast.error(err.response?.data?.msg || t('admin.createError'));
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        const confirmed = await showConfirm(setConfirmDialog, {
            title: t('admin.confirmDelete'),
            message: t('admin.deleteStudentMessage')
        });
        if (!confirmed) return;

        try {
            await axiosClient.delete(`/users/delete_user/${studentId}`);
            toast.success(t('admin.deleteStudentSuccess'));
            setCallback((prev) => !prev);
        } catch (err) {
            toast.error(err.response?.data?.msg || t('admin.deleteError'));
        }
    };

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin.studentManagement')}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('admin.studentManagementDescription')}</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                        >
                            <span className="material-symbols-outlined text-xl">add</span>
                            {t('admin.addAccount')}
                        </button>
                    )}
                </div>

                {/* Form tạo tài khoản học viên */}
                {showCreateForm && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('admin.addStudentAccount')}</h3>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('admin.fullName')}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder={t('admin.enterFullName')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('common.email')}</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder={t('admin.enterEmail')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('admin.password')}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder={t('admin.enterPassword')}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {createLoading ? t('common.loading') : t('admin.create')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('admin.totalStudents')}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{students.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('admin.newThisMonth')}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{newStudents}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('admin.foundBySearch')}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{filteredStudents.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder={t('admin.searchByStudentNameEmail')}
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
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.student')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('header.email')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile.joinDate')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.status')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-500 dark:text-slate-400">{t('admin.loadingStudents')}</td>
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
                                                    <p className="text-xs text-slate-500 truncate">{t('admin.idLabel')}: {student._id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{student.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(student.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                <span className="size-1.5 rounded-full bg-green-500"></span>
                                                {t('admin.active')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => navigate(`/admin/student-courses/${student._id}`)}
                                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                title={t('common.view')}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student._id)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                title={t('common.delete')}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('admin.showingStudents', { shown: filteredStudents.length, total: students.length })}
                        </p>
                    </div>
                </div>
            </div>
        </AdminPanelLayout>
    );
};

export default ManageUsers;