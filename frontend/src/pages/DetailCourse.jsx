import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { GlobalState } from '../GlobalState';
import { toast } from 'react-toastify';

const filledStarStyle = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" };
const outlineStarStyle = { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

const getRatingLabel = (value) => {
    switch (value) {
        case 1:
            return 'Rất tệ';
        case 2:
            return 'Chưa tốt';
        case 3:
            return 'Ổn';
        case 4:
            return 'Tốt';
        case 5:
            return 'Xuất sắc';
        default:
            return 'Chọn số sao phù hợp';
    }
};

const renderRatingStars = (value, sizeClass = 'text-sm') => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => {
            const star = index + 1;
            const isFull = value >= star;
            const isHalf = !isFull && value >= star - 0.5;

            return (
                <span
                    key={star}
                    className={`material-symbols-outlined ${sizeClass} ${isFull || isHalf ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                    style={isFull || isHalf ? filledStarStyle : outlineStarStyle}
                >
                    {isHalf ? 'star_half' : 'star'}
                </span>
            );
        })}
    </div>
);

const formatRelativeReviewDate = (value) => {
    if (!value) return 'Vừa xong';

    const diffMs = Date.now() - new Date(value).getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) return `${diffWeeks} tuần trước`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} tháng trước`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} năm trước`;
};

const getInitials = (name) => {
    if (!name) return 'HV';

    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
};

const getStudentCount = (course) => {
    const numericCandidates = [
        course?.studentCount,
        course?.studentsEnrolled,
        course?.totalStudents,
        course?.enrolledCount
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
    const [submittingReview, setSubmittingReview] = useState(false);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [callback, setCallback] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);

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
                } catch (error) {
                    console.error('Failed to load course details', error);
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

        if (!isLogged) {
            toast.error('Vui lòng đăng nhập để gửi đánh giá');
            navigate('/login');
            return;
        }

        if (!isEnrolled) {
            toast.error('Bạn cần sở hữu khóa học trước khi gửi đánh giá');
            return;
        }

        if (!rating || !comment.trim()) {
            toast.error('Vui lòng chọn số sao và nhập nội dung đánh giá');
            return;
        }

        setSubmittingReview(true);

        try {
            await axiosClient.post('/reviews', 
                { courseId: course._id, rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Đã gửi đánh giá!");
            setComment('');
            setRating(0);
            setHoverRating(0);
            setShowAllReviews(true);
            setCallback((prev) => !prev);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Lỗi gửi đánh giá");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (!course) return <div className="text-center py-20 italic">Đang tải dữ liệu...</div>;

    const isEnrolled = user?.enrolledCourses?.some((item) => String(item._id || item) === String(course._id));
    const activeRating = hoverRating || rating;
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
        : Number(course.avgRating || 0);
    const studentCount = getStudentCount(course);
    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4);
    const canInteractWithReviewForm = isLogged && isEnrolled;
    const reviewButtonLabel = !isLogged
        ? 'Đăng nhập để đánh giá'
        : !isEnrolled
            ? 'Sở hữu khóa học để đánh giá'
            : submittingReview
                ? 'Đang gửi...'
                : 'Gửi đánh giá';
    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((review) => Math.round(Number(review.rating || 0)) === star).length;
        const percentage = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;

        return { star, percentage };
    });

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6">
                        <Link className="hover:text-primary" to="/">Home</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <Link className="hover:text-primary" to="/courses">Courses</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-slate-900 dark:text-slate-200">{course.title}</span>
                    </nav>

                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 group shadow-2xl mb-8">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-700"
                            style={{ backgroundImage: `url('${course.image.url || course.image}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <button className="absolute inset-0 flex items-center justify-center group/btn">
                            <div className="size-20 bg-primary rounded-full flex items-center justify-center text-white shadow-xl group-hover/btn:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl fill-1">play_arrow</span>
                            </div>
                        </button>
                        <div className="absolute bottom-6 left-6 right-6">
                            <p className="text-white font-medium mb-2">Watch Course Intro</p>
                            <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-primary" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{course.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-500">{averageRating.toFixed(1)}</span>
                            {renderRatingStars(averageRating, 'text-base')}
                            <span className="text-gray-500">({reviewCount} đánh giá)</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center"><i className="fas fa-user-graduate text-blue-500 mr-2"></i>{studentCount.toLocaleString()} học viên</span>
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

                    <section className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800">
                        <h2 className="text-2xl font-bold mb-8">Đánh giá từ học viên</h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                            <div className="col-span-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">{averageRating.toFixed(1)}</div>
                                <div className="mb-2">{renderRatingStars(averageRating, 'text-xl')}</div>
                                <div className="text-sm text-slate-500 font-medium">{reviewCount} đánh giá</div>
                            </div>

                            <div className="col-span-1 md:col-span-3 space-y-3">
                                {ratingBreakdown.map(({ star, percentage }) => (
                                    <div key={star} className="flex items-center gap-4">
                                        <span className="text-sm font-medium w-12">{star} sao</span>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${percentage}%` }} />
                                        </div>
                                        <span className="text-sm text-slate-500 w-12">{percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-12 p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <h3 className="text-lg font-bold mb-4">Viết đánh giá của bạn</h3>

                            {!canInteractWithReviewForm && (
                                <div className="mb-4 p-4 bg-orange-50 text-orange-700 rounded-xl text-sm italic border border-orange-100">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    {!isLogged
                                        ? 'Vui lòng đăng nhập và sở hữu khóa học để gửi đánh giá.'
                                        : 'Bạn cần sở hữu khóa học để đánh giá.'}
                                </div>
                            )}

                            <form onSubmit={submitReview} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Xếp hạng của bạn</label>
                                    <div className="flex gap-1 text-slate-300">
                                        {Array.from({ length: 5 }, (_, index) => {
                                            const star = index + 1;
                                            const isSelected = star <= activeRating;

                                            return (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => canInteractWithReviewForm && setRating(star)}
                                                    onMouseEnter={() => canInteractWithReviewForm && setHoverRating(star)}
                                                    onMouseLeave={() => canInteractWithReviewForm && setHoverRating(0)}
                                                    className={`transition-transform duration-150 ${canInteractWithReviewForm ? 'hover:scale-110' : 'cursor-not-allowed opacity-70'}`}
                                                    aria-label={`Chọn ${star} sao`}
                                                    disabled={!canInteractWithReviewForm}
                                                >
                                                    <span
                                                        className={`material-symbols-outlined text-3xl ${isSelected ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                                                        style={isSelected ? filledStarStyle : outlineStarStyle}
                                                    >
                                                        star
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {activeRating > 0 ? `Bạn đang chọn ${activeRating} sao - ${getRatingLabel(activeRating)}` : 'Chọn từ 1 đến 5 sao'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="review-message">Lời nhắn của bạn</label>
                                    <textarea
                                        id="review-message"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-70"
                                        placeholder="Nhập lời nhắn của bạn tại đây..."
                                        rows="4"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        disabled={!canInteractWithReviewForm}
                                    />
                                </div>

                                <button
                                    className="inline-flex items-center justify-center bg-amber-500 text-slate-950 px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-amber-500/20 transition-colors hover:bg-amber-600 disabled:bg-amber-300 disabled:text-slate-700 disabled:shadow-none disabled:cursor-not-allowed"
                                    type="submit"
                                    disabled={!canInteractWithReviewForm || !rating || !comment.trim() || submittingReview}
                                >
                                    {reviewButtonLabel}
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviewCount === 0 ? (
                                <p className="text-slate-500 italic md:col-span-2">Chưa có đánh giá nào cho khóa học này.</p>
                            ) : (
                                visibleReviews.map((review) => {
                                    const reviewerName = review.userId?.name || 'Học viên';
                                    const reviewerInitials = getInitials(reviewerName);

                                    return (
                                        <div key={review._id} className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-200 overflow-hidden">
                                                    {review.userId?.avatar ? (
                                                        <img src={review.userId.avatar} alt={reviewerName} className="size-full object-cover" />
                                                    ) : (
                                                        reviewerInitials
                                                    )}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">{reviewerName}</h5>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex text-amber-500">{renderRatingStars(Number(review.rating || 0), 'text-sm')}</div>
                                                        <span className="text-[10px] text-slate-400 font-medium">{formatRelativeReviewDate(review.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {reviewCount > 4 && (
                            <button
                                type="button"
                                onClick={() => setShowAllReviews((prev) => !prev)}
                                className="mt-10 px-6 py-2 border border-primary text-primary text-sm font-bold rounded-lg hover:bg-primary/5 transition-colors mx-auto block"
                            >
                                {showAllReviews ? 'Thu gọn đánh giá' : 'Xem tất cả đánh giá'}
                            </button>
                        )}
                    </section>
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