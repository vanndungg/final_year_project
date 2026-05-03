

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlobalState } from '../../../../../app/providers/GlobalState';
import axiosClient from '../../../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
import AdminPanelLayout from '../../../pages/AdminPanelLayout';
import { getLessonTypeMeta, normalizePublishStatus } from './lessonAdminUtils';
import { showConfirm } from '../../../../../shared/utils/confirmUtils';

// hien thi danh sach lesson de admin/staff quan ly.
const ManageLessons = () => {
    const params = useParams();
    const state = useContext(GlobalState);
    const [token = ''] = state?.token || [''];
    const [user] = state?.userAPI?.user || [null];
    const [confirmDialog, setConfirmDialog] = state.confirmDialog;
    const isAdmin = Number(user?.role) === 1;
    
    const [lessons, setLessons] = useState([]);
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(false);
    const [callback, setCallback] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [statusFilter, setStatusFilter] = useState('All Status');

    useEffect(() => {
        const getLessonsData = async () => {
            setLoading(true);
            try {
                const resCourse = await axiosClient.get(`/courses/${params.courseId}`);
                setCourseName(resCourse.data.title || "Khoá học");

                const resLessons = await axiosClient.get(`/lessons/${params.courseId}`);
                const finalData = resLessons.data.lessons || resLessons.data;
                
                if (Array.isArray(finalData)) {
                    setLessons(finalData);
                } else {
                    setLessons([]);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.msg || "Error connecting to the lesson API";
                toast.error(`Error: ${errorMsg}`);
            }
            setLoading(false);
        };

        if (params.courseId) {
            getLessonsData();
        }
    }, [params.courseId, callback]);

    const deleteLesson = async (id) => {
        const confirmed = await showConfirm(setConfirmDialog, {
            title: 'Delete Lesson',
            message: 'Are you sure you want to delete this lesson?'
        });
        if (!confirmed) return;

        try {
            await axiosClient.delete(`/lessons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Lesson deleted successfully!");
            setCallback(!callback);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to delete the lesson");
        }
    };

    // Tính toán thống kê
    const lessonTypes = ['video', 'document', 'quiz', 'assignment'];
    const totalLessons = lessons.length;
    const publishedCount = lessons.filter(l => normalizePublishStatus(l.publishStatus) === 'publish').length;
    const draftCount = lessons.filter(l => normalizePublishStatus(l.publishStatus) === 'draft').length;
    
    // Filter lessons
    const filteredLessons = useMemo(() => {
        return lessons.filter(lesson => {
            const matchesSearch = lesson.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'All Types' || lesson.lessonType === typeFilter;
            const matchesStatus = statusFilter === 'All Status' || normalizePublishStatus(lesson.publishStatus) === statusFilter.toLowerCase();
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [lessons, searchTerm, typeFilter, statusFilter]);

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Manage Lessons</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Course: <span className="text-blue-600 font-semibold">{courseName || "Loading..."}</span></p>
                    </div>
                    <Link to={`/admin/create_lesson/${params.courseId}`} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                        <span className="material-symbols-outlined text-xl">add</span>
                        Add Lesson
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Lessons</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalLessons}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Published</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{publishedCount}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Drafts</p>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{draftCount}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[260px] relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="Search lessons..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 text-slate-600 dark:text-slate-400"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="All Types">All Types</option>
                        {lessonTypes.map(type => (
                            <option key={type} value={type}>{getLessonTypeMeta(type).label}</option>
                        ))}
                    </select>
                    <select
                        className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 text-slate-600 dark:text-slate-400"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All Status">All Status</option>
                        <option value="publish">Published</option>
                        <option value="draft">Drafts</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-slate-500 font-medium">Searching lessons...</p>
                            </div>
                        ) : filteredLessons.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredLessons.map((lesson, index) => {
                                        const status = normalizePublishStatus(lesson.publishStatus);
                                        return (
                                            <tr key={lesson._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-500">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{lesson.title}</p>
                                                        <p className="text-xs text-slate-500 truncate">{lesson.description || 'No description available'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        <span className="material-symbols-outlined text-sm">{getLessonTypeMeta(lesson.lessonType).icon}</span>
                                                        {getLessonTypeMeta(lesson.lessonType).label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${status === 'publish' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                        <span className={`size-1.5 rounded-full ${status === 'publish' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        {status === 'publish' ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-1">
                                                    <Link to={`/admin/edit_lesson/${lesson._id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit">
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </Link>
                                                    {isAdmin && (
                                                        <button onClick={() => deleteLesson(lesson._id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                                                            <span className="material-symbols-outlined text-base">delete</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20">
                                <div className="text-5xl mb-4 text-slate-200">📽️</div>
                                <p className="text-slate-400 font-medium">No lessons found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminPanelLayout>
    );
};

export default ManageLessons;