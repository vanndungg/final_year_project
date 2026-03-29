

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GlobalState } from '../../../../../app/providers/GlobalState';
import axiosClient from '../../../../../shared/api/axiosClient';
import AdminPanelLayout from '../../../pages/AdminPanelLayout';
import {
    createEmptyQuestion,
    formatSavedLabel,
    getDefaultLesson,
    LESSON_TYPE_OPTIONS,
    normalizeLessonType,
    toNumber
} from './lessonAdminUtils';
// hien thi form tao hoac sua lesson cho khoa hoc.
const CreateLesson = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const state = useContext(GlobalState);
    const [token = ''] = state?.token || [''];

    const [lesson, setLesson] = useState(getDefaultLesson(courseId || ''));
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);

    const onEdit = Boolean(lessonId);

    useEffect(() => {
        if (!onEdit) {
            setLesson(getDefaultLesson(courseId || ''));
            return;
        }

        let mounted = true;
        // tai du lieu lesson cu khi vao che do chinh sua.
        const fetchLesson = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/lessons/detail/${lessonId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                });

                if (!mounted) return;

                const data = response.data || {};
                const normalizedQuestions = Array.isArray(data.quizQuestions) && data.quizQuestions.length > 0
                    ? data.quizQuestions.map((item) => ({
                        question: String(item?.question || ''),
                        options: Array.isArray(item?.options) && item.options.length > 0 ? item.options : ['', ''],
                        correctOptionIndex: Math.max(0, Math.round(toNumber(item?.correctOptionIndex, 0)))
                    }))
                    : [createEmptyQuestion()];

                setLesson({
                    title: data.title || '',
                    description: data.description || '',
                    lessonType: normalizeLessonType(data.lessonType),
                    video_id: data.video_id || '',
                    videoUrl: data.videoUrl || '',
                    content: data.content || '',
                    resourceUrl: data.resourceUrl || '',
                    resourceName: data.resourceName || '',
                    durationMinutes: Math.max(0, Math.round(toNumber(data.durationMinutes, 0))),
                    quizQuestionCount: Math.max(1, Math.round(toNumber(data.quizQuestionCount || normalizedQuestions.length, 1))),
                    quizQuestions: normalizedQuestions,
                    publishStatus: String(data.publishStatus || 'draft').toLowerCase() === 'publish' ? 'publish' : 'draft',
                    assignmentMaxPoints: Math.max(0, Math.round(toNumber(data.assignmentMaxPoints, 100))),
                    assignmentDeadline: data.assignmentDeadline ? new Date(data.assignmentDeadline).toISOString().slice(0, 16) : '',
                    allowLateSubmission: Boolean(data.allowLateSubmission),
                    courseId: data.courseId || courseId || ''
                });
                setLastSavedAt(new Date());
            } catch (error) {
                toast.error(error.response?.data?.msg || 'Không thể tải dữ liệu lesson.');
                navigate(-1);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchLesson();

        return () => {
            mounted = false;
        };
    }, [courseId, lessonId, navigate, onEdit, token]);

    const completionPercent = useMemo(() => {
        const checks = [
            Boolean(lesson.title.trim()),
            Boolean(lesson.description.trim()),
            lesson.lessonType !== 'video' || Boolean(lesson.video_id.trim() || lesson.videoUrl.trim()),
            lesson.lessonType !== 'document' || Boolean(lesson.resourceUrl.trim()),
            lesson.lessonType !== 'quiz' || lesson.quizQuestions.some((q) => q.question.trim()),
            lesson.lessonType !== 'assignment' || Boolean(lesson.content.trim())
        ];
        return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }, [lesson]);
    // cap nhat mot field don le trong form lesson.
    const handleChange = (field, value) => {
        setLesson((prev) => ({ ...prev, [field]: value }));
    };
    // doi loai lesson va reset cac field lien quan.
    const handleLessonTypeChange = (value) => {
        const nextType = normalizeLessonType(value);
        setLesson((prev) => ({
            ...prev,
            lessonType: nextType,
            quizQuestions: nextType === 'quiz' ? (prev.quizQuestions.length > 0 ? prev.quizQuestions : [createEmptyQuestion()]) : prev.quizQuestions,
            quizQuestionCount: nextType === 'quiz' ? Math.max(1, prev.quizQuestions.length || 1) : 0,
            resourceUrl: nextType === 'document' ? prev.resourceUrl : '',
            resourceName: nextType === 'document' ? prev.resourceName : ''
        }));
    };
    // doc file pdf va luu du lieu vao form lesson.
    const handleDocumentUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Vui lòng chọn file PDF hợp lệ.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File PDF chỉ hỗ trợ tối đa 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setLesson((prev) => ({
                ...prev,
                resourceUrl: String(reader.result || ''),
                resourceName: file.name
            }));
        };
        reader.readAsDataURL(file);
    };
    // cap nhat noi dung cua mot cau hoi quiz.
    const updateQuestion = (qIndex, field, value) => {
        setLesson((prev) => ({
            ...prev,
            quizQuestions: prev.quizQuestions.map((question, index) => index === qIndex ? { ...question, [field]: value } : question)
        }));
    };
    // cap nhat mot dap an trong cau hoi quiz.
    const updateQuestionOption = (qIndex, optionIndex, value) => {
        setLesson((prev) => ({
            ...prev,
            quizQuestions: prev.quizQuestions.map((question, index) => {
                if (index !== qIndex) return question;
                const nextOptions = question.options.map((option, idx) => idx === optionIndex ? value : option);
                return { ...question, options: nextOptions };
            })
        }));
    };
    // them mot cau hoi moi vao quiz.
    const addQuestion = () => {
        setLesson((prev) => {
            const nextQuestions = [...prev.quizQuestions, createEmptyQuestion()];
            return {
                ...prev,
                quizQuestions: nextQuestions,
                quizQuestionCount: nextQuestions.length
            };
        });
    };
    // xoa mot cau hoi quiz khoi form.
    const removeQuestion = (qIndex) => {
        setLesson((prev) => {
            if (prev.quizQuestions.length <= 1) {
                toast.warn('Quiz cần tối thiểu 1 câu hỏi.');
                return prev;
            }

            const nextQuestions = prev.quizQuestions.filter((_, index) => index !== qIndex);
            return {
                ...prev,
                quizQuestions: nextQuestions,
                quizQuestionCount: nextQuestions.length
            };
        });
    };
    // them mot dap an moi cho cau hoi quiz.
    const addOption = (qIndex) => {
        setLesson((prev) => ({
            ...prev,
            quizQuestions: prev.quizQuestions.map((question, index) =>
                index !== qIndex ? question : { ...question, options: [...question.options, ''] }
            )
        }));
    };
    // xoa mot dap an khoi cau hoi quiz.
    const removeOption = (qIndex, optionIndex) => {
        setLesson((prev) => ({
            ...prev,
            quizQuestions: prev.quizQuestions.map((question, index) => {
                if (index !== qIndex) return question;
                if (question.options.length <= 2) {
                    toast.warn('Mỗi câu hỏi cần tối thiểu 2 đáp án.');
                    return question;
                }
                const nextOptions = question.options.filter((_, idx) => idx !== optionIndex);
                const nextCorrect = Math.min(Number(question.correctOptionIndex), nextOptions.length - 1);
                return { ...question, options: nextOptions, correctOptionIndex: nextCorrect };
            })
        }));
    };
    // kiem tra du lieu lesson truoc khi luu.
    const validateLesson = () => {
        if (!lesson.title.trim()) return 'Vui lòng nhập tiêu đề bài học.';
        if (!lesson.description.trim()) return 'Vui lòng nhập mô tả bài học.';
        if (!String(lesson.courseId || courseId || '').trim()) return 'Thiếu courseId của lesson.';

        if (lesson.lessonType === 'video' && !lesson.video_id.trim() && !lesson.videoUrl.trim()) {
            return 'Video lesson cần YouTube ID hoặc video URL.';
        }

        if (lesson.lessonType === 'document' && !lesson.resourceUrl.trim()) {
            return 'Document lesson cần file PDF.';
        }

        if (lesson.lessonType === 'quiz') {
            const validQuestions = lesson.quizQuestions
                .map((question) => ({
                    question: String(question.question || '').trim(),
                    options: Array.isArray(question.options) ? question.options.map((option) => String(option || '').trim()).filter(Boolean) : []
                }))
                .filter((question) => question.question && question.options.length >= 2);

            if (validQuestions.length === 0) {
                return 'Quiz cần ít nhất 1 câu hỏi với tối thiểu 2 đáp án.';
            }
        }

        if (lesson.lessonType === 'assignment' && !lesson.content.trim()) {
            return 'Assignment lesson cần câu hỏi/yêu cầu bài tập.';
        }

        return null;
    };
    // tao payload lesson theo trang thai can luu.
    const buildPayload = (targetStatus) => {
        const quizQuestions = lesson.lessonType === 'quiz'
            ? lesson.quizQuestions
                .map((question) => ({
                    question: String(question.question || '').trim(),
                    options: Array.isArray(question.options) ? question.options.map((option) => String(option || '').trim()).filter(Boolean) : [],
                    correctOptionIndex: Math.max(0, Math.round(toNumber(question.correctOptionIndex, 0)))
                }))
                .filter((question) => question.question && question.options.length >= 2)
            : [];

        return {
            title: lesson.title.trim(),
            description: lesson.description.trim(),
            lessonType: lesson.lessonType,
            video_id: String(lesson.video_id || '').trim(),
            videoUrl: String(lesson.videoUrl || '').trim(),
            videoUploadData: '',
            videoUploadName: '',
            content: lesson.lessonType === 'assignment' ? String(lesson.content || '').trim() : '',
            resourceUrl: lesson.lessonType === 'document' ? String(lesson.resourceUrl || '').trim() : '',
            resourceName: lesson.lessonType === 'document' ? String(lesson.resourceName || '').trim() : '',
            durationMinutes: Math.max(0, Math.round(toNumber(lesson.durationMinutes, 0))),
            quizQuestionCount: lesson.lessonType === 'quiz' ? quizQuestions.length : 0,
            quizQuestions,
            publishStatus: targetStatus,
            assignmentMaxPoints: lesson.lessonType === 'assignment' ? Math.max(0, Math.round(toNumber(lesson.assignmentMaxPoints, 100))) : 0,
            assignmentDeadline: lesson.lessonType === 'assignment' && lesson.assignmentDeadline
                ? new Date(lesson.assignmentDeadline).toISOString()
                : null,
            allowLateSubmission: lesson.lessonType === 'assignment' ? Boolean(lesson.allowLateSubmission) : false,
            courseId: String(lesson.courseId || courseId || '').trim()
        };
    };
    // gui request tao hoac cap nhat lesson.
    const submitLesson = async ({ targetStatus, redirectAfterSave }) => {
        if (saving) return;
        if (!token) {
            toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
            return;
        }

        const errorMessage = validateLesson();
        if (errorMessage) {
            toast.error(errorMessage);
            return;
        }

        setSaving(true);
        try {
            const payload = buildPayload(targetStatus);
            if (onEdit) {
                await axiosClient.put(`/lessons/${lessonId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axiosClient.post('/lessons', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setLastSavedAt(new Date());
            setLesson((prev) => ({ ...prev, publishStatus: targetStatus }));
            toast.success(targetStatus === 'publish' ? 'Lesson đã publish.' : 'Đã lưu draft lesson.');

            if (redirectAfterSave) {
                navigate(`/admin/lessons/${String(lesson.courseId || courseId || '').trim()}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Không thể lưu bài học.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminPanelLayout>
                <div className="min-h-screen p-10">
                    <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                        <p className="text-sm text-slate-500">Đang tải thông tin bài học...</p>
                    </div>
                </div>
            </AdminPanelLayout>
        );
    }

    return (
        <AdminPanelLayout>
            <div className="min-h-screen bg-background-light p-8 dark:bg-background-dark">
                <div className="mx-auto max-w-5xl space-y-6">
                    <header className="sticky top-0 z-20 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <div>
                                    <h1 className="text-xl font-black">{onEdit ? 'Edit Lesson' : 'Create Lesson'}</h1>
                                    <p className="text-xs text-slate-500">{formatSavedLabel(lastSavedAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => submitLesson({ targetStatus: 'draft', redirectAfterSave: false })}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Save Draft
                                </button>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => submitLesson({ targetStatus: 'publish', redirectAfterSave: true })}
                                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                    Publish Lesson
                                </button>
                            </div>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${completionPercent}%` }} />
                        </div>
                    </header>

                    <div className="space-y-6">
                        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="mb-4 text-lg font-bold">Lesson Essentials</h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-semibold">Title</label>
                                    <input
                                        value={lesson.title}
                                        onChange={(event) => handleChange('title', event.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold">Type</label>
                                    <select
                                        value={lesson.lessonType}
                                        onChange={(event) => handleLessonTypeChange(event.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                    >
                                        {LESSON_TYPE_OPTIONS.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={lesson.durationMinutes}
                                        onChange={(event) => handleChange('durationMinutes', event.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-semibold">Description</label>
                                    <textarea
                                        rows="3"
                                        value={lesson.description}
                                        onChange={(event) => handleChange('description', event.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                        </section>

                        {lesson.lessonType === 'video' && (
                            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                                <h2 className="mb-4 text-lg font-bold">Video Lesson</h2>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold">YouTube Video ID</label>
                                        <input
                                            value={lesson.video_id}
                                            onChange={(event) => handleChange('video_id', event.target.value)}
                                            placeholder="RGKi6LSPDLU"
                                            className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold">External URL</label>
                                        <input
                                            value={lesson.videoUrl}
                                            onChange={(event) => handleChange('videoUrl', event.target.value)}
                                            placeholder="https://..."
                                            className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {lesson.lessonType === 'document' && (
                            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                                <h2 className="mb-4 text-lg font-bold">Document Lesson</h2>

                                <input
                                    id="lesson-pdf-upload"
                                    type="file"
                                    accept="application/pdf"
                                    className="sr-only"
                                    onChange={handleDocumentUpload}
                                />

                                {lesson.resourceName ? (
                                    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-3xl text-emerald-600">picture_as_pdf</span>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{lesson.resourceName}</p>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400">PDF đã sẵn sàng để lưu</p>
                                            </div>
                                        </div>
                                        <label
                                            htmlFor="lesson-pdf-upload"
                                            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            Đổi file
                                        </label>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="lesson-pdf-upload"
                                        className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition-colors hover:border-primary/60 hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-primary/40"
                                    >
                                        <span className="material-symbols-outlined mb-3 block text-5xl text-slate-400">picture_as_pdf</span>
                                        <p className="mb-1 text-sm font-semibold">Nhấn để chọn file PDF</p>
                                        <p className="text-xs text-slate-500">Chỉ hỗ trợ PDF · Tối đa 10MB</p>
                                    </label>
                                )}
                            </section>
                        )}

                        {lesson.lessonType === 'quiz' && (
                            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <h2 className="text-lg font-bold">Quiz Builder</h2>
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                        {lesson.quizQuestions.length} câu hỏi
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    {lesson.quizQuestions.map((question, qIndex) => (
                                        <div key={`question-${qIndex + 1}`} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-sm font-bold">Câu {qIndex + 1}</p>
                                                <button type="button" onClick={() => removeQuestion(qIndex)} className="text-xs font-bold text-red-500 hover:text-red-700">Xóa câu hỏi</button>
                                            </div>
                                            <input
                                                value={question.question}
                                                onChange={(event) => updateQuestion(qIndex, 'question', event.target.value)}
                                                placeholder="Nhập nội dung câu hỏi..."
                                                className="mb-4 w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                            />
                                            <div className="space-y-2">
                                                {question.options.map((option, optionIndex) => (
                                                    <div key={`question-${qIndex + 1}-option-${optionIndex + 1}`} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${qIndex}`}
                                                            checked={Number(question.correctOptionIndex) === optionIndex}
                                                            onChange={() => updateQuestion(qIndex, 'correctOptionIndex', optionIndex)}
                                                            className="shrink-0"
                                                        />
                                                        <input
                                                            value={option}
                                                            onChange={(event) => updateQuestionOption(qIndex, optionIndex, event.target.value)}
                                                            placeholder={`Đáp án ${optionIndex + 1}`}
                                                            className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                                        />
                                                        {question.options.length > 2 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeOption(qIndex, optionIndex)}
                                                                className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                                                                title="Xóa đáp án"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addOption(qIndex)}
                                                className="mt-3 text-xs font-semibold text-primary hover:text-blue-700"
                                            >
                                                + Thêm đáp án
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-bold text-primary transition-colors hover:border-primary/70 hover:bg-primary/10"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    Thêm câu hỏi
                                </button>
                            </section>
                        )}

                        {lesson.lessonType === 'assignment' && (
                            <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                                <h2 className="mb-4 text-lg font-bold">Assignment Lesson</h2>
                                <label className="mb-1 block text-sm font-semibold">Question / Prompt</label>
                                <textarea
                                    rows="8"
                                    value={lesson.content}
                                    onChange={(event) => handleChange('content', event.target.value)}
                                    placeholder="Nhap duy nhat cau hoi giao cho hoc vien..."
                                    className="w-full rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                />
                            </section>
                        )}
                    </div>

                    <footer className="flex items-center justify-end gap-3 pb-8">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => submitLesson({ targetStatus: lesson.publishStatus || 'draft', redirectAfterSave: true })}
                            className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Save Lesson'}
                        </button>
                    </footer>
                </div>
            </div>
        </AdminPanelLayout>
    );
};

export default CreateLesson;