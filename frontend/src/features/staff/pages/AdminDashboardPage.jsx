

import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalState } from '../../../app/providers/GlobalState';
import axiosClient from '../../../shared/api/axiosClient';
import { Link } from 'react-router-dom';
import AdminPanelLayout from './AdminPanelLayout';
import { getStudentCount } from '../../../shared/utils/courseDataUtils';
// dinh dang doanh thu de hien thi tren dashboard.
const formatRevenue = (value) => `${Number(value || 0).toLocaleString()}đ`;
// hien thi tong quan so lieu cua khu vuc admin.
const AdminDashboard = () => {
    const { t } = useTranslation();
    const state = useContext(GlobalState);
    const [courses = []] = state?.coursesAPI?.courses || [[]];
    const [token = ''] = state?.token || [''];
    const [user] = state?.userAPI?.user || [null];
    
    const [dataStats, setDataStats] = useState({
        students: 0, 
        revenue: 0 
    });
    const [loading, setLoading] = useState(true);
    const [lessonCountByCourse, setLessonCountByCourse] = useState({});
    const [courseMetrics, setCourseMetrics] = useState({
        studentsByCourse: {},
        revenueByCourse: {}
    });

    useEffect(() => {
        let isMounted = true;
        // tai so lesson cua cac khoa hoc gan day.
        const getRecentCourseLessons = async () => {
            if (!Array.isArray(courses) || courses.length === 0) {
                if (isMounted) setLessonCountByCourse({});
                return;
            }

            const recentCourseIds = courses.slice(0, 6).map((course) => course._id);
            const lessonCountEntries = await Promise.all(
                recentCourseIds.map(async (courseId) => {
                    try {
                        const res = await axiosClient.get(`/lessons/${courseId}`);
                        const count = Array.isArray(res.data) ? res.data.length : 0;
                        return [courseId, count];
                    } catch (err) {
                        console.error('Loi lay danh sach bai hoc:', err);
                        return [courseId, 0];
                    }
                })
            );

            if (isMounted) {
                setLessonCountByCourse(Object.fromEntries(lessonCountEntries));
            }
        };

        getRecentCourseLessons();

        return () => {
            isMounted = false;
        };
    }, [courses]);

    useEffect(() => {
        // tai thong ke tong hoc vien va doanh thu.
        const getStats = async () => {
            try {
                const res = await axiosClient.get('/users/admin_stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDataStats(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi lấy thống kê:", err);
                setLoading(false);
            }
        };

        if (token) getStats();
    }, [token]);

    useEffect(() => {
        // tai thong ke hoc vien va doanh thu theo tung khoa hoc.
        const getCourseMetrics = async () => {
            if (!token) return;

            try {
                const res = await axiosClient.get('/users/course_performance', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setCourseMetrics({
                    studentsByCourse: res.data?.studentsByCourse || {},
                    revenueByCourse: res.data?.revenueByCourse || {}
                });
            } catch (err) {
                console.error('Loi lay thong ke khoa hoc:', err);
            }
        };

        getCourseMetrics();
    }, [token, courses]);

    const averageRating = courses.length > 0
        ? (courses.reduce((sum, course) => sum + Number(course.avgRating || 0), 0) / courses.length).toFixed(1)
        : '0.0';

    const recentCourses = courses.slice(0, 6);
    // lay so hoc vien thuc te cua khoa hoc tu metrics hoac fallback.
    const getActualStudentCount = (course) => {
        const courseId = String(course?._id || '');
        const studentsFromMetrics = courseMetrics.studentsByCourse?.[courseId];
        if (studentsFromMetrics !== undefined && studentsFromMetrics !== null) {
            return Number(studentsFromMetrics) || 0;
        }

        return getStudentCount(course);
    };
    // lay doanh thu cua khoa hoc tu du lieu thong ke.
    const getCourseRevenue = (course) => {
        const courseId = String(course?._id || '');
        const revenueFromMetrics = courseMetrics.revenueByCourse?.[courseId];
        return Number(revenueFromMetrics || 0);
    };

    const accountName = user?.name || 'Admin';

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.dashboardOverview')}</h2>
                    <p className="text-slate-500">{t('admin.welcomeBack', { name: accountName })}</p>
                </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">library_books</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">{t('admin.totalCourses')}</p>
                            <h3 className="text-2xl font-bold mt-1">{courses.length}</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg text-amber-600">
                                    <span className="material-symbols-outlined">star</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">+0.2%</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">{t('admin.averageRating')}</p>
                            <h3 className="text-2xl font-bold mt-1">{averageRating}/5</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2 rounded-lg text-indigo-600">
                                    <span className="material-symbols-outlined">group</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">+18%</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">{t('admin.totalStudents')}</p>
                            <h3 className="text-2xl font-bold mt-1">{loading ? "..." : dataStats.students.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-lg text-emerald-600">
                                    <span className="material-symbols-outlined">attach_money</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">+24%</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">{t('admin.totalRevenue')}</p>
                            <h3 className="text-2xl font-bold mt-1">{loading ? '...' : `${Number(dataStats.revenue || 0).toLocaleString()}đ`}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h4 className="text-lg font-bold">{t('admin.recentCoursePerformance')}</h4>
                            <Link to="/admin/courses" className="text-primary text-sm font-semibold hover:underline">{t('admin.viewAllCourses')}</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.courseName')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.category')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.studentsEnrolled')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.revenue')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.rating')}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.lesson')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {recentCourses.length > 0 ? recentCourses.map((course) => (
                                        <tr key={course._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-primary font-bold">
                                                        {course.title.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <Link to={`/admin/edit_course/${course._id}`} className="font-medium hover:text-primary transition-colors">{course.title}</Link>
                                                        <p className="text-xs text-slate-500">{course.teacher || 'Giảng viên chưa cập nhật'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{course.category || t('admin.categoryDefault')}</td>
                                            <td className="px-6 py-4 font-semibold">{getActualStudentCount(course).toLocaleString()}</td>
                                            <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">{formatRevenue(getCourseRevenue(course))}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <span className="material-symbols-outlined text-[18px] fill-amber-500">star</span>
                                                    <span className="font-bold">{Number(course.avgRating || 0).toFixed(1)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold">
                                                    <span className="material-symbols-outlined text-[14px]">play_lesson</span>
                                                    {lessonCountByCourse[course._id] ?? 0}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                                Chưa có dữ liệu khóa học.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
            </div>
        </AdminPanelLayout>
    );
};

export default AdminDashboard;