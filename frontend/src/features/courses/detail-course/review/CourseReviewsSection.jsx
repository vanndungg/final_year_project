

import React from 'react';
import {
    filledStarStyle,
    formatRelativeReviewDate,
    getInitials,
    getRatingLabel,
    outlineStarStyle,
    renderRatingStars
} from './ReviewUtils.jsx';
// hien thi tong quan danh gia, form review va danh sach nhan xet cua khoa hoc.
const CourseReviewsSection = ({
    averageRating,
    reviewCount,
    ratingBreakdown,
    canInteractWithReviewForm,
    isLogged,
    activeRating,
    rating,
    setRating,
    setHoverRating,
    comment,
    setComment,
    submitReview,
    submittingReview,
    visibleReviews,
    showAllReviews,
    setShowAllReviews
}) => {
    return (
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
    );
};

export default CourseReviewsSection;