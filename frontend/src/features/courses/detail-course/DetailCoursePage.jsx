import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../shared/api/axiosClient';
import { GlobalState } from '../../../app/providers/GlobalState';
import { toast } from 'react-toastify';
import LessonModal from './lesson/LessonModal';
import LessonsSection from './LessonsSection';
import CourseReviewsSection from './review/CourseReviewsSection';
import { getStudentCount } from '../../../shared/utils/courseDataUtils';
import { normalizeLessonType } from './lesson/LessonUtils';
import { renderRatingStars } from './review/ReviewUtils.jsx';
import usePdfLessonUrl from './lesson/document/PdfUrl';

/*
  ==================== BƯỚC 4: LUỒNG CHÍNH CỦA HỌC VIÊN ====================
  File này lớn vì nó gom nhiều hành động của học viên vào cùng một trang:
  - Tải chi tiết khóa học, lessons, reviews
  - Thêm giỏ hàng / đăng ký học
  - Mở lesson để học
  - Nộp quiz / assignment
  - Cập nhật progress
  - Gửi review

  Cách đọc nhanh file này:
  A) Đọc tất cả các useState trước để biết trang giữ dữ liệu gì
  B) Tìm fetchData và useEffect lấy progress để hiểu dữ liệu vào từ đâu
  C) Đọc các hàm hành động chính:
      - handleAddToCart
      - submitReview
      - markLessonComplete
  D) Nhìn phần return để biết UI được chia thành 3 khối:
      - LessonModal
      - LessonsSection
      - CourseReviewsSection
  ======================================================================
*/

const DetailCourse = () => {
    const params = useParams();
    const navigate = useNavigate();
    const state = useContext(GlobalState);

    const [token] = state.token;
    const [user, setUser] = state.userAPI.user;
    const [isLogged] = state.userAPI.isLogged;

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);

    const [activeLesson, setActiveLesson] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [assignmentAnswer, setAssignmentAnswer] = useState('');
    const [submittingAssignment, setSubmittingAssignment] = useState(false);
    const pdfBlobUrl = usePdfLessonUrl(activeLesson);
    const [progress, setProgress] = useState({
        completedLessons: [],
        assignmentSubmissions: [],
        completedCount: 0,
        totalLessons: 0,
        progressPercent: 0
    });

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [callback, setCallback] = useState(false);

    const syncProgress = useCallback((payload) => {
        setProgress({
            completedLessons: Array.isArray(payload?.completedLessons) ? payload.completedLessons.map((item) => String(item)) : [],
            assignmentSubmissions: Array.isArray(payload?.assignmentSubmissions)
                ? payload.assignmentSubmissions.map((item) => ({
                    lessonId: String(item.lessonId),
                    answer: item.answer || '',
                    submittedAt: item.submittedAt || null
                }))
                : [],
            completedCount: Number(payload?.completedCount || 0),
            totalLessons: Number(payload?.totalLessons || 0),
            progressPercent: Number(payload?.progressPercent || 0)
        });
    }, []);

    useEffect(() => {
        if (!params.id) return;

        const fetchData = async () => {
            try {
                const [courseRes, lessonsRes, reviewsRes] = await Promise.all([
                    axiosClient.get(`/courses/${params.id}`),
                    axiosClient.get(`/lessons/${params.id}`, {
                        headers: { Authorization: token ? `Bearer ${token}` : '' }
                    }),
                    axiosClient.get(`/reviews/${params.id}`)
                ]);

                setCourse(courseRes.data);
                setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : []);
                setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
            } catch {
                toast.error('Khong the tai du lieu khoa hoc');
            }
        };

        fetchData();
    }, [params.id, token, callback]);

    const isEnrolled = user?.enrolledCourses?.some((item) => String(item?._id || item) === String(course?._id));
    const isInCart = user?.cart?.some((item) => String(item?._id || item) === String(course?._id));
    const isPaidCourse = Number(course?.price || 0) > 0;
    const isAdmin = Number(user?.role) === 1;
    const canStudy = Boolean(course?._id) && (isEnrolled || isAdmin);

    useEffect(() => {
        if (!token || !params.id || !canStudy) {
            syncProgress({ completedLessons: [], assignmentSubmissions: [], completedCount: 0, totalLessons: 0, progressPercent: 0 });
            return;
        }

        const fetchProgress = async () => {
            try {
                const response = await axiosClient.get(`/progress/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                syncProgress(response.data);
            } catch (error) {
                console.error('Khong the tai tien do khoa hoc:', error);
            }
        };

        fetchProgress();
    }, [canStudy, params.id, syncProgress, token]);

    if (!course) {
        return <div className="py-20 text-center italic">Dang tai du lieu...</div>;
    }
    const activeRating = hoverRating || rating;
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
        : Number(course.avgRating || 0);
    const studentCount = getStudentCount(course);
    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4);
    const completedLessonIds = new Set((progress.completedLessons || []).map((item) => String(item)));
    const assignmentSubmissionMap = new Map(
        (progress.assignmentSubmissions || []).map((item) => [String(item.lessonId), item])
    );
    const completedLessonCount = lessons.filter((lesson) => completedLessonIds.has(String(lesson?._id || ''))).length;
    const progressPercent = lessons.length > 0 ? Math.round((completedLessonCount / lessons.length) * 100) : 0;

    const canInteractWithReviewForm = isLogged && isEnrolled;

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((review) => Math.round(Number(review.rating || 0)) === star).length;
        const percentage = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
        return { star, percentage };
    });

    const handleEnrollment = async () => {
        if (!isLogged) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosClient.patch(
                '/users/enroll',
                { courseId: course._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(response.data.msg || 'Dang ky khoa hoc thanh cong');
            setCallback((prev) => !prev);
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Dang ky khoa hoc that bai');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isLogged) {
            navigate('/login');
            return;
        }

        const currentCart = Array.isArray(user?.cart) ? user.cart : [];
        const existed = currentCart.some((item) => String(item?._id || item) === String(course._id));

        if (existed) {
            toast.info('Khoa hoc da co trong gio hang. Ban co the bam "Thanh toan ngay".');
            return;
        }

        const nextCart = [
            ...currentCart,
            {
                _id: course._id,
                title: course.title,
                image: course.image,
                teacher: course.teacher || 'EduLearn Team',
                description: course.description,
                price: Number(course.price || 0)
            }
        ];

        setLoading(true);
        try {
            await axiosClient.patch('/users/addcart', { cart: nextCart }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userRes = await axiosClient.get('/users/infor', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(userRes.data);

            toast.success('Da them khoa hoc vao gio hang.');
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Khong the them vao gio hang.');
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async (event) => {
        event.preventDefault();

        if (!isLogged) {
            navigate('/login');
            return;
        }

        if (!isEnrolled) {
            toast.error('Ban can so huu khoa hoc truoc khi danh gia.');
            return;
        }

        if (!rating || !String(comment).trim()) {
            toast.error('Vui long chon sao va nhap noi dung danh gia.');
            return;
        }

        setSubmittingReview(true);
        try {
            await axiosClient.post('/reviews', { courseId: course._id, rating, comment }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Da gui danh gia thanh cong.');
            setComment('');
            setRating(0);
            setHoverRating(0);
            setShowAllReviews(true);
            setCallback((prev) => !prev);
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Gui danh gia that bai');
        } finally {
            setSubmittingReview(false);
        }
    };

    const openLesson = (lesson) => {
        if (!isLogged) {
            toast.info('Vui long dang nhap de hoc bai.');
            navigate('/login');
            return;
        }

        if (!canStudy) {
            toast.warn('Ban chua dang ky khoa hoc nen khong the hoc bai nay.');
            return;
        }

        if (lesson.isLocked) {
            toast.warn('Bai hoc dang bi khoa.');
            return;
        }

        setActiveLesson(lesson);
        setQuizAnswers({});
        setQuizResult(null);
        setAssignmentAnswer(assignmentSubmissionMap.get(String(lesson?._id || ''))?.answer || '');
    };

    const markLessonComplete = async (lesson, { silent = false } = {}) => {
        if (!token || !canStudy) return;

        if (completedLessonIds.has(String(lesson?._id || ''))) {
            if (!silent) {
                toast.info('Bai hoc nay da duoc danh dau hoan thanh.');
            }
            return;
        }

        try {
            const response = await axiosClient.post('/progress/mark-complete', {
                courseId: course._id,
                lessonId: lesson._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            syncProgress(response.data?.progress);
            if (!silent) {
                toast.success(response.data?.msg || 'Da cap nhat tien do bai hoc.');
            }
        } catch (error) {
            if (!silent) {
                toast.error(error.response?.data?.msg || 'Khong the cap nhat tien do bai hoc.');
            }
        }
    };

    const unmarkLessonComplete = async (lesson, { silent = false } = {}) => {
        if (!token || !canStudy) return;

        if (!isLessonCompleted(lesson?._id)) {
            if (!silent) {
                toast.info('Bai hoc nay chua duoc danh dau hoan thanh.');
            }
            return;
        }

        try {
            const response = await axiosClient.post('/progress/unmark-complete', {
                courseId: course._id,
                lessonId: lesson._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            syncProgress(response.data?.progress);
            if (!silent) {
                toast.success(response.data?.msg || 'Da hoan tac tien do bai hoc.');
            }
        } catch (error) {
            if (!silent) {
                toast.error(error.response?.data?.msg || 'Khong the hoan tac tien do bai hoc.');
            }
        }
    };

    const toggleLessonCompletion = async (lesson) => {
        if (!lesson) return;

        if (isLessonCompleted(lesson._id)) {
            const confirmed = window.confirm('Ban co muon huy hoan thanh bai hoc nay khong?');
            if (!confirmed) return;
            await unmarkLessonComplete(lesson);
            return;
        }

        const confirmed = window.confirm('Ban co chac chan muon danh dau hoan thanh bai hoc nay khong?');
        if (!confirmed) return;

        await markLessonComplete(lesson);
    };

    const handleLessonPrimaryAction = async () => {
        if (!activeLesson) return;

        const lessonType = normalizeLessonType(activeLesson.lessonType);

        if (isLessonCompleted(activeLesson._id)) {
            await toggleLessonCompletion(activeLesson);
            return;
        }

        if (lessonType === 'quiz') {
            await submitQuiz();
            return;
        }

        if (lessonType === 'assignment') {
            await submitAssignment();
            return;
        }

        await toggleLessonCompletion(activeLesson);
    };

    const getLessonPrimaryActionLabel = () => {
        if (!activeLesson) return 'Cap nhat';
        const lessonType = normalizeLessonType(activeLesson.lessonType);

        if (lessonType === 'quiz' || lessonType === 'assignment') {
            return isLessonCompleted(activeLesson._id) ? 'Da nop bai' : 'Nop bai';
        }

        if (isLessonCompleted(activeLesson._id)) return 'Da hoan thanh';
        return 'Hoan thanh';
    };

    const submitQuiz = async () => {
        if (!activeLesson) return;

        const questions = Array.isArray(activeLesson.quizQuestions) ? activeLesson.quizQuestions : [];
        if (questions.length === 0) {
            toast.warn('Quiz hien tai chua co cau hoi duoc cau hinh.');
            return;
        }

        let correctCount = 0;
        questions.forEach((question, index) => {
            const selected = Number(quizAnswers[index]);
            if (selected === Number(question.correctOptionIndex)) {
                correctCount += 1;
            }
        });

        const scorePercent = Math.round((correctCount / questions.length) * 100);
        const passingScore = Math.max(0, Math.min(100, Number(activeLesson.quizPassingScore || 0)));
        const passed = scorePercent >= passingScore;

        setQuizResult({
            correctCount,
            total: questions.length,
            scorePercent,
            passingScore,
            passed
        });

        if (passed) {
            await markLessonComplete(activeLesson, { silent: true });
            toast.success('Ban da hoan thanh quiz va he thong da cap nhat tien do.');
        } else {
            toast.info('Chua dat diem qua. Thu lai nhe.');
        }
    };

    const submitAssignment = async () => {
        if (!activeLesson) return;

        if (!assignmentAnswer.trim()) {
            toast.error('Vui long nhap cau tra loi.');
            return;
        }

        if (!token) {
            toast.error('Vui long dang nhap de nop bai.');
            return;
        }

        setSubmittingAssignment(true);
        try {
            const response = await axiosClient.post('/progress/assignment/submit', {
                courseId: course._id,
                lessonId: activeLesson._id,
                answer: assignmentAnswer.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            syncProgress(response.data?.progress);
            toast.success('Da nop bai assignment thanh cong va cap nhat tien do.');
            setAssignmentAnswer('');
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Khong the nop bai assignment.');
        } finally {
            setSubmittingAssignment(false);
        }
    };

    const isLessonCompleted = (lessonId) => completedLessonIds.has(String(lessonId || ''));

    const getAssignmentSubmission = (lessonId) => assignmentSubmissionMap.get(String(lessonId || ''));

    return (
        <div className="container mx-auto px-4 py-10">
            <LessonModal
                activeLesson={activeLesson}
                pdfBlobUrl={pdfBlobUrl}
                quizAnswers={quizAnswers}
                setQuizAnswers={setQuizAnswers}
                quizResult={quizResult}
                assignmentAnswer={assignmentAnswer}
                setAssignmentAnswer={setAssignmentAnswer}
                submittingAssignment={submittingAssignment}
                onClose={() => setActiveLesson(null)}
                onPrimaryAction={handleLessonPrimaryAction}
                isLessonCompleted={isLessonCompleted}
                getLessonPrimaryActionLabel={getLessonPrimaryActionLabel}
                getAssignmentSubmission={getAssignmentSubmission}
            />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <nav className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Link className="hover:text-primary" to="/">Home</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <Link className="hover:text-primary" to="/courses">Courses</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-slate-900 dark:text-slate-200">{course.title}</span>
                    </nav>

                    <h1 className="mb-4 text-4xl font-extrabold text-gray-900">{course.title}</h1>
                    <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-500">{averageRating.toFixed(1)}</span>
                            {renderRatingStars(averageRating, 'text-base')}
                            <span className="text-gray-500">({reviewCount} danh gia)</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center"><i className="fas fa-user-graduate mr-2 text-blue-500" />{studentCount.toLocaleString()} hoc vien</span>
                    </div>

                    <h2 className="mb-4 border-l-4 border-blue-600 pl-4 text-2xl font-bold">Mo ta khoa hoc</h2>
                    <p className="mb-10 whitespace-pre-line leading-relaxed text-gray-700">{course.description}</p>

                    {!canStudy && (
                        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                            Ban chua so huu khoa hoc, vi vay khong the hoc lesson. Hay bam Them vao gio hang de tien hanh thanh toan.
                        </div>
                    )}

                    <LessonsSection
                        lessons={lessons}
                        canStudy={canStudy}
                        completedLessonCount={completedLessonCount}
                        progressPercent={progressPercent}
                        openLesson={openLesson}
                        isLessonCompleted={isLessonCompleted}
                    />

                    <CourseReviewsSection
                        averageRating={averageRating}
                        reviewCount={reviewCount}
                        ratingBreakdown={ratingBreakdown}
                        canInteractWithReviewForm={canInteractWithReviewForm}
                        isLogged={isLogged}
                        activeRating={activeRating}
                        rating={rating}
                        setRating={setRating}
                        setHoverRating={setHoverRating}
                        comment={comment}
                        setComment={setComment}
                        submitReview={submitReview}
                        submittingReview={submittingReview}
                        visibleReviews={visibleReviews}
                        showAllReviews={showAllReviews}
                        setShowAllReviews={setShowAllReviews}
                    />
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24 rounded-3xl border border-gray-50 bg-white p-8 text-center shadow-2xl">
                        <div className="mb-6">
                            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-gray-400">Gia khoa hoc</p>
                            <h3 className="text-4xl font-black text-blue-600">{course.price === 0 ? 'MIEN PHI' : `${course.price.toLocaleString()}d`}</h3>
                        </div>
                        {isEnrolled ? (
                            <button className="flex w-full cursor-default items-center justify-center gap-2 rounded-2xl bg-green-100 py-4 font-black text-green-700">
                                <i className="fas fa-check-circle" /> DA SO HUU
                            </button>
                        ) : (
                            <button
                                onClick={isPaidCourse ? (isInCart ? () => navigate('/checkout') : handleAddToCart) : handleEnrollment}
                                disabled={loading}
                                className="w-full rounded-2xl bg-blue-600 py-4 font-black text-white shadow-xl transition-all hover:bg-blue-700 active:scale-95"
                            >
                                {loading ? 'DANG XU LY...' : (isPaidCourse ? (isInCart ? 'THANH TOAN NGAY' : 'THEM VAO GIO HANG') : 'DANG KY HOC NGAY')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailCourse;
