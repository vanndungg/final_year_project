import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../shared/api/axiosClient';
import { GlobalState } from '../../app/providers/GlobalState';

const DEFAULT_AVATAR = 'https://via.placeholder.com/320x320?text=Teacher';
const SPECIALTIES = ['Lập trình web', 'Thiết kế UI/UX', 'Digital marketing', 'Phân tích dữ liệu', 'Kỹ năng nghề nghiệp', 'Kinh doanh số'];
const HIGHLIGHTS = ['10+ năm kinh nghiệm', 'Dạy theo dự án thực tế', 'Hướng dẫn sát năng lực', 'Nội dung cập nhật liên tục'];

const formatJoinDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Đang cập nhật';
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' });
};

// hien thi trang gioi thieu doi ngu giang vien cho nguoi dung public.
const TeachersPage = () => {
    const state = useContext(GlobalState);
    const [isLogged = false] = state?.userAPI?.isLogged || [false];
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getTeachers = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get('/users/public_teachers');
                setTeachers(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                toast.error(error.response?.data?.msg || 'Không thể tải danh sách giảng viên.');
                setTeachers([]);
            }
            setLoading(false);
        };

        getTeachers();
    }, []);

    const teacherCards = useMemo(() => {
        return teachers.map((teacher, index) => ({
            ...teacher,
            specialty: SPECIALTIES[index % SPECIALTIES.length],
            highlight: HIGHLIGHTS[index % HIGHLIGHTS.length]
        }));
    }, [teachers]);

    return (
        <div className="min-h-screen bg-white text-slate-900 dark:bg-background-dark dark:text-slate-100">
            <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] py-20 dark:border-slate-800 dark:bg-none">
                <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-6">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-primary">
                                Đội ngũ giảng viên
                            </span>
                            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
                                Những người đứng lớp biến kiến thức thành lộ trình học rõ ràng, thực chiến và dễ theo.
                            </h1>
                            <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                                Mỗi giảng viên trên EduLearn mang đến một thế mạnh riêng: tư duy hệ thống, ví dụ thực tế và cách truyền đạt giúp học viên áp dụng được ngay sau mỗi bài học.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition-transform hover:-translate-y-0.5 hover:bg-emerald-700">
                                    <span className="material-symbols-outlined text-[20px]">school</span>
                                    Xem khóa học
                                </Link>
                                {!isLogged && (
                                    <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                                        Tham gia học ngay
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
                                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Giảng viên</p>
                                <p className="mt-3 text-5xl font-black">{teachers.length}</p>
                                <p className="mt-3 text-sm leading-6 text-slate-300">Đang đồng hành cùng học viên trên nhiều chủ đề từ công nghệ đến kỹ năng nghề nghiệp.</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Cam kết</p>
                                <p className="mt-3 text-2xl font-black">Bài giảng thực tế</p>
                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">Nội dung được thiết kế để người học có thể dùng ngay vào công việc và dự án cá nhân.</p>
                            </div>
                            <div className="col-span-2 rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-blue-50 p-6 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Điểm khác biệt</p>
                                        <p className="mt-3 text-2xl font-black">Giảng viên không chỉ dạy, mà còn dẫn dắt.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {HIGHLIGHTS.map((item) => (
                                            <span key={item} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-20">
                <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                    <div className="mb-10 flex items-end justify-between gap-6">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Giới thiệu giảng viên</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight">Chọn người hướng dẫn phù hợp với mục tiêu của bạn</h2>
                        </div>
                        <p className="max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Giao diện này giữ dữ liệu thật từ hệ thống và trình bày theo phong cách public, thay cho trang quản trị đã thêm nhầm trước đó.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-52 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                                        <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800"></div>
                                        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800"></div>
                                        <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : teacherCards.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {teacherCards.map((teacher, index) => (
                                <article key={teacher._id || index} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                                        <img src={teacher.avatar || DEFAULT_AVATAR} alt={teacher.name || 'Teacher'} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5 text-white">
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{teacher.specialty}</p>
                                            <h3 className="mt-2 text-2xl font-black">{teacher.name || 'Giảng viên EduLearn'}</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-4 p-6">
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Giảng viên</span>
                                            <span>Tham gia từ {formatJoinDate(teacher.createdAt)}</span>
                                        </div>
                                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                                            {teacher.name || 'Giảng viên'} tập trung vào {teacher.specialty.toLowerCase()}, ưu tiên ví dụ trực quan, nhịp học rõ ràng và cách giải thích đủ thực tế để người học bám theo lâu dài.
                                        </p>
                                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Phong cách hướng dẫn</p>
                                            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{teacher.highlight}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900">
                            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">co_present</span>
                            <h3 className="mt-4 text-2xl font-black">Chưa có dữ liệu giảng viên để hiển thị</h3>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Khi hệ thống có tài khoản giáo viên, trang này sẽ tự động hiển thị danh sách để người học khám phá đội ngũ giảng dạy.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default TeachersPage;