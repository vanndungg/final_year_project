

import React, { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalState } from '../../../../app/providers/GlobalState';
import axiosClient from '../../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
import AdminPanelLayout from '../../pages/AdminPanelLayout';
import {
    CATEGORY_OPTIONS,
    formatSavedTime,
    initialCourseState,
    normalizePricingType,
    normalizeStatus
} from './courseFormUtils';
// hien thi form tao hoac sua khoa hoc.
const CreateCourse = () => {
    const state = useContext(GlobalState);
    const [course, setCourse] = useState(initialCourseState);
    const [token = ''] = state?.token || [''];
    const [, setCallback] = state?.coursesAPI?.callback || [false, () => {}];
    const [saving, setSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();
    const param = useParams();

    const onEdit = Boolean(param.id);
    const pageTitle = onEdit ? 'Edit Course' : 'Add New Course';

    useEffect(() => {
        if (!onEdit) return;
        // tai du lieu khoa hoc cu khi vao che do chinh sua.
        const getCourseDetail = async () => {
            try {
                const res = await axiosClient.get(`/courses/${param.id}`);
                const foundCourse = res.data;
                const imageSource = foundCourse.image?.url || foundCourse.image || '';
                const parsedPricingType = normalizePricingType(foundCourse.pricingType, foundCourse.price);

                setCourse({
                    title: foundCourse.title,
                    category: foundCourse.category || 'Development',
                    description: foundCourse.description,
                    image: imageSource,
                    status: normalizeStatus(foundCourse.status),
                    pricingType: parsedPricingType,
                    price: parsedPricingType === 'free' ? 0 : Number(foundCourse.price || 0),
                    visibility: foundCourse.visibility || 'public',
                    level: foundCourse.level || 'beginner',
                    _id: foundCourse._id
                });
                setLastSavedAt(new Date());
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Khong tai duoc du lieu khoa hoc');
                navigate('/admin/courses');
            }
        };

        getCourseDetail();
    }, [onEdit, param.id, navigate]);

    const handleChangeInput = e => {
        const { name, value } = e.target;
        setCourse((prevCourse) => ({ ...prevCourse, [name]: value }));
    };
    // doi pricing type va dong bo lai gia tri gia tien.
    const handlePricingTypeChange = (pricingTypeValue) => {
        setCourse((prevCourse) => ({
            ...prevCourse,
            pricingType: pricingTypeValue,
            price: pricingTypeValue === 'free' ? 0 : Number(prevCourse.price || 0)
        }));
    };
    // doc file anh va luu duoi dang base64 de preview/gui len backend.
    const handleImageUpload = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error('Kích thước ảnh vượt quá 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setCourse((prevCourse) => ({
                ...prevCourse,
                image: String(reader.result || '')
            }));
        };

        reader.readAsDataURL(selectedFile);
    };
    // kiem tra du lieu khoa hoc truoc khi luu.
    const validateForm = () => {
        if (!String(course.title || '').trim()) return 'Vui lòng nhập tên khóa học.';
        if (!String(course.category || '').trim()) return 'Vui lòng chọn category.';
        if (!String(course.description || '').trim()) return 'Vui lòng nhập mô tả khóa học.';
        if (!String(course.image || '').trim()) return 'Vui lòng cung cấp ảnh đại diện khóa học.';

        if (course.pricingType === 'paid' && Number(course.price || 0) <= 0) {
            return 'Khóa học trả phí cần giá lớn hơn 0 VND.';
        }

        return null;
    };
    // tao payload khoa hoc theo trang thai can luu.
    const buildPayload = (targetStatus) => {
        return {
            title: String(course.title || '').trim(),
            category: String(course.category || '').trim(),
            description: String(course.description || '').trim(),
            image: String(course.image || '').trim(),
            status: targetStatus,
            pricingType: course.pricingType,
            price: course.pricingType === 'free' ? 0 : Math.round(Number(course.price || 0)),
            visibility: course.visibility,
            level: course.level
        };
    };
    // gui request tao hoac cap nhat khoa hoc.
    const submitCourse = async ({ targetStatus, redirectAfterSave }) => {
        if (saving) return;

        if (!token) {
            toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
            return;
        }

        const formError = validateForm();
        if (formError) {
            toast.error(formError);
            return;
        }

        setSaving(true);

        try {
            const payload = buildPayload(targetStatus);

            if (onEdit) {
                await axiosClient.put(`/courses/${course._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                const response = await axiosClient.post('/courses', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response?.data?.course?._id) {
                    const createdCourseId = response.data.course._id;
                    setCourse((prevCourse) => ({
                        ...prevCourse,
                        _id: createdCourseId
                    }));

                    if (!redirectAfterSave) {
                        navigate(`/admin/edit_course/${createdCourseId}`, { replace: true });
                    }
                }
            }

            setCallback((prevCallback) => !prevCallback);
            setLastSavedAt(new Date());
            setCourse((prevCourse) => ({ ...prevCourse, status: targetStatus }));

            toast.success(targetStatus === 'publish'
                ? 'Khóa học đã được publish thành công!'
                : 'Đã lưu draft thành công!');

            if (redirectAfterSave) {
                navigate('/admin/courses');
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Có lỗi xảy ra khi lưu khóa học.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminPanelLayout>
            <div className="flex min-h-screen flex-col">
                <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/courses')}
                                className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                                aria-label="Quay lại"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <div>
                                <h2 className="text-xl font-bold">{pageTitle}</h2>
                                <p className="mt-1 text-xs text-slate-500">{formatSavedTime(lastSavedAt)}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="mx-auto w-full max-w-5xl space-y-8 p-8">
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 border-b border-slate-100 p-6 dark:border-slate-800">
                            <span className="material-symbols-outlined text-primary">info</span>
                            <h3 className="text-lg font-bold">1. Basic Information</h3>
                        </div>

                        <div className="space-y-6 p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Course Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={course.title}
                                        onChange={handleChangeInput}
                                        className="w-full rounded-lg border border-slate-300 bg-white focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
                                        placeholder="e.g. Advanced UI/UX Principles"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        name="category"
                                        value={course.category}
                                        onChange={handleChangeInput}
                                        className="w-full rounded-lg border border-slate-300 bg-white focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
                                    >
                                        {CATEGORY_OPTIONS.map((categoryOption) => (
                                            <option key={categoryOption} value={categoryOption}>{categoryOption}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    rows="4"
                                    name="description"
                                    value={course.description}
                                    onChange={handleChangeInput}
                                    className="w-full rounded-lg border border-slate-300 bg-white focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
                                    placeholder="Briefly describe what students will learn..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Course Thumbnail</label>
                                <div
                                    className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:border-primary/50 dark:border-slate-700 dark:bg-slate-950"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <span className="material-symbols-outlined mb-2 text-4xl text-slate-400">image</span>
                                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                        <p className="mt-1 text-xs text-slate-500">PNG, JPG, or GIF (max. 5MB)</p>
                                    </div>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />

                                {course.image && (
                                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                                        <img src={course.image} alt="Course thumbnail preview" className="h-48 w-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 border-b border-slate-100 p-6 dark:border-slate-800">
                            <span className="material-symbols-outlined text-primary">payments</span>
                            <h3 className="text-lg font-bold">2. Course Pricing</h3>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 flex gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="pricingType"
                                        value="paid"
                                        checked={course.pricingType === 'paid'}
                                        onChange={() => handlePricingTypeChange('paid')}
                                        className="peer hidden"
                                    />
                                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:border-slate-800 dark:peer-checked:bg-blue-950/30">
                                        <span className="material-symbols-outlined text-slate-400 peer-checked:text-blue-600">sell</span>
                                        <div>
                                            <p className="text-sm font-bold">Paid Course</p>
                                            <p className="text-xs text-slate-500">Set a one-time purchase price (VND)</p>
                                        </div>
                                    </div>
                                </label>

                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="pricingType"
                                        value="free"
                                        checked={course.pricingType === 'free'}
                                        onChange={() => handlePricingTypeChange('free')}
                                        className="peer hidden"
                                    />
                                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:border-slate-800 dark:peer-checked:bg-blue-950/30">
                                        <span className="material-symbols-outlined text-slate-400 peer-checked:text-blue-600">volunteer_activism</span>
                                        <div>
                                            <p className="text-sm font-bold">Free Course</p>
                                            <p className="text-xs text-slate-500">Available to all students</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {course.pricingType === 'paid' && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Course Price</label>
                                        </div>
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                            VND
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">payments</span>
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            name="price"
                                            value={course.price}
                                            onChange={handleChangeInput}
                                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-20 text-base font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                            placeholder="490000"
                                        />
                                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                            VND
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-4 pb-12">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/courses')}
                            className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                        >
                            Cancel Changes
                        </button>

                        {onEdit && (
                            <button
                                type="button"
                                onClick={() => submitCourse({ targetStatus: 'draft', redirectAfterSave: false })}
                                disabled={saving}
                                className="rounded-xl bg-slate-100 px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200"
                            >
                                Save Draft
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => submitCourse({ targetStatus: 'publish', redirectAfterSave: true })}
                            disabled={saving}
                            className="rounded-xl bg-emerald-600 px-10 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Finalize & Publish'}
                        </button>
                    </div>
                </div>
            </div>
        </AdminPanelLayout>
    );
};

export default CreateCourse;