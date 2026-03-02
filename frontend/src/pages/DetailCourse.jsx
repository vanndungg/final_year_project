import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { GlobalState } from '../GlobalState';
import { toast } from 'react-toastify';

const DetailCourse = () => {
    const params = useParams();
    const navigate = useNavigate();
    const state = useContext(GlobalState);
    
    const [token] = state.token;
    const [user] = state.userAPI.user;
    const [isLogged] = state.userAPI.isLogged;
    
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]); // Khởi tạo state cho danh sách bài học
    const [showModal, setShowModal] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (params.id) {
            const getCourseData = async () => {
                try {
                    // Lấy chi tiết khóa học
                    const resCourse = await axiosClient.get(`/courses/${params.id}`);
                    setCourse(resCourse.data);

                    // Lấy danh sách bài học (Gửi kèm token nếu có để backend check quyền xem video)
                    const resLessons = await axiosClient.get(`/lessons/${params.id}`, {
                        headers: { Authorization: token ? `Bearer ${token}` : "" }
                    });
                    setLessons(resLessons.data);
                } catch (err) {
                    toast.error("Không thể tải dữ liệu khóa học");
                }
            };
            getCourseData();
        }
    }, [params.id, token]);

    const handleEnrollment = async () => {
        if (!isLogged) return navigate('/login');
        setLoading(true);

        try {
            if (course.price === 0) {
                const res = await axiosClient.post('/users/enroll', { courseId: course._id });
                toast.success(res.data.msg);
                window.location.reload();
            } else {
                const res = await axiosClient.post('/payments/create-payment', { courseId: course._id });
                setPaymentInfo(res.data);
                setShowModal(true);
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || "Có lỗi xảy ra");
        }
        setLoading(false);
    };

    if (!course) return <div className="text-center py-20">Đang tải...</div>;

    const isEnrolled = user?.enrolledCourses?.some(item => (item._id || item) === course._id);

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <img src={course.image.url || course.image} alt={course.title} className="w-full h-96 object-cover rounded-2xl shadow-lg mb-8" />
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{course.title}</h1>
                    
                    <div className="flex items-center gap-6 mb-8 text-gray-600">
                        <span className="flex items-center"><i className="fas fa-star text-yellow-500 mr-2"></i>{course.avgRating} Đánh giá</span>
                        <span className="flex items-center"><i className="fas fa-user-graduate text-blue-500 mr-2"></i>{course.studentCount || 0} Học viên</span>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">Mô tả khóa học</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-10">{course.description}</p>

                    {/* PHẦN DANH SÁCH BÀI HỌC (NEW) */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <i className="fas fa-play-circle mr-3 text-blue-600"></i>
                            Danh sách bài học ({lessons.length})
                        </h2>
                        
                        <div className="space-y-3">
                            {lessons.length > 0 ? (
                                lessons.map((lesson, index) => (
                                    <div key={lesson._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-blue-300 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-1">{lesson.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            {/* Nếu backend trả về link thật (đã check quyền), hiển thị nút xem */}
                                            {lesson.videoUrl.startsWith('http') ? (
                                                <a 
                                                    href={lesson.videoUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    HỌC NGAY
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs flex items-center gap-1 italic">
                                                    <i className="fas fa-lock text-[10px]"></i> Nội dung khóa
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4 italic">Chưa có bài học nào được cập nhật.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar giữ nguyên như cũ */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24 text-center">
                        <h3 className="text-3xl font-black text-blue-600 mb-6">
                            {course.price === 0 ? "MIỄN PHÍ" : `${course.price.toLocaleString()}đ`}
                        </h3>
                        
                        {isEnrolled ? (
                            <button className="w-full py-4 bg-green-600 text-white rounded-xl font-bold cursor-default">
                                BẠN ĐÃ SỞ HỮU KHÓA HỌC
                            </button>
                        ) : (
                            <button 
                                onClick={handleEnrollment}
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                            >
                                {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ HỌC NGAY"}
                            </button>
                        )}
                        <p className="mt-4 text-xs text-gray-400 font-medium uppercase tracking-widest">Truy cập trọn đời</p>
                    </div>
                </div>
            </div>

            {/* Modal thanh toán giữ nguyên */}
            {showModal && paymentInfo && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Thanh toán khóa học</h3>
                        <img src={paymentInfo.qrCode} alt="VietQR" className="w-64 h-64 mx-auto border rounded-xl mb-4" />
                        <div className="bg-blue-50 p-4 rounded-xl text-left mb-4">
                            <p className="text-sm text-gray-600">Số tiền: <span className="font-bold text-blue-600">{paymentInfo.amount.toLocaleString()}đ</span></p>
                            <p className="text-sm text-gray-600">Nội dung: <span className="font-bold text-red-600">{paymentInfo.content}</span></p>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động kích hoạt.</p>
                        <button onClick={() => window.location.reload()} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all">
                            TÔI ĐÃ CHUYỂN KHOẢN XONG
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailCourse;