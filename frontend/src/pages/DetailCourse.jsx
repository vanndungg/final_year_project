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
    const [lessons, setLessons] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [callback, setCallback] = useState(false);

    useEffect(() => {
        if (params.id) {
            const getCourseData = async () => {
                try {
                    const resCourse = await axiosClient.get(`/courses/${params.id}`);
                    setCourse(resCourse.data);

                    const resLessons = await axiosClient.get(`/lessons/${params.id}`, {
                        headers: { Authorization: token ? `Bearer ${token}` : "" }
                    });
                    setLessons(resLessons.data);

                    const resReviews = await axiosClient.get(`/reviews/${params.id}`);
                    setReviews(resReviews.data);
                } catch (err) {
                    toast.error("Không thể tải dữ liệu khóa học");
                }
            };
            getCourseData();
        }
    }, [params.id, token, callback]);

    // 1. Hàm Đăng ký khóa học (kể cả trả phí)
    const handleEnrollment = async () => {
        if (!isLogged) return navigate('/login');
        setLoading(true);
        try {
            const res = await axiosClient.patch('/users/enroll',
                { courseId: course._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.msg);
            window.location.reload();
        } catch (err) {
            console.error("Enrollment request failed", err);
            toast.error(err.response?.data?.msg || err.message || "Có lỗi xảy ra khi đăng ký");
        }
        setLoading(false);
    };


    const submitReview = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/reviews', 
                { courseId: course._id, rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Đã gửi đánh giá!");
            setComment('');
            setRating(5);
            setCallback(!callback);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Lỗi gửi đánh giá");
        }
    };

    if (!course) return <div className="text-center py-20 italic">Đang tải dữ liệu...</div>;

    const isEnrolled = user?.enrolledCourses?.some(item => (item._id || item) === course._id);

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <img src={course.image.url || course.image} alt={course.title} className="w-full h-96 object-cover rounded-2xl shadow-lg mb-8" />
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{course.title}</h1>
                    
                    <div className="flex items-center gap-6 mb-8 text-gray-600">
                        <span className="flex items-center"><i className="fas fa-star text-yellow-500 mr-2"></i>{course.avgRating || 0} / 5</span>
                        <span className="flex items-center"><i className="fas fa-user-graduate text-blue-500 mr-2"></i>{course.studentCount || 0} Học viên</span>
                    </div>

                    <h2 className="text-2xl font-bold mb-4 border-l-4 border-blue-600 pl-4">Mô tả khóa học</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-10">{course.description}</p>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <i className="fas fa-play-circle mr-3 text-blue-600"></i>
                            Nội dung bài học ({lessons.length})
                        </h2>
                        <div className="space-y-3">
                            {lessons.map((lesson, index) => (
                                <div key={lesson._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:border-blue-300 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{index + 1}</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                                            <p className="text-xs text-gray-500">{lesson.description}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {lesson.videoUrl ? (
                                            <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 uppercase">Học ngay</a>
                                        ) : (
                                            <span className="text-gray-400 text-xs flex items-center gap-1 italic"><i className="fas fa-lock"></i> Đã khóa</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-16">
                        <h2 className="text-2xl font-bold mb-8 flex items-center"><i className="fas fa-comments mr-3 text-green-600"></i>Đánh giá từ cộng đồng</h2>
                        {isEnrolled ? (
                            <form onSubmit={submitReview} className="mb-10 bg-white p-6 rounded-2xl border-2 border-dashed border-blue-200 shadow-sm">
                                <h3 className="font-bold mb-4 text-gray-800">Để lại cảm nghĩ của bạn</h3>
                                <div className="flex gap-2 mb-4 text-xl">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <i key={num} className={`cursor-pointer fas fa-star ${rating >= num ? 'text-yellow-500' : 'text-gray-300'}`} onClick={() => setRating(num)}></i>
                                    ))}
                                </div>
                                <textarea className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nội dung đánh giá..." value={comment} onChange={e => setComment(e.target.value)} required rows="3" />
                                <button className="mt-4 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md">GỬI ĐÁNH GIÁ</button>
                            </form>
                        ) : (
                            <div className="mb-10 p-4 bg-orange-50 text-orange-700 rounded-xl text-sm italic border border-orange-100">
                                <i className="fas fa-info-circle mr-2"></i>Bạn cần sở hữu khóa học để đánh giá.
                            </div>
                        )}
                        <div className="space-y-6">
                            {reviews.length > 0 ? reviews.map(rev => (
                                <div key={rev._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold uppercase">{rev.userId?.name?.charAt(0) || "U"}</div>
                                            <div>
                                                <p className="font-bold text-gray-800">{rev.userId?.name || "Người dùng ẩn danh"}</p>
                                                <div className="text-yellow-500 text-xs">{"⭐".repeat(rev.rating)}</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium italic">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed pl-13">{rev.comment}</p>
                                </div>
                            )) : <p className="text-center text-gray-400 py-10 italic">Chưa có đánh giá.</p>}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-50 sticky top-24 text-center">
                        <div className="mb-6">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Giá khóa học</p>
                            <h3 className="text-4xl font-black text-blue-600">{course.price === 0 ? "MIỄN PHÍ" : `${course.price.toLocaleString()}đ`}</h3>
                        </div>
                        {isEnrolled ? (
                            <button className="w-full py-4 bg-green-100 text-green-700 rounded-2xl font-black flex items-center justify-center gap-2 cursor-default">
                                <i className="fas fa-check-circle"></i> ĐÃ SỞ HỮU
                            </button>
                        ) : (
                            <button onClick={handleEnrollment} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl active:scale-95">
                                {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ HỌC NGAY"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DetailCourse;