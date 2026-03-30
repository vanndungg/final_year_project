

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlobalState } from '../../../../../app/providers/GlobalState';
import axiosClient from '../../../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
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

    useEffect(() => {
        // tai ten khoa hoc va danh sach lesson theo course id.
        const getLessonsData = async () => {
            setLoading(true);
            try {
                const resCourse = await axiosClient.get(`/courses/${params.courseId}`);
                setCourseName(resCourse.data.title || "Khóa học");

                const resLessons = await axiosClient.get(`/lessons/${params.courseId}`);
                console.log("Dữ liệu nhận được từ Backend:", resLessons.data);

                const finalData = resLessons.data.lessons || resLessons.data;
                
                if (Array.isArray(finalData)) {
                    setLessons(finalData);
                } else {
                    setLessons([]);
                    console.warn("Backend trả về dữ liệu không phải là danh sách (Array)");
                }

            } catch (err) {
                const errorMsg = err.response?.data?.msg || "Lỗi kết nối API bài học";
                toast.error(`Lỗi: ${errorMsg}`);
                console.error("Chi tiết lỗi API:", err.response);
            }
            setLoading(false);
        };

        if (params.courseId) {
            getLessonsData();
        }
    }, [params.courseId, callback]);

    // xoa lesson va tai lai danh sach sau khi thanh cong.
    const deleteLesson = async (id) => {
        const confirmed = await showConfirm(setConfirmDialog, {
            title: 'Xóa bài học',
            message: 'Bạn có chắc chắn muốn xóa bài học này không?'
        });
        if (!confirmed) return;

        try {
            await axiosClient.delete(`/lessons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Đã xóa bài học thành công!");
            setCallback(!callback); // Refresh lại danh sách
        } catch (err) {
            toast.error(err.response?.data?.msg || "Không thể xóa bài học");
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Thanh điều hướng và tiêu đề */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            to="/admin/courses" 
                            className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:bg-gray-100 transition duration-200"
                            title="Quay lại danh sách khóa học"
                        >
                             ⬅️
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Quản lý bài học</h1>
                            <p className="text-blue-600 font-semibold italic">
                                Khóa học: {courseName || "Đang tải..."}
                            </p>
                        </div>
                    </div>
                    <Link 
                        to={`/admin/create_lesson/${params.courseId}`}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                    >
                        <span>+</span> Thêm bài học mới
                    </Link>
                </div>

                {/* Khu vực hiển thị danh sách */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Đang tải danh sách bài học...</p>
                        </div>
                    ) : lessons.length > 0 ? (
                        lessons.map((lesson, index) => (
                            <div 
                                key={lesson._id} 
                                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center gap-5 w-full">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {index + 1}
                                    </div>
                                    <div className="truncate pr-4">
                                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                                            {lesson.title}
                                        </h3>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            <span className={`material-symbols-outlined text-[16px] ${getLessonTypeMeta(lesson.lessonType).color}`}>
                                                {getLessonTypeMeta(lesson.lessonType).icon}
                                            </span>
                                            <span className="font-semibold">{getLessonTypeMeta(lesson.lessonType).label}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${normalizePublishStatus(lesson.publishStatus) === 'publish' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {normalizePublishStatus(lesson.publishStatus) === 'publish' ? 'Published' : 'Draft'}
                                            </span>
                                            {lesson.isPreview && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Preview</span>
                                            )}
                                            {lesson.lessonType === 'video' && lesson.video_id && (
                                                <span className="font-mono text-gray-400">ID: {lesson.video_id}</span>
                                            )}
                                            {lesson.lessonType === 'quiz' && (
                                                <span className="text-gray-400">{Number(lesson.quizQuestionCount || 0)} câu hỏi</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                                    <Link 
                                        to={`/admin/edit_lesson/${lesson._id}`}
                                        className="flex-1 md:flex-none text-center bg-gray-50 text-blue-600 px-5 py-2 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        Sửa
                                    </Link>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => deleteLesson(lesson._id)}
                                            className="flex-1 md:flex-none text-center bg-gray-50 text-red-500 px-5 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-20 text-center rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="text-5xl mb-4 text-gray-200">📽️</div>
                            <p className="text-gray-400 font-medium">Khóa học này chưa có bài học nào.</p>
                            <p className="text-gray-400 text-sm">Hãy nhấn nút "Thêm bài học mới" ở góc trên để bắt đầu nội dung.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageLessons;