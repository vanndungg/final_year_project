export const formatPercent = (value) => `${Math.max(0, Math.min(100, Number(value || 0)))}%`;

export const getCourseImage = (course) => {
    const image = course?.image;
    if (typeof image === 'string') return image;
    if (image && typeof image === 'object') return image.url || image.secure_url || '';
    return '';
};