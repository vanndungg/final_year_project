export const initialCourseState = {
    title: '',
    category: 'Development',
    description: '',
    image: '',
    status: 'draft',
    pricingType: 'paid',
    price: 0,
    visibility: 'public',
    level: 'beginner',
    _id: ''
};

export const CATEGORY_OPTIONS = [
    'Design & Creative',
    'Development',
    'Marketing',
    'Business'
];

export const normalizeStatus = (statusValue) => {
    const normalizedStatus = String(statusValue || '').trim().toLowerCase();
    if (normalizedStatus === 'publish' || normalizedStatus === 'published') return 'publish';
    return 'draft';
};

export const normalizePricingType = (pricingTypeValue, priceValue) => {
    const normalizedType = String(pricingTypeValue || '').trim().toLowerCase();
    if (normalizedType === 'paid' || normalizedType === 'free') return normalizedType;
    return Number(priceValue || 0) > 0 ? 'paid' : 'free';
};

export const formatSavedTime = (dateValue) => {
    if (!dateValue) return 'No changes saved yet';

    return `Draft saved at ${dateValue.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    })}`;
};