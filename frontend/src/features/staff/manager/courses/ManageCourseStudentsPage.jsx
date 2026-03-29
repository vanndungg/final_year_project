

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../../../shared/api/axiosClient';
import { GlobalState } from '../../../../app/providers/GlobalState';
import AdminPanelLayout from '../../pages/AdminPanelLayout';
// dinh dang thoi gian cap nhat de hien thi trong bang.
const formatDateTime = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleString();
};
// hien thi tien do hoc tap cua hoc vien trong mot khoa hoc.
const ManageCourseStudents = () => {
    const { courseId } = useParams();
    const state = useContext(GlobalState);
    const [token = ''] = state?.token || [''];

    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let active = true;
    // tai thong tin khoa hoc va danh sach tien do cua hoc vien.
        const fetchStudentProgress = async () => {
            if (!token || !courseId) return;
            setLoading(true);
            try {
                const res = await axiosClient.get(`/courses/${courseId}/students-progress`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!active) return;
                setCourse(res?.data?.course || null);
                setStudents(Array.isArray(res?.data?.students) ? res.data.students : []);
            } catch (error) {
                toast.error(error.response?.data?.msg || 'Khong the tai danh sach hoc vien cua khoa hoc.');
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchStudentProgress();

        return () => {
            active = false;
        };
    }, [courseId, token]);

    const filteredStudents = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        if (!normalized) return students;

        return students.filter((student) => {
            const name = String(student?.name || '').toLowerCase();
            const email = String(student?.email || '').toLowerCase();
            return name.includes(normalized) || email.includes(normalized);
        });
    }, [searchTerm, students]);

    const averageProgress = students.length > 0
        ? Math.round(students.reduce((sum, student) => sum + Number(student?.progressPercent || 0), 0) / students.length)
        : 0;

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-blue-600">Course Insights</p>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {course?.title || 'Chi tiet tien do hoc vien'}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Theo doi tien do cua tung hoc vien trong khoa hoc nay.
                        </p>
                    </div>
                    <Link
                        to="/admin/courses"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Quay lai danh sach khoa hoc
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tong hoc vien</p>
                        <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{students.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tien do trung binh</p>
                        <p className="mt-2 text-2xl font-black text-blue-600">{averageProgress}%</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Da hoan thanh khoa hoc</p>
                        <p className="mt-2 text-2xl font-black text-emerald-600">
                            {students.filter((student) => Number(student?.progressPercent || 0) >= 100).length}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Tim theo ten hoac email hoc vien..."
                            className="w-full rounded-lg bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none ring-primary/20 transition focus:ring-2 dark:bg-slate-800"
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hoc vien</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Tien do</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hoan thanh</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Cap nhat gan nhat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">
                                            Dang tai du lieu...
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-500">
                                            Khong co hoc vien nao phu hop.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => {
                                        const progress = Math.max(0, Math.min(100, Number(student?.progressPercent || 0)));
                                        return (
                                            <tr key={student._id} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={student?.avatar || 'https://via.placeholder.com/40'}
                                                            alt={student?.name || 'Hoc vien'}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{student?.name || 'Hoc vien'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{student?.email || '--'}</td>
                                                <td className="px-5 py-4">
                                                    <div className="w-44">
                                                        <p className="mb-1 text-xs font-bold text-blue-600">{progress}%</p>
                                                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                                                            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {Number(student?.completedCount || 0)}/{Number(student?.totalLessons || 0)} bai hoc
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDateTime(student?.lastProgressAt)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminPanelLayout>
    );
};

export default ManageCourseStudents;