import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalState } from '../../../../app/providers/GlobalState';
import axiosClient from '../../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
import AdminPanelLayout from '../../pages/AdminPanelLayout';

const StudentCoursesPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const state = useContext(GlobalState);
    const [token = ''] = state?.token || [''];
    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStudentCourses = async () => {
            if (!studentId || !token) return;

            setLoading(true);
            try {
                const res = await axiosClient.get(`/users/student-courses/${studentId}`);
                setStudent(res.data.student);
                setCourses(res.data.courses);
            } catch (err) {
                toast.error(err.response?.data?.msg || "Lỗi tải dữ liệu");
                navigate('/admin/users');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentCourses();
    }, [studentId, token, navigate]);

    const getProgressColor = (percent) => {
        if (percent === 100) return 'bg-emerald-500';
        if (percent >= 75) return 'bg-blue-500';
        if (percent >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getProgressLabel = (percent) => {
        if (percent === 100) return 'Hoàn thành';
        return 'Đang học';
    };

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center justify-center size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Xem Khóa Học & Tiến Độ</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Theo dõi khóa học và tiến độ của học viên.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</p>
                    </div>
                ) : student ? (
                    <>
                        {/* Student Info Card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                    <img 
                                        src={student.avatar || 'https://via.placeholder.com/96'} 
                                        alt={student.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Email: {student.email}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ID: {student._id}</p>
                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                                            {courses.length} khóa học
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courses List */}
                        {courses.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-2xl text-slate-400">school</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400">Học viên này chưa đăng ký khóa học nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {courses.map((course) => (
                                    <div 
                                        key={course._id} 
                                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Course Image */}
                                        <div className="relative h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <img 
                                                src={course.image || 'https://via.placeholder.com/400x160'} 
                                                alt={course.title} 
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                                                    course.progressPercent === 100 
                                                        ? 'bg-emerald-500' 
                                                        : 'bg-blue-500'
                                                }`}>
                                                    {getProgressLabel(course.progressPercent)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Course Content */}
                                        <div className="p-4 space-y-4">
                                            {/* Course Info */}
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{course.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{course.category}</p>
                                            </div>

                                            {/* Price & Type */}
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600 dark:text-slate-400">
                                                    {course.pricingType === 'free' ? 'Miễn phí' : `${course.price?.toLocaleString('vi-VN')} VND`}
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tiến độ học tập</span>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{course.progressPercent}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${getProgressColor(course.progressPercent)} transition-all`}
                                                        style={{ width: `${course.progressPercent}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Lessons Stats */}
                                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded">
                                                        <p className="text-slate-500 dark:text-slate-400">Bài học hoàn thành</p>
                                                        <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{course.completedLessons}/{course.totalLessons}</p>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded">
                                                        <p className="text-slate-500 dark:text-slate-400">Tổng bài học</p>
                                                        <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{course.totalLessons}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-slate-500 dark:text-slate-400">Không tìm thấy học viên.</p>
                    </div>
                )}
            </div>
        </AdminPanelLayout>
    );
};

export default StudentCoursesPage;
