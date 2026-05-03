

import React from 'react';

export const filledStarStyle = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" };
export const outlineStarStyle = { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" };
// tra ve nhan mo ta theo so sao danh gia.
export const getRatingLabel = (value) => {
    switch (value) {
        case 1: return 'Rat te';
        case 2: return 'Chua tot';
        case 3: return 'On';
        case 4: return 'Tot';
        case 5: return 'Xuat sac';
        default: return 'Chon so sao phu hop';
    }
};
// render 5 ngoi sao theo diem danh gia hien tai.
export const renderRatingStars = (value, sizeClass = 'text-sm') => (
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
// tao chu cai dai dien tu ten nguoi danh gia.
export const getInitials = (name) => {
    if (!name) return 'HV';
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
};

// doi thoi gian review thanh chuoi tuong doi de hien thi.
export const formatRelativeReviewDate = (value, locale = 'en') => {
    if (!value) return locale.startsWith('vi') ? 'Vừa xong' : 'Just now';

    const diffMs = Date.now() - new Date(value).getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute');
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return rtf.format(-diffDays, 'day');

    return rtf.format(-Math.floor(diffDays / 7), 'week');
};