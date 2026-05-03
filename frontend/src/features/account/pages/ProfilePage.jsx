

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { GlobalState } from '../../../app/providers/GlobalState';
import axiosClient from '../../../shared/api/axiosClient';
import { formatPercent, getCourseImage } from '../profileUtils';
import useProfileProgress from '../useProfileProgress';
// hien thi thong tin ca nhan, avatar va tien do hoc tap cua user.
const Profile = () => {
    const state = useContext(GlobalState);
    const [token = ''] = state?.token || [''];
    const [isLogged = false] = state?.userAPI?.isLogged || [false];
    const [user = null, setUser = () => {}] = state?.userAPI?.user || [null, () => {}];
    const { t } = useTranslation();

    const [avatarPreview, setAvatarPreview] = useState('');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [savingAvatar, setSavingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    const enrolledCourses = useMemo(
        () => (Array.isArray(user?.enrolledCourses) ? user.enrolledCourses : []),
        [user?.enrolledCourses]
    );

    const { progressByCourse, loadingProgress } = useProfileProgress(enrolledCourses, token);

    useEffect(() => {
        setAvatarPreview(user?.avatar || '');
    }, [user?.avatar]);
    // cap nhat avatar cua user len backend.
    const updateAvatar = async (nextAvatar) => {
        if (!token) return;

        setSavingAvatar(true);
        try {
            const res = await axiosClient.patch('/users/update_avatar', { avatar: nextAvatar }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res?.data?.user) {
                setUser(res.data.user);
            } else {
                setUser((prev) => (prev ? { ...prev, avatar: nextAvatar } : prev));
            }

            toast.success(res?.data?.msg || t('profile.avatarUpdated'));
        } catch (error) {
            toast.error(error.response?.data?.msg || t('profile.avatarUpdateFailed'));
        } finally {
            setSavingAvatar(false);
        }
    };
    // mo hop chon file anh moi.
    const handleChooseAvatar = () => {
        fileInputRef.current?.click();
    };
    // doc file anh nguoi dung vua chon va gui len backend.
    const handleAvatarFileChange = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error(t('profile.invalidImageFile'));
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error(t('profile.avatarSizeLimit'));
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            if (!result) {
                toast.error(t('profile.avatarReadError'));
                return;
            }

            setAvatarPreview(result);
            await updateAvatar(result);
        };
        reader.onerror = () => {
            toast.error(t('profile.avatarReadError'));
        };
        reader.readAsDataURL(file);
    };

    if (!isLogged) {
        return <Navigate to="/login" replace />;
    }

    const totalEnrolled = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter((course) => {
        const progress = progressByCourse[String(course?._id || '')];
        return Number(progress?.progressPercent || 0) >= 100;
    }).length;
    const avgProgress = totalEnrolled > 0
        ? Math.round(
            enrolledCourses.reduce((sum, course) => {
                const progress = progressByCourse[String(course?._id || '')];
                return sum + Number(progress?.progressPercent || 0);
            }, 0) / totalEnrolled
        )
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <main className="mx-auto w-full max-w-7xl px-6 py-10">
                <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="flex items-center gap-5">
                            <button
                                type="button"
                                onClick={() => setIsAvatarModalOpen(true)}
                                className="group relative h-24 w-24 overflow-hidden rounded-2xl ring-4 ring-slate-100 transition hover:scale-[1.02] dark:ring-slate-800 md:h-28 md:w-28"
                            >
                                <img
                                    src={avatarPreview || user?.avatar || 'https://via.placeholder.com/160'}
                                    alt={user?.name || 'Student'}
                                    className="h-full w-full object-cover"
                                />
                                <span className="absolute inset-x-0 bottom-0 bg-slate-900/65 px-2 py-1 text-[11px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                                    {t('profile.viewAvatar')}
                                </span>
                            </button>
                            <div className="w-full max-w-xl">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{user?.name || t('profile.studentFallback')}</h1>
                                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{user?.email || t('profile.emailFallback')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('profile.enrolled')}</p>
                                <p className="text-2xl font-black text-blue-600">{totalEnrolled}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('profile.completed')}</p>
                                <p className="text-2xl font-black text-blue-600">{completedCourses}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('profile.averageProgress')}</p>
                                <p className="text-2xl font-black text-blue-600">{formatPercent(avgProgress)}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('profile.enrolledCoursesTitle')}</h2>
                        {loadingProgress && (
                            <span className="text-sm font-medium text-slate-500">{t('profile.loadingProgress')}</span>
                        )}
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                            <p className="text-slate-500 dark:text-slate-400">{t('profile.noCourses')}</p>
                            <Link
                                to="/courses"
                                className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                            >
                                {t('profile.exploreCourses')}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {enrolledCourses.map((course) => {
                                const courseId = String(course?._id || '');
                                const progress = progressByCourse[courseId] || {
                                    progressPercent: 0,
                                    completedCount: 0,
                                    totalLessons: 0
                                };

                                return (
                                    <article
                                        key={courseId}
                                        className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="relative h-44 overflow-hidden">
                                            <img
                                                src={getCourseImage(course) || 'https://via.placeholder.com/600x320'}
                                                alt={course?.title || 'Course'}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="flex flex-1 flex-col p-5">
                                            <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">{course?.title || t('profile.courseFallback')}</h3>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course?.teacher || t('profile.defaultTeacher')}</p>

                                            <div className="mt-5">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-xs font-bold uppercase text-slate-500">{t('profile.progress')}</span>
                                                    <span className="text-xs font-black text-blue-600">{formatPercent(progress.progressPercent)}</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                                                    <div
                                                        className="h-2 rounded-full bg-blue-600 transition-all"
                                                        style={{ width: `${Math.max(0, Math.min(100, progress.progressPercent))}%` }}
                                                    />
                                                </div>
                                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                    {t('profile.lessonsCompleted', { completed: progress.completedCount, total: progress.totalLessons })}
                                                </p>
                                            </div>

                                            <Link
                                                to={`/detail/${courseId}`}
                                                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                                            >
                                                {t('profile.continueLearning')}
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {isAvatarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4" onClick={() => setIsAvatarModalOpen(false)}>
                    <div
                        className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">{t('profile.avatarTitle')}</h3>
                            <button
                                type="button"
                                onClick={() => setIsAvatarModalOpen(false)}
                                className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                {t('profile.close')}
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                            <img
                                src={avatarPreview || user?.avatar || 'https://via.placeholder.com/700'}
                                alt={user?.name || 'Avatar'}
                                className="h-[58vh] w-full object-contain"
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarFileChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={handleChooseAvatar}
                                disabled={savingAvatar}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {savingAvatar ? t('profile.updating') : t('profile.changeAvatar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;