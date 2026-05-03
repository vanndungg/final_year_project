

import React from 'react';
import { useTranslation } from 'react-i18next';
import { getLessonTypeMeta, normalizeLessonType } from './lesson/LessonUtils';
// hien thi danh sach lesson va tien do hoc tap cua khoa hoc.
const LessonsSection = ({
    lessons,
    canStudy,
    completedLessonCount,
    progressPercent,
    openLesson,
    isLessonCompleted
}) => {
    const { t } = useTranslation();

    return (
        <div className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-6 flex items-center text-2xl font-bold">
                <i className="fas fa-play-circle mr-3 text-blue-600" />
                {t('detail.lessonSectionTitle', { count: lessons.length })}
            </h2>
            {canStudy && lessons.length > 0 && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <div className="mb-2 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{t('detail.lessonProgressTitle')}</p>
                            <p className="text-xs text-emerald-700/80 dark:text-emerald-200/80">{t('detail.completedLessonsCount', { completed: completedLessonCount, total: lessons.length })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{progressPercent}%</p>
                        </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
            )}
            <div className="space-y-3">
                {lessons.map((lesson, index) => {
                    const lessonType = normalizeLessonType(lesson.lessonType);
                    const meta = getLessonTypeMeta(lesson.lessonType);
                    const lessonTypeLabel = t(`detail.lessonType.${lessonType}`, { defaultValue: meta.label });
                    const isSubmissionLesson = lessonType === 'quiz' || lessonType === 'assignment';

                    return (
                        <div key={lesson._id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-300">
                            <div className="flex items-center gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">{index + 1}</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                        <span className={`material-symbols-outlined text-[16px] ${meta.iconClass}`}>
                                            {meta.icon}
                                        </span>
                                        <span>{lessonTypeLabel}</span>
                                        {lesson.durationMinutes > 0 && <span>• {lesson.durationMinutes} {t('detail.minutes')}</span>}
                                        {isLessonCompleted(lesson._id) && (
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 font-bold text-blue-700">
                                                {isSubmissionLesson ? t('detail.lessonStatus.submitted') : t('detail.lessonStatus.completed')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">{lesson.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {lesson.isLocked || !canStudy ? (
                                    <span className="flex items-center gap-1 text-xs italic text-gray-400"><i className="fas fa-lock" /> {t('detail.lessonLocked')}</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => openLesson(lesson)}
                                        className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold uppercase text-white hover:bg-blue-700 whitespace-nowrap"
                                    >
                                        {t('detail.startLesson')}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LessonsSection;