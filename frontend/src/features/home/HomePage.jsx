

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// hien thi trang chu va xu ly thong bao sau khi thanh toan.
const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const gatewayResult = String(params.get('gatewayResult') || '').toLowerCase();

        if (!gatewayResult) return;

        if (gatewayResult === 'success') {
            toast.success('Thanh toán thành công. Bạn đã sở hữu khóa học và có thể bắt đầu học ngay.');
        } else if (gatewayResult === 'cancel') {
            toast.warn('Bạn đã hủy thanh toán trên VNPAY.');
        } else {
            toast.error('Thanh toán chưa thành công. Vui lòng thử lại.');
        }

        const cleaned = new URLSearchParams(location.search);
        cleaned.delete('gatewayResult');
        cleaned.delete('paymentId');
        const next = cleaned.toString();
        navigate(next ? `/?${next}` : '/', { replace: true });
    }, [location.search, navigate]);

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <main className="flex-1">
                <section className="relative overflow-hidden bg-white dark:bg-background-dark py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="flex flex-col gap-8">
                                <div className="space-y-4">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">Nền tảng học tập số 1</span>
                                    <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl">
                                        Học kỹ năng mới trực tuyến cùng các <span className="text-primary">chuyên gia</span> hàng đầu
                                    </h2>
                                    <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
                                        Khám phá hàng ngàn khóa học chất lượng cao giúp bạn nâng tầm sự nghiệp và phát triển bản thân mỗi ngày với chi phí tối ưu nhất.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <a href="/courses" className="rounded-lg bg-emerald-600 px-8 py-4 text-center font-bold text-white transition-transform hover:scale-105 hover:bg-emerald-700">
                                        Bắt đầu ngay
                                    </a>
                                    <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-8 py-4 font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined">play_circle</span>
                                        Xem hướng dẫn
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
                <section className="bg-slate-50 dark:bg-slate-900/50 py-16">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-bold tracking-tight">Danh mục nổi bật</h3>
                            <a className="text-sm font-bold text-primary hover:underline" href="/courses">Xem tất cả</a>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="group flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-primary hover:shadow-lg dark:border-slate-800 dark:bg-background-dark">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">code</span>
                                </div>
                                <span className="font-bold">Lập trình</span>
                            </div>
                            <div className="group flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-primary hover:shadow-lg dark:border-slate-800 dark:bg-background-dark">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">palette</span>
                                </div>
                                <span className="font-bold">Thiết kế</span>
                            </div>
                            <div className="group flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-primary hover:shadow-lg dark:border-slate-800 dark:bg-background-dark">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">business_center</span>
                                </div>
                                <span className="font-bold">Kinh doanh</span>
                            </div>
                            <div className="group flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-primary hover:shadow-lg dark:border-slate-800 dark:bg-background-dark">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">campaign</span>
                                </div>
                                <span className="font-bold">Marketing</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-16">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-bold tracking-tight">Khóa học phổ biến</h3>
                            <div className="flex gap-2">
                                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-xl dark:border-slate-800 dark:bg-background-dark">
                                <div className="relative aspect-video overflow-hidden">
                                    <img alt="Web Development" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" data-alt="Giao diện lập trình web hiện đại" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNs1PGWKPiIli2W_y1F2-oDywACvm9K-LGrInXzLMgIDxxc71iDWoLAXa8DmP26J10yuyL8DJ6y0rXtfk_QvJ12_48To7oMeFHuBvcrTBgXeTZITMOVcf0IVlcEI2dqrup3RH8agpPJl2ks3sqMRVvy6iVTaUr4flhiwLZQG_bE9V6oZEBsSoONAEjveP0m9PkhqbAWcMoHTJKX57yDUPno_Ohn7wPXhnkFCWvFgUNlelg1spILofNTjMiZ4efh0y_9OS16IjSMcmW"/>
                                    <span className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-bold dark:bg-background-dark/90">Bán chạy</span>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs font-semibold text-primary uppercase">Development</span>
                                    <h4 className="mt-2 font-bold line-clamp-2">Lập trình Web Fullstack với React &amp; Node.js</h4>
                                    <div className="mt-2 flex items-center gap-1">
                                        <span className="text-sm font-bold text-amber-500">4.8</span>
                                        <div className="flex text-amber-500">
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm">star</span>
                                        </div>
                                        <span className="text-xs text-slate-500">(1,240)</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-lg font-black text-primary">499.000đ</span>
                                        <span className="text-sm text-slate-400 line-through">1.200.000đ</span>
                                    </div>
                                </div>
                            </div>
                            <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-xl dark:border-slate-800 dark:bg-background-dark">
                                <div className="relative aspect-video overflow-hidden">
                                    <img alt="UI UX Design" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" data-alt="Thiết kế UI/UX trên máy tính" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2si_woEPRxALfjn8IhEw5YBnyADolgC4NtaoZu11E8frXP1KO552vjufP1jZlILU5yiagvzOoPmNK5dgOvUrriY747lyr8bfFvV285KEKxMGoxGvVAG1P4Cyk1syDQyJGl2JKh9DYvdLqpwbEd4GWW6CjMeHoJebcCFYSGS5k_Xy2SraMccO8PdY-W3uhYO2x2O1Jh-72IEq7Bs0_5Mk6M3nDlWPK94fDxoaaCI-L87BjTP4pemIoD4YJi9y9HgM0Zcv46EXZwjdG"/>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs font-semibold text-primary uppercase">Design</span>
                                    <h4 className="mt-2 font-bold line-clamp-2">Khóa học thiết kế UI/UX cơ bản đến nâng cao</h4>
                                    <div className="mt-2 flex items-center gap-1">
                                        <span className="text-sm font-bold text-amber-500">4.9</span>
                                        <div className="flex text-amber-500">
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                        </div>
                                        <span className="text-xs text-slate-500">(850)</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-lg font-black text-primary">399.000đ</span>
                                        <span className="text-sm text-slate-400 line-through">950.000đ</span>
                                    </div>
                                </div>
                            </div>
                            <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-xl dark:border-slate-800 dark:bg-background-dark">
                                <div className="relative aspect-video overflow-hidden">
                                    <img alt="Digital Marketing" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" data-alt="Biểu đồ marketing và tăng trưởng" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACQnBXckodBnGeUc6hoL6wF12yNfMjgoBqjWX980RDu3TZZ5pisphebibxsoqLocQivG5wqppsdITeUUE6gcc6HsNB7MrosgC3IkHPSWscs5hrqNRrFZlZ_zrlXYxeOAoO0Vg4BxVFqXgTFMcjUqZ6GOIVJjtUXq73x-umaEv-JDGeX9FJe38OmSNN9YJ9-7cl1WmZJIcDvuovFOwC3mkY_NcxUnA2IbjLamtcmMo2eKbrAzCIF4A_PW6pMansnt2Op9myP_xe4OjL"/>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs font-semibold text-primary uppercase">Marketing</span>
                                    <h4 className="mt-2 font-bold line-clamp-2">Digital Marketing toàn diện cho người mới</h4>
                                    <div className="mt-2 flex items-center gap-1">
                                        <span className="text-sm font-bold text-amber-500">4.7</span>
                                        <div className="flex text-amber-500">
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm">star</span>
                                        </div>
                                        <span className="text-xs text-slate-500">(2,100)</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-lg font-black text-primary">Miễn phí</span>
                                        <span className="text-sm text-slate-400 line-through">450.000đ</span>
                                    </div>
                                </div>
                            </div>
                            <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-xl dark:border-slate-800 dark:bg-background-dark">
                                <div className="relative aspect-video overflow-hidden">
                                    <img alt="Finance" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" data-alt="Quản lý tài chính cá nhân" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLqR8vh3ckm_oQYuFUw08LPQPEeSMEBTzgbBBxvEgFM8E92ohNGi8OMeBnsFM5q9sruJcj1inKHtm7TkE17YxdgfUWelOvFHFi4kxWkmtrFe5H-GRvRZJ1AvjJpf0H9YmjiWhFbFAUVn0-iqHHq7YvXcJTbu31w3SDcT5O9_0A3xsX6CIwf9ecMAgwwl4VaW6Vn3xZwZ6UK-ZYZsYaqgGPoi6-vRaRye6XxVRwDCpSbGzrAy4Rd9D6a78qtARPp7N4h-hGEt8WsJzh"/>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs font-semibold text-primary uppercase">Business</span>
                                    <h4 className="mt-2 font-bold line-clamp-2">Quản trị tài chính cá nhân thông minh</h4>
                                    <div className="mt-2 flex items-center gap-1">
                                        <span className="text-sm font-bold text-amber-500">4.6</span>
                                        <div className="flex text-amber-500">
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm fill-1">star</span>
                                            <span className="material-symbols-outlined text-sm">star</span>
                                        </div>
                                        <span className="text-xs text-slate-500">(540)</span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-lg font-black text-primary">299.000đ</span>
                                        <span className="text-sm text-slate-400 line-through">600.000đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="bg-primary py-16 text-white">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                        <div className="grid gap-8 text-center md:grid-cols-3">
                            <div className="space-y-2">
                                <p className="text-4xl font-black md:text-5xl">10,000+</p>
                                <p className="text-lg font-medium opacity-90">Khóa học chuyên sâu</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-4xl font-black md:text-5xl">50,000+</p>
                                <p className="text-lg font-medium opacity-90">Học viên tin tưởng</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-4xl font-black md:text-5xl">500+</p>
                                <p className="text-lg font-medium opacity-90">Giảng viên uy tín</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
                    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl font-bold tracking-tight">Học viên nói gì về chúng tôi</h3>
                            <p className="mt-4 text-slate-600 dark:text-slate-400">Hàng ngàn câu chuyện thành công bắt đầu từ đây</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-background-dark border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1 text-amber-500 mb-4">
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 italic mb-6">"Khóa học lập trình web ở đây thực sự rất chất lượng. Lộ trình bài bản, dễ hiểu ngay cả với người chưa biết gì."</p>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                                        <img alt="User 1" className="h-full w-full object-cover" data-alt="Chân dung học viên nam" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd6bmMfRqX6cwLokm_8qah6mojfAWFs8JDKEHqVdT6piC_olFmOMUxsavvtS3_An8zj2GLM4dnmw8HqfFFwb0JLjWZauerH1rZ47qS4xVr2fjhyJcatWz5e3ghbokYRraqpOnVXUsZ5QcFPOKHSwzWobqstCrozku2CUoF_sozxKEdmh_I5szhRmvYmp7yIVEDd1av5l1mx4L8fnIHnaC_OKiS8WXYFQHVMu9AhW7lDDSaCSDuqfQQA0wv6VrwEisJiXhz2oj7jzFd"/>
                                    </div>
                                    <div>
                                        <p className="font-bold">Minh Tuấn</p>
                                        <p className="text-xs text-slate-500">Frontend Developer</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-background-dark border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1 text-amber-500 mb-4">
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 italic mb-6">"Tôi đã thay đổi hoàn toàn tư duy thiết kế sau khi học khóa UI/UX. Cảm ơn đội ngũ giảng viên rất nhiều!"</p>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                                        <img alt="User 2" className="h-full w-full object-cover" data-alt="Chân dung học viên nữ" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbC9jBt-f3DgL6OIr4Z4_8-7_OMDJwoKthJNbuvYyztCdPXXbS7_8TTjFYf5C87zJiKyynJt4Oej6pt6bkfIloPDi8QbqEgvsHpthHIUgrdPQq9iGnM9ChYtSxUQIXUg7t077T5xsyXzd6hAt-Ddn4_fkbeTooD8yEY82E_QxhZZr39JW6uzjXOzJIHZtv_OFuVGBmCF8UUsi1IEB8EOqpHCDA3sqANHfqqTxu6AOgK3EApDTgeblGKs6_0qoe9ltxrS2Bo5o-HxD0"/>
                                    </div>
                                    <div>
                                        <p className="font-bold">Linh Chi</p>
                                        <p className="text-xs text-slate-500">UI/UX Designer</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-background-dark border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1 text-amber-500 mb-4">
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                    <span className="material-symbols-outlined fill-1">star</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 italic mb-6">"Học phí rất hợp lý so với kiến thức nhận được. Nền tảng học tập mượt mà, hỗ trợ tận tình 24/7."</p>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                                        <img alt="User 3" className="h-full w-full object-cover" data-alt="Chân dung học viên nam văn phòng" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnhwMNlbMflQ6Nq4S0lQI7kZk7est1DV6gD0nAj818vpeZDTchrhYVjJq-xMw2lFOu2faAkB5I8Dk8Rco7fgTNUk414BW7LdvrsoBd_5bnaxqhYe-SN7U0nvTR7thyzlkmuZVk3-lCzbbeB-EknN0WluseBClDk1m617bRWtTTJJ4u-wZ2eTMQ0pYK6PDfmeRhZnuOB0G0YWqcg5qRhECICL236fTa-0yGnYI-k85bnvDI70daz5HlT21A8sZZx0d9Fardbwpgu5Yv"/>
                                    </div>
                                    <div>
                                        <p className="font-bold">Hoàng Nam</p>
                                        <p className="text-xs text-slate-500">Marketing Manager</p>
                                    </div>
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