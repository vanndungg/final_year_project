// tra ve icon va nhan hien thi theo loai bai hoc.
export const getLessonTypeMeta = (lessonType) => {
    const normalizedType = String(lessonType || 'video').toLowerCase();

    if (normalizedType === 'document') return { icon: 'description', iconClass: 'text-orange-500', label: 'Tai lieu' };
    if (normalizedType === 'quiz') return { icon: 'quiz', iconClass: 'text-green-500', label: 'Quiz' };
    if (normalizedType === 'assignment') return { icon: 'assignment', iconClass: 'text-violet-500', label: 'Bai tap' };

    return { icon: 'play_circle', iconClass: 'text-blue-600', label: 'Video' };
};
// chuan hoa lesson type ve dang chu thuong de so sanh.
export const normalizeLessonType = (lessonType) => String(lessonType || 'video').trim().toLowerCase();
// tao youtube embed url tu videoUrl hoac video_id.
export const getYoutubeEmbedUrl = (lesson) => {
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