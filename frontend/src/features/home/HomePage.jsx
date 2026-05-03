

import React, { useContext, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { GlobalState } from '../../app/providers/GlobalState';
import { getStudentCount } from '../../shared/utils/courseDataUtils';

const formatPrice = (value) => {
    const numericValue = Number(value || 0);
    if (numericValue <= 0) return 'Free';
    return `${numericValue.toLocaleString('vi-VN')}đ`;
};

const renderStars = (ratingValue) => {
    const normalizedRating = Math.max(0, Math.min(5, Number(ratingValue || 0)));

    return Array.from({ length: 5 }).map((_, index) => (
        <span
            key={index}
            className={`material-symbols-outlined text-[16px] ${index < Math.round(normalizedRating) ? 'fill text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
        >
            star
        </span>
    ));
};

// hien thi trang chu va xu ly thong bao sau khi thanh toan.
const Home = () => {
    const { t, i18n } = useTranslation();
    const state = useContext(GlobalState);
    const location = useLocation();
    const navigate = useNavigate();
    const [courses = []] = state?.coursesAPI?.courses || [[]];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const gatewayResult = String(params.get('gatewayResult') || '').toLowerCase();

        if (!gatewayResult) return;

        if (gatewayResult === 'success') {
            toast.success(t('payment.paymentSuccessful'));
        } else if (gatewayResult === 'cancel') {
            toast.warn('You have cancelled the payment on VNPAY.');
        } else {
            toast.error(t('errors.serverError'));
        }

        const cleaned = new URLSearchParams(location.search);
        cleaned.delete('gatewayResult');
        cleaned.delete('paymentId');
        const next = cleaned.toString();
        navigate(next ? `/?${next}` : '/', { replace: true });
    }, [location.search, navigate]);

    const publishedCourses = useMemo(() => {
        return (Array.isArray(courses) ? courses : []).filter((course) => {
            const status = String(course?.status || 'publish').toLowerCase();
            return status !== 'draft';
        });
    }, [courses]);

    const popularCourses = useMemo(() => {
        return [...publishedCourses]
            .sort((leftCourse, rightCourse) => {
                const leftScore = (Number(leftCourse?.avgRating || 0) * 1000) + (Number(leftCourse?.totalReviews || 0) * 10) + getStudentCount(leftCourse);
                const rightScore = (Number(rightCourse?.avgRating || 0) * 1000) + (Number(rightCourse?.totalReviews || 0) * 10) + getStudentCount(rightCourse);
                return rightScore - leftScore;
            })
            .slice(0, 4);
    }, [publishedCourses]);

    const homeStats = useMemo(() => {
        const freeCourses = publishedCourses.filter((course) => Number(course?.price || 0) === 0).length;
        const totalStudents = publishedCourses.reduce((sum, course) => sum + getStudentCount(course), 0);

        return {
            totalCourses: publishedCourses.length,
            freeCourses,
            totalStudents
        };
    }, [publishedCourses]);

    const scrollToPopularCourses = () => {
        document.getElementById('home-popular-courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <main className="flex-1">
                <section className="relative overflow-hidden bg-white dark:bg-background-dark py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="flex flex-col gap-8">
                                <div className="space-y-4">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{t('home.badge')}</span>
                                    <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl">
                                        {t('home.title')}
                                    </h2>
                                    <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
                                        {t('home.subtitle')}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Link to="/courses" className="rounded-lg bg-emerald-600 px-8 py-4 text-center font-bold text-white transition-transform hover:scale-105 hover:bg-emerald-700">
                                        {t('home.exploreButton')}
                                    </Link>
                                    <button onClick={scrollToPopularCourses} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-8 py-4 font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined">play_circle</span>
                                        {t('home.viewFeatured')}
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
                                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                                    <img alt="Student learning online" className="h-full w-full object-cover" data-alt="Sinh viên đang học tập trực tuyến vui vẻ" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCi9wCCv4MmLG3VCsmpjFVPvarhzlrVwV_t7zzS3PNYqAStJSOlynO6bm3UJ9iXChCwZG9SFlEN2pXPIha-UGJFlIb6K7krE6rDKSwNM4lFEa1KKQEk_Ij8SifAQJUmit2Ak2SGaQtU2dYZVoBJSxOpVAm2FfCXhE7O2vB2M2o7bjd41KQIybtcK9-KA7faJ3YwThBKW4g9qIiuk-NGq0RVZ-iDMsDfb2srtY4L2ZKWJKMhbcne8AvW4QMCZJUymC0vnqJCD7DZbQ13"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="home-popular-courses" className="py-16">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-bold tracking-tight">{t('home.popularCourses')}</h3>
                            <Link to="/courses" className="text-sm font-bold text-primary hover:underline">{t('home.viewAll')}</Link>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {popularCourses.length > 0 ? popularCourses.map((course, index) => (
                                <Link key={course._id} to={`/detail/${course._id}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-background-dark">
                                    <div className="relative aspect-video overflow-hidden">
                                        <img alt={course.title || 'Course'} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" src={course.image?.url || course.image} />
                                        <span className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-bold dark:bg-background-dark/90">Top {index + 1}</span>
                                    </div>
                                    <div className="flex flex-1 flex-col p-4">
                                        <span className="text-xs font-semibold text-primary uppercase">{course.category || 'General'}</span>
                                        <h4 className="mt-2 font-bold line-clamp-2 text-slate-900 dark:text-white">{course.title}</h4>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.teacher || 'EduLearn Team'}</p>
                                        <div className="mt-2 flex items-center gap-1">
                                            <span className="text-sm font-bold text-amber-500">{Number(course.avgRating || 0).toFixed(1)}</span>
                                            <div className="flex text-amber-500">
                                                {renderStars(course.avgRating)}
                                            </div>
                                            <span className="text-xs text-slate-500">({Number(course.totalReviews || 0)})</span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">group</span>
                                                {getStudentCount(course).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} {t('home.students')}
                                            </span>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between pt-5">
                                            <span className="text-lg font-black text-primary">{formatPrice(course.price)}</span>
                                            <span className="text-sm font-semibold text-emerald-600">{t('home.viewDetails')}</span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-full rounded-xl border border-dashed border-slate-300 px-6 py-16 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                    {t('courses.noResults')}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                            <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl shadow-slate-900/10">
                                <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-300">{t('home.whyEduLearn')}</p>
                                <h3 className="mt-4 text-3xl font-black leading-tight">{t('home.featureTitle')}</h3>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
                                    {t('home.featureDescription')}
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-emerald-700 transition-colors hover:bg-emerald-50">
                                        <span className="material-symbols-outlined text-[20px]">menu_book</span>
                                        {t('courses.title')}
                                    </Link>
                                    <Link to="/teachers" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-bold text-white transition-colors hover:bg-white/10">
                                        <span className="material-symbols-outlined text-[20px]">co_present</span>
                                        {t('home.instructors')}
                                    </Link>
                                </div>
                            </div>

                            <div className="grid self-start gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-background-dark">
                                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{t('home.publicCoursesTitle')}</p>
                                    <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white">{homeStats.totalCourses}</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('home.publicCoursesDescription')}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-background-dark">
                                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{t('home.freeCoursesTitle')}</p>
                                    <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white">{homeStats.freeCourses}</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('home.freeCoursesDescription')}</p>
                                </div>
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-background-dark">
                                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{t('home.studentProgressTitle')}</p>
                                    <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white">{homeStats.totalStudents.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{t('home.studentProgressDescription')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default Home;