import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalState } from '../../GlobalState';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const CreateLesson = () => {
    const { courseId, lessonId } = useParams(); // lessonId dùng cho trường hợp Sửa
    const navigate = useNavigate();
    const state = useContext(GlobalState);
    const [token = ''] = state?.token || [''];

    const [lesson, setLesson] = useState({
        title: '',
        description: '', // Thêm description để khớp với Controller
        video_id: '',
        courseId: courseId || '' // Đổi thành courseId cho đồng nhất với Backend
    });

    const onEdit = Boolean(lessonId);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (onEdit) {
            const getLessonDetails = async () => {
                try {
                    // Gọi đúng route detail để lấy 1 bài học duy nhất
                    const res = await axiosClient.get(`/lessons/detail/${lessonId}`);
                    setLesson({
                        title: res.data.title,
                        description: res.data.description || '',
                        video_id: res.data.video_id,
                        courseId: res.data.courseId
                    });
                } catch {
                    toast.error("Không thể tải thông tin bài học!");
                }
            };
            getLessonDetails();
        }
    }, [lessonId, onEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
            return;
        }
        setLoading(true);
        try {
            if (onEdit) {
                // Gửi yêu cầu PUT để cập nhật
                await axiosClient.put(`/lessons/${lessonId}`, { ...lesson }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("✅ Cập nhật bài học thành công!");
            } else {
                // Gửi yêu cầu POST để thêm mới
                await axiosClient.post('/lessons', { ...lesson }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("🚀 Thêm bài học mới thành công!");
            }
            navigate(-1); // Quay lại trang quản lý bài học
        } catch (err) {
            toast.error(err.response?.data?.msg || "Đã xảy ra lỗi");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-3xl mt-20 border border-gray-100">
            <h2 className="text-3xl font-black mb-8 text-center text-gray-800 italic uppercase tracking-tighter">
                {onEdit ? "📝 Chỉnh sửa bài học" : "✨ Thêm bài học mới"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-bold text-gray-700 mb-2">Tên bài học</label>
                    <input 
                        type="text" 
                        required 
                        value={lesson.title}
                        onChange={e => setLesson({...lesson, title: e.target.value})}
                        className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                        placeholder="Ví dụ: Bài 01: Làm quen với giao diện"
                    />
                </div>

                <div>
                    <label className="block font-bold text-gray-700 mb-2">Mô tả ngắn</label>
                    <textarea 
                        rows="3"
                        value={lesson.description}
                        onChange={e => setLesson({...lesson, description: e.target.value})}
                        className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all"
                        placeholder="Tóm tắt nội dung bài học..."
                    />
                </div>

                <div>
                    <label className="block font-bold text-gray-700 mb-2">YouTube Video ID</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            required 
                            value={lesson.video_id}
                            onChange={e => setLesson({...lesson, video_id: e.target.value})}
                            className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-blue-500 outline-none transition-all pl-12"
                            placeholder="Mã ID (ví dụ: dQw4w9WgXcQ)"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🎬</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 ml-2 italic">
                        *Lấy phần mã sau dấu <b>v=</b> trong link YouTube.
                    </p>
                </div>
                
                <div className="flex gap-4 pt-6">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                        className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100"
                    >
                        HỦY BỎ
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-200 transition-all ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? "ĐANG XỬ LÝ..." : (onEdit ? "CẬP NHẬT NGAY" : "LƯU BÀI HỌC")}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateLesson;