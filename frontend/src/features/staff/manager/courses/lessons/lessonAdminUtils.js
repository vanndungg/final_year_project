

export const LESSON_TYPE_OPTIONS = [
    { value: 'video', label: 'Video Lesson' },
    { value: 'document', label: 'Document Lesson' },
    { value: 'quiz', label: 'Quiz Lesson' },
    { value: 'assignment', label: 'Assignment Lesson' }
];
// tao cau hoi quiz rong de khoi tao form.
export const createEmptyQuestion = () => ({
    question: '',
    options: ['', ''],
    correctOptionIndex: 0
});
// tao du lieu lesson mac dinh cho form tao moi.
export const getDefaultLesson = (courseId = '') => ({
    title: '',
    description: '',
    lessonType: 'video',
    video_id: '',
    videoUrl: '',
    content: '',
    resourceUrl: '',
    resourceName: '',
    durationMinutes: 0,
    quizQuestionCount: 1,
    quizQuestions: [createEmptyQuestion()],
    publishStatus: 'draft',
    assignmentMaxPoints: 100,
    assignmentDeadline: '',
    allowLateSubmission: false,
    courseId
});
// chuan hoa lesson type ve gia tri hop le.
export const normalizeLessonType = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return LESSON_TYPE_OPTIONS.some((item) => item.value === normalized) ? normalized : 'video';
};
// chuyen gia tri bat ky ve number an toan.
export const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
// dinh dang thoi gian luu gan nhat cua form lesson.
export const formatSavedLabel = (dateValue) => {
    if (!dateValue) return 'No changes saved yet';
    return `Last saved at ${dateValue.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};
// tra ve icon va nhan hien thi theo loai lesson.
export const getLessonTypeMeta = (lessonTypeValue) => {
    const normalizedType = String(lessonTypeValue || 'video').toLowerCase();

    if (normalizedType === 'document') {
        return { icon: 'description', label: 'Document', color: 'text-orange-500' };
    }

    if (normalizedType === 'quiz') {
        return { icon: 'quiz', label: 'Quiz', color: 'text-green-600' };
    }

    if (normalizedType === 'assignment') {
        return { icon: 'assignment', label: 'Assignment', color: 'text-violet-600' };
    }

    return { icon: 'play_circle', label: 'Video', color: 'text-blue-600' };
};
// chuan hoa publish status ve publish hoac draft.
export const normalizePublishStatus = (statusValue) => {
    const normalizedStatus = String(statusValue || '').trim().toLowerCase();
    if (normalizedStatus === 'publish' || normalizedStatus === 'published') return 'publish';
    return 'draft';
};