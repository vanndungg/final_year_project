

import React from 'react';
import { getYoutubeEmbedUrl, normalizeLessonType } from './LessonUtils';
import VideoLessonContent from './video/VideoContent';
import DocumentLessonContent from './document/DocumentContent';
import QuizLessonContent from './quiz/QuizContent';
import AssignmentLessonContent from './assignment/AssignmentContent';
// hien thi modal bai hoc va noi dung tuong ung theo lesson type.
const LessonModal = ({
    activeLesson,
    pdfBlobUrl,
    quizAnswers,
    setQuizAnswers,
    quizResult,
    assignmentAnswer,
    setAssignmentAnswer,
    submittingAssignment,
    onClose,
    onPrimaryAction,
    isLessonCompleted,
    getLessonPrimaryActionLabel,
    getAssignmentSubmission
}) => {
    if (!activeLesson) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-black">{activeLesson.title}</h3>
                        <p className="text-sm text-slate-500">{activeLesson.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                            {(() => {
                                const activeType = normalizeLessonType(activeLesson.lessonType);
                                const isSubmissionLesson = activeType === 'quiz' || activeType === 'assignment';

                                if (isSubmissionLesson && isLessonCompleted(activeLesson._id)) {
                                    return (
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            Da nop bai
                                        </span>
                                    );
                                }

                                if (!isSubmissionLesson && isLessonCompleted(activeLesson._id)) {
                                    return (
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            Da hoan thanh
                                        </span>
                                    );
                                }

                                return null;
                            })()}
                            {normalizeLessonType(activeLesson.lessonType) === 'assignment' && getAssignmentSubmission(activeLesson._id) && (
                                <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                                    Da nop bai
                                </span>
                            )}
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {normalizeLessonType(activeLesson.lessonType) === 'video' && (
                    <VideoLessonContent activeLesson={activeLesson} getYoutubeEmbedUrl={getYoutubeEmbedUrl} />
                )}

                {normalizeLessonType(activeLesson.lessonType) === 'document' && (
                    <DocumentLessonContent activeLesson={activeLesson} pdfBlobUrl={pdfBlobUrl} />
                )}

                {normalizeLessonType(activeLesson.lessonType) === 'quiz' && (
                    <QuizLessonContent
                        activeLesson={activeLesson}
                        quizAnswers={quizAnswers}
                        setQuizAnswers={setQuizAnswers}
                        quizResult={quizResult}
                    />
                )}

                {normalizeLessonType(activeLesson.lessonType) === 'assignment' && (
                    <AssignmentLessonContent
                        activeLesson={activeLesson}
                        assignmentAnswer={assignmentAnswer}
                        setAssignmentAnswer={setAssignmentAnswer}
                    />
                )}

                <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={onPrimaryAction}
                        disabled={submittingAssignment}
                        className={`w-full rounded-lg px-4 py-3 text-sm font-bold text-white transition ${isLessonCompleted(activeLesson._id) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'} disabled:opacity-60`}
                    >
                        {submittingAssignment ? 'Dang xu ly...' : getLessonPrimaryActionLabel()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonModal;