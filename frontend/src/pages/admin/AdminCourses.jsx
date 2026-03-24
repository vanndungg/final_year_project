import React, { useContext, useMemo, useState } from 'react';
import { GlobalState } from '../../GlobalState';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import AdminPanelLayout from '../../components/AdminPanelLayout';

const AdminCourses = () => {
    const state = useContext(GlobalState);
    const [courses = []] = state?.coursesAPI?.courses || [[]];
    const [token = ''] = state?.token || [''];
    const [callback = false, setCallback] = state?.coursesAPI?.callback || [false, () => {}];

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const safeCourses = useMemo(() => (Array.isArray(courses) ? courses : []), [courses]);

    const getStudentCount = (course) => {
        const numericCandidates = [
            course?.studentCount,
            course?.studentsEnrolled,
            course?.totalStudents,
            course?.enrolledCount,
            course?.enrolled
        ];

        for (const value of numericCandidates) {
            if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
                return Number(value);
            }
        }

        if (Array.isArray(course?.enrolledStudents)) return course.enrolledStudents.length;
        if (Array.isArray(course?.students)) return course.students.length;
        return 0;
    };

    const getLessonCount = (course) => {
        const numericCandidates = [course?.lessonCount, course?.lessonsCount, course?.totalLessons];

        for (const value of numericCandidates) {
            if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
                return Number(value);
            }
        }

        if (Array.isArray(course?.lessons)) return course.lessons.length;
        return 0;
    };

    const normalizeCourseStatus = (statusValue) => {
        const normalizedStatus = String(statusValue || '').trim().toLowerCase();

        if (normalizedStatus === 'draft') return 'draft';
        if (normalizedStatus === 'published') return 'publish';
        if (normalizedStatus === 'publish') return 'publish';
        return 'publish';
    };

    const categories = useMemo(() => {
        const values = new Set();
        safeCourses.forEach((course) => {
            if (course?.category) values.add(course.category);
        });

        return ['All Categories', ...Array.from(values)];
    }, [safeCourses]);

    const filteredCourses = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return safeCourses.filter((course) => {
            const title = course?.title?.toLowerCase() || '';
            const category = course?.category || 'General';
            const normalizedCategory = category.toLowerCase();
            const status = normalizeCourseStatus(course?.status);

            const matchesSearch = !normalizedSearch ||
                title.includes(normalizedSearch) ||
                normalizedCategory.includes(normalizedSearch);
            const matchesCategory = categoryFilter === 'All Categories' || category === categoryFilter;
            const matchesStatus = statusFilter === 'All Status' || status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [safeCourses, searchTerm, categoryFilter, statusFilter]);

    const totalCourses = safeCourses.length;
    const hasStatusData = safeCourses.some((course) => typeof course?.status === 'string' && course.status.trim() !== '');
    const activeCourses = hasStatusData
        ? safeCourses.filter((course) => normalizeCourseStatus(course?.status) !== 'draft').length
        : totalCourses;
    const totalLessons = safeCourses.reduce((sum, course) => sum + getLessonCount(course), 0);
    const totalStudents = safeCourses.reduce((sum, course) => sum + getStudentCount(course), 0);

    const deleteCourse = async (id) => {
        if (!token) {
            toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
            return;
        }

        if (window.confirm('Ban co chac chan muon xoa khoa hoc nay khong?')) {
            try {
                const res = await axiosClient.delete(`/courses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(res.data.msg || 'Xoa thanh cong!');
                setCallback(!callback);
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Loi khi xoa');
            }
        }
    };

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Course Management</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your curriculum and track course performance.</p>
                        </div>
                        <Link to="/admin/edit_course" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                            <span className="material-symbols-outlined text-xl">add</span>
                            Add New Course
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Courses</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCourses}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Courses</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeCourses}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Lessons</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalLessons.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Students</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalStudents.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[260px] relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Search by course name..."
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>
                        <select
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 text-slate-600 dark:text-slate-400"
                            value={categoryFilter}
                            onChange={(event) => setCategoryFilter(event.target.value)}
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <select
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 text-slate-600 dark:text-slate-400"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            <option value="All Status">All Status</option>
                            <option value="publish">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                        <Link to="/coming-soon" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-lg">filter_list</span>
                            More Filters
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Students</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lessons</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredCourses.length > 0 ? (
                                        filteredCourses.map((course) => {
                                            const status = normalizeCourseStatus(course?.status);
                                            const isDraft = status === 'draft';
                                            const studentCount = getStudentCount(course);
                                            const lessonCount = getLessonCount(course);

                                            return (
                                                <tr key={course._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                                <img src={course.image?.url || course.image} alt={course.title || 'course'} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="max-w-[220px]">
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{course.title}</p>
                                                                <p className="text-xs text-slate-500 truncate">{course.description || 'Course description'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{course.category || 'General'}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{studentCount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{lessonCount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${isDraft ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                            <span className={`size-1.5 rounded-full ${isDraft ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                                            {isDraft ? 'Draft' : 'Published'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-1">
                                                        <Link to={`/detail/${course._id}`} className="p-2 text-slate-400 hover:text-primary transition-colors" title="View">
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </Link>
                                                        <Link to={`/admin/edit_course/${course._id}`} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Edit">
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </Link>
                                                        <Link to={`/admin/lessons/${course._id}`} className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Lessons">
                                                            <span className="material-symbols-outlined text-[20px]">book_5</span>
                                                        </Link>
                                                        <button onClick={() => deleteCourse(course._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-20 text-center text-slate-500 dark:text-slate-400">No courses found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Showing <span className="font-bold text-slate-900 dark:text-white">{filteredCourses.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalCourses}</span> courses
                            </p>
                        </div>
                    </div>
            </div>
        </AdminPanelLayout>
    );
};

export default AdminCourses;
