import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { GlobalState } from '../GlobalState';
import { toast } from 'react-toastify';

const filledStarStyle = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" };
const outlineStarStyle = { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

const getLessonTypeMeta = (lessonType) => {
    const normalizedType = String(lessonType || 'video').toLowerCase();

    if (normalizedType === 'document') return { icon: 'description', iconClass: 'text-orange-500', label: 'Tai lieu' };
    if (normalizedType === 'quiz') return { icon: 'quiz', iconClass: 'text-green-500', label: 'Quiz' };
    if (normalizedType === 'assignment') return { icon: 'assignment', iconClass: 'text-violet-500', label: 'Bai tap' };

    return { icon: 'play_circle', iconClass: 'text-blue-600', label: 'Video' };
};

const getRatingLabel = (value) => {
    switch (value) {
        case 1: return 'Rat te';
        case 2: return 'Chua tot';
        case 3: return 'On';
        case 4: return 'Tot';
        case 5: return 'Xuat sac';
        default: return 'Chon so sao phu hop';
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

const getStudentCount = (course) => {
    const numericCandidates = [course?.studentCount, course?.studentsEnrolled, course?.totalStudents, course?.enrolledCount];
    for (const value of numericCandidates) {
        if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
            return Number(value);
        }
    }
    if (Array.isArray(course?.enrolledStudents)) return course.enrolledStudents.length;
    if (Array.isArray(course?.students)) return course.students.length;
    return 0;
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

const formatRelativeReviewDate = (value) => {
    if (!value) return 'Vua xong';

    const diffMs = Date.now() - new Date(value).getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (diffMinutes < 60) return `${diffMinutes} phut truoc`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} gio truoc`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngay truoc`;

    return `${Math.floor(diffDays / 7)} tuan truoc`;
};

const getYoutubeEmbedUrl = (lesson) => {
    const rawUrl = String(lesson?.videoUrl || '').trim();
    const rawVideoId = String(lesson?.video_id || '').trim();

    if (rawUrl.includes('youtube.com/watch?v=')) {
        const id = rawUrl.split('v=')[1]?.split('&')[0] || '';
        return id ? `https://www.youtube.com/embed/${id}` : '';
    }

    if (rawUrl.includes('youtu.be/')) {
        const id = rawUrl.split('youtu.be/')[1]?.split('?')[0] || '';
        return id ? `https://www.youtube.com/embed/${id}` : '';
    }

    if (rawVideoId) return `https://www.youtube.com/embed/${rawVideoId}`;
    return '';
};

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
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const prevPdfBlobUrl = useRef(null);

    // Tạo Blob URL khi mở document lesson, giải phóng khi đóng
    useEffect(() => {
        if (prevPdfBlobUrl.current) {
            URL.revokeObjectURL(prevPdfBlobUrl.current);
            prevPdfBlobUrl.current = null;
        }

        if (activeLesson?.lessonType === 'document' && activeLesson?.resourceUrl) {
            const raw = activeLesson.resourceUrl;
            let blobUrl = null;

            if (raw.startsWith('data:')) {
                // base64 Data URL → Blob URL
                try {
                    const [header, base64] = raw.split(',');
                    const mime = header.match(/:(.*?);/)?.[1] || 'application/pdf';
                    const binary = atob(base64);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                    blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
                } catch {
                    blobUrl = null;
                }
            } else {
                // HTTP URL thường, dùng thẳng
                blobUrl = raw;
            }

            prevPdfBlobUrl.current = blobUrl?.startsWith('blob:') ? blobUrl : null;
            setPdfBlobUrl(blobUrl);
        } else {
            setPdfBlobUrl(null);
        }

        return () => {
            if (prevPdfBlobUrl.current) {
                URL.revokeObjectURL(prevPdfBlobUrl.current);
                prevPdfBlobUrl.current = null;
            }
        };
    }, [activeLesson]);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [callback, setCallback] = useState(false);

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

    if (!course) {
        return <div className="py-20 text-center italic">Dang tai du lieu...</div>;
    }

    const isEnrolled = user?.enrolledCourses?.some((item) => String(item?._id || item) === String(course._id));
    const isPaidCourse = Number(course?.price || 0) > 0;
    const isAdmin = Number(user?.role) === 1;
    const canStudy = isEnrolled || isAdmin;
    const activeRating = hoverRating || rating;
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
        : Number(course.avgRating || 0);
    const studentCount = getStudentCount(course);
    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4);

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

    const handleAddToCartAndCheckout = async () => {
        if (!isLogged) {
            navigate('/login');
            return;
        }

        const currentCart = Array.isArray(user?.cart) ? user.cart : [];
        const existed = currentCart.some((item) => String(item?._id || item) === String(course._id));

        if (existed) {
            toast.info('Khoa hoc da co trong gio hang.');
            navigate('/checkout');
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
            navigate('/checkout');
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
        setAssignmentAnswer('');
    };

    const markLessonComplete = async (lesson) => {
        if (!token || !canStudy) return;

        try {
            await axiosClient.post('/progress/mark-complete', {
                courseId: course._id,
                lessonId: lesson._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch {
            // Ignore mark-complete errors to avoid interrupting learning flow.
        }
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
            await markLessonComplete(activeLesson);
            toast.success('Ban da hoan thanh quiz.');
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
            await axiosClient.post('/progress/assignment/submit', {
                courseId: course._id,
                lessonId: activeLesson._id,
                answer: assignmentAnswer.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Da nop bai assignment thanh cong.');
            setAssignmentAnswer('');
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Khong the nop bai assignment.');
        } finally {
            setSubmittingAssignment(false);
        }
    };

    const lessonActionLabel = (lesson) => {
        if (lesson.lessonType === 'video') return 'Hoc ngay';
        if (lesson.lessonType === 'document') return 'Doc bai';
        if (lesson.lessonType === 'quiz') return 'Lam quiz';
        if (lesson.lessonType === 'assignment') return 'Lam bai tap';
        return 'Hoc ngay';
    };

    const lessonActionClass = (lesson) => {
        if (lesson.lessonType === 'document') return 'bg-orange-500 hover:bg-orange-600';
        if (lesson.lessonType === 'quiz') return 'bg-green-600 hover:bg-green-700';
        if (lesson.lessonType === 'assignment') return 'bg-violet-600 hover:bg-violet-700';
        return 'bg-blue-600 hover:bg-blue-700';
    };

    const lessonModal = activeLesson ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-black">{activeLesson.title}</h3>
                        <p className="text-sm text-slate-500">{activeLesson.description}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setActiveLesson(null)}
                        className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {activeLesson.lessonType === 'video' && (
                    <div className="space-y-4">
                        {activeLesson.videoUploadData ? (
                            <video controls className="w-full rounded-xl bg-black" src={activeLesson.videoUploadData} />
                        ) : getYoutubeEmbedUrl(activeLesson) ? (
                            <div className="aspect-video overflow-hidden rounded-xl">
                                <iframe
                                    title={activeLesson.title}
                                    src={getYoutubeEmbedUrl(activeLesson)}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        ) : activeLesson.videoUrl ? (
                            <video controls className="w-full rounded-xl bg-black" src={activeLesson.videoUrl} />
                        ) : (
                            <p className="text-sm text-slate-500">Video hien chua san sang.</p>
                        )}

                        <button
                            type="button"
                            onClick={() => markLessonComplete(activeLesson)}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
                        >
                            Danh dau hoan thanh
                        </button>
                    </div>
                )}

                    {activeLesson.lessonType === 'document' && (
                        <div className="space-y-4">
                            {pdfBlobUrl ? (
                                <div className="space-y-3">
                                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                        <iframe
                                            title={activeLesson.title}
                                            src={`${pdfBlobUrl}#navpanes=0&toolbar=1&scrollbar=1`}
                                            className="h-[70vh] w-full"
                                        />
                                    </div>
                                    <a
                                        href={pdfBlobUrl}
                                        download={activeLesson.title + '.pdf'}
                                        className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        <span className="material-symbols-outlined mr-2 text-[18px]">download</span>
                                        Tải xuống PDF
                                    </a>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                                    <div
                                        className="prose max-w-none text-sm dark:prose-invert"
                                        dangerouslySetInnerHTML={{ __html: String(activeLesson.content || '') }}
                                    />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => markLessonComplete(activeLesson)}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
                            >
                                Danh dau da doc xong
                            </button>
                        </div>
                    )}

                    {activeLesson.lessonType === 'quiz' && (
                        <div className="space-y-5">
                            {(activeLesson.quizQuestions || []).map((question, qIndex) => (
                                <div key={`quiz-question-${qIndex + 1}`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                                    <p className="mb-3 text-sm font-bold">{`Cau ${qIndex + 1}: ${question.question}`}</p>
                                    <div className="space-y-2">
                                        {(question.options || []).map((option, optionIndex) => (
                                            <label key={`quiz-option-${qIndex + 1}-${optionIndex + 1}`} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                                                <input
                                                    type="radio"
                                                    name={`quiz-${qIndex}`}
                                                    checked={Number(quizAnswers[qIndex]) === optionIndex}
                                                    onChange={() => setQuizAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }))}
                                                />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={submitQuiz}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                            >
                                Nop quiz
                            </button>

                            {quizResult && (
                                <div className={`rounded-lg border p-3 text-sm ${quizResult.passed ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700'}`}>
                                    <p className="font-bold">Ket qua quiz</p>
                                    <p>{`Dung ${quizResult.correctCount}/${quizResult.total} cau (${quizResult.scorePercent}%).`}</p>
                                    <p>{`Moc dat: ${quizResult.passingScore}%.`}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeLesson.lessonType === 'assignment' && (
                        <div className="space-y-4">
                            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-200">
                                <p className="font-bold">De bai</p>
                                <p className="mt-2 whitespace-pre-line">{activeLesson.content}</p>
                            </div>
                            <textarea
                                rows="7"
                                value={assignmentAnswer}
                                onChange={(event) => setAssignmentAnswer(event.target.value)}
                                placeholder="Nhap cau tra loi cua ban tai day..."
                                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                            />
                            <button
                                type="button"
                                disabled={submittingAssignment}
                                onClick={submitAssignment}
                                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60"
                            >
                                {submittingAssignment ? 'Dang nop...' : 'Nop cau tra loi'}
                            </button>
                        </div>
                    )}
            </div>
        </div>
    ) : null;

    return (
        <div className="container mx-auto px-4 py-10">
            {lessonModal}
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
                            Ban chua dang ky khoa hoc, vi vay khong the hoc lesson. Hay bam Dang ky hoc ngay de mo noi dung.
                        </div>
                    )}

                    <div className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                        <h2 className="mb-6 flex items-center text-2xl font-bold">
                            <i className="fas fa-play-circle mr-3 text-blue-600" />
                            Noi dung bai hoc ({lessons.length})
                        </h2>
                        <div className="space-y-3">
                            {lessons.map((lesson, index) => (
                                <div key={lesson._id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-300">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">{index + 1}</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                <span className={`material-symbols-outlined text-[16px] ${getLessonTypeMeta(lesson.lessonType).iconClass}`}>
                                                    {getLessonTypeMeta(lesson.lessonType).icon}
                                                </span>
                                                <span>{getLessonTypeMeta(lesson.lessonType).label}</span>
                                                {lesson.durationMinutes > 0 && <span>• {lesson.durationMinutes} phut</span>}
                                            </div>
                                            <p className="text-xs text-gray-500">{lesson.description}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {lesson.isLocked || !canStudy ? (
                                            <span className="flex items-center gap-1 text-xs italic text-gray-400"><i className="fas fa-lock" /> Da khoa</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => openLesson(lesson)}
                                                className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase text-white ${lessonActionClass(lesson)}`}
                                            >
                                                {lessonActionLabel(lesson)}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <section className="mt-20 border-t border-slate-200 pt-10 dark:border-slate-800">
                        <h2 className="mb-8 text-2xl font-bold">Danh gia tu hoc vien</h2>

                        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
                            <div className="col-span-1 flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                                <div className="mb-2 text-5xl font-black text-slate-900 dark:text-white">{averageRating.toFixed(1)}</div>
                                <div className="mb-2">{renderRatingStars(averageRating, 'text-xl')}</div>
                                <div className="text-sm font-medium text-slate-500">{reviewCount} danh gia</div>
                            </div>
                            <div className="col-span-1 space-y-3 md:col-span-3">
                                {ratingBreakdown.map(({ star, percentage }) => (
                                    <div key={star} className="flex items-center gap-4">
                                        <span className="w-12 text-sm font-medium">{star} sao</span>
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                            <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                                        </div>
                                        <span className="w-12 text-sm text-slate-500">{percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-12 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
                            <h3 className="mb-4 text-lg font-bold">Viet danh gia cua ban</h3>

                            {!canInteractWithReviewForm && (
                                <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm italic text-orange-700">
                                    {!isLogged
                                        ? 'Vui long dang nhap va so huu khoa hoc de gui danh gia.'
                                        : 'Ban can so huu khoa hoc de danh gia.'}
                                </div>
                            )}

                            <form onSubmit={submitReview} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Xep hang cua ban</label>
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
                                                    className={`${canInteractWithReviewForm ? 'hover:scale-110' : 'cursor-not-allowed opacity-70'} transition-transform duration-150`}
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
                                        {activeRating > 0 ? `Ban dang chon ${activeRating} sao - ${getRatingLabel(activeRating)}` : 'Chon tu 1 den 5 sao'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Loi nhan cua ban</label>
                                    <textarea
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
                                        rows="4"
                                        value={comment}
                                        onChange={(event) => setComment(event.target.value)}
                                        disabled={!canInteractWithReviewForm}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!canInteractWithReviewForm || !rating || !comment.trim() || submittingReview}
                                    className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
                                >
                                    {submittingReview ? 'Dang gui...' : 'Gui danh gia'}
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {reviewCount === 0 ? (
                                <p className="italic text-slate-500 md:col-span-2">Chua co danh gia nao cho khoa hoc nay.</p>
                            ) : (
                                visibleReviews.map((review) => {
                                    const reviewerName = review.userId?.name || 'Hoc vien';
                                    const reviewerInitials = getInitials(reviewerName);

                                    return (
                                        <div key={review._id} className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                                                    {review.userId?.avatar ? (
                                                        <img src={review.userId.avatar} alt={reviewerName} className="size-full object-cover" />
                                                    ) : (
                                                        reviewerInitials
                                                    )}
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{reviewerName}</h5>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex text-amber-500">{renderRatingStars(Number(review.rating || 0), 'text-sm')}</div>
                                                        <span className="text-[10px] font-medium text-slate-400">{formatRelativeReviewDate(review.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{review.comment}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {reviewCount > 4 && (
                            <button
                                type="button"
                                onClick={() => setShowAllReviews((prev) => !prev)}
                                className="mx-auto mt-10 block rounded-lg border border-primary px-6 py-2 text-sm font-bold text-primary hover:bg-primary/5"
                            >
                                {showAllReviews ? 'Thu gon danh gia' : 'Xem tat ca danh gia'}
                            </button>
                        )}
                    </section>
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
                                onClick={isPaidCourse ? handleAddToCartAndCheckout : handleEnrollment}
                                disabled={loading}
                                className="w-full rounded-2xl bg-blue-600 py-4 font-black text-white shadow-xl transition-all hover:bg-blue-700 active:scale-95"
                            >
                                {loading ? 'DANG XU LY...' : (isPaidCourse ? 'MUA NGAY' : 'DANG KY HOC NGAY')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailCourse;
