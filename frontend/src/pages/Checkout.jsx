import React, { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';
import { GlobalState } from '../GlobalState';

const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const Checkout = () => {
    const navigate = useNavigate();
    const state = useContext(GlobalState);

    const [token = ''] = state?.token || [''];
    const [isLogged = false] = state?.userAPI?.isLogged || [false];
    const [user = null, setUser = () => {}] = state?.userAPI?.user || [null, () => {}];
    const [courses = []] = state?.coursesAPI?.courses || [[]];

    const [couponInput, setCouponInput] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const cartItems = Array.isArray(user?.cart) ? user.cart : [];
    const enrolledIds = useMemo(
        () => new Set((user?.enrolledCourses || []).map((item) => String(item?._id || item))),
        [user?.enrolledCourses]
    );

    const validItems = cartItems.filter((item) => !enrolledIds.has(String(item?._id || item)));

    const subtotal = useMemo(
        () => validItems.reduce((sum, item) => sum + Number(item?.price || 0), 0),
        [validItems]
    );

    const discount = couponCode === 'EDU50' ? Math.min(50000, subtotal) : 0;
    const total = Math.max(0, subtotal - discount);

    const suggestedCourses = useMemo(() => {
        const cartIds = new Set(validItems.map((item) => String(item?._id || item)));

        return (Array.isArray(courses) ? courses : [])
            .filter((course) => !cartIds.has(String(course?._id || '')) && !enrolledIds.has(String(course?._id || '')))
            .slice(0, 4);
    }, [courses, validItems, enrolledIds]);

    const refreshUser = async () => {
        if (!token) return;
        const response = await axiosClient.get('/users/infor', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
    };

    const removeFromCart = async (courseId) => {
        if (!token) {
            toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
            return;
        }

        const nextCart = cartItems.filter((item) => String(item?._id || item) !== String(courseId));

        try {
            await axiosClient.patch('/users/addcart', { cart: nextCart }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await refreshUser();
            toast.success('Đã xóa khóa học khỏi giỏ hàng.');
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Không thể xóa khóa học khỏi giỏ hàng.');
        }
    };

    const applyCoupon = () => {
        const nextCode = String(couponInput || '').trim().toUpperCase();

        if (!nextCode) {
            toast.warn('Vui lòng nhập mã giảm giá.');
            return;
        }

        if (nextCode !== 'EDU50') {
            toast.error('Mã giảm giá không hợp lệ.');
            return;
        }

        setCouponCode(nextCode);
        toast.success('Đã áp dụng mã EDU50.');
    };

    const handleCheckout = async () => {
        if (!isLogged) {
            navigate('/login');
            return;
        }

        if (!token) {
            toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
            return;
        }

        if (validItems.length === 0) {
            toast.warn('Giỏ hàng đang trống.');
            return;
        }

        setSubmitting(true);

        try {
            const response = await axiosClient.post('/users/checkout', {
                couponCode: couponCode || undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await refreshUser();
            toast.success(response.data?.msg || 'Thanh toán thành công.');
            navigate('/courses');
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Thanh toán thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isLogged) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="mb-4 text-3xl font-black">Vui lòng đăng nhập</h1>
                <p className="mb-6 text-slate-500">Bạn cần đăng nhập để xem giỏ hàng và thanh toán.</p>
                <Link to="/login" className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white">
                    Đăng nhập
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Shopping Cart</h1>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-8">
                    <p className="text-sm font-semibold text-slate-500">{validItems.length} khóa học trong giỏ hàng</p>

                    {validItems.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-slate-600 dark:text-slate-300">Giỏ hàng đang trống.</p>
                            <Link to="/courses" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">
                                Khám phá khóa học
                            </Link>
                        </div>
                    ) : (
                        validItems.map((item) => (
                            <div key={String(item?._id || Math.random())} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex flex-col gap-5 sm:flex-row">
                                    <img
                                        src={item.image}
                                        alt={item.title || 'Course thumbnail'}
                                        className="h-32 w-full rounded-lg border border-slate-200 object-cover dark:border-slate-700 sm:w-48"
                                    />
                                    <div className="flex flex-1 flex-col justify-between gap-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">{item.title}</h3>
                                                <p className="mt-1 text-sm text-slate-500">By {item.teacher || 'EduLearn Team'}</p>
                                            </div>
                                            <div className="text-xl font-black text-primary">{formatVnd(item.price)}</div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-sm font-medium text-red-500 hover:underline"
                                            >
                                                Xóa khỏi giỏ
                                            </button>
                                            <Link to={`/detail/${item._id}`} className="text-sm font-medium text-primary hover:underline">
                                                Xem chi tiết khóa học
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <aside className="lg:col-span-4">
                    <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-6 text-xl font-bold">Order Summary</h2>

                        <div className="mb-6 space-y-4">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                                <span>Original Price</span>
                                <span>{formatVnd(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-red-500">
                                <span>Discounts</span>
                                <span>-{formatVnd(discount)}</span>
                            </div>
                            <div className="flex items-end justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-3xl font-black text-primary">{formatVnd(total)}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Coupon Code</label>
                            <div className="flex gap-2">
                                <input
                                    value={couponInput}
                                    onChange={(event) => setCouponInput(event.target.value)}
                                    placeholder="Nhập mã (ví dụ EDU50)"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
                                />
                                <button
                                    type="button"
                                    onClick={applyCoupon}
                                    className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                                >
                                    Apply
                                </button>
                            </div>
                            {couponCode && (
                                <p className="mt-2 text-xs font-medium text-primary">{couponCode} applied</p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={submitting || validItems.length === 0}
                            className="w-full rounded-xl bg-emerald-600 py-4 text-lg font-extrabold text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? 'Đang xử lý...' : 'Checkout'}
                        </button>

                        <p className="mt-4 px-4 text-center text-xs text-slate-500">
                            30-Day Money-Back Guarantee. Secure checkout powered by EduLearn.
                        </p>
                    </div>
                </aside>
            </div>

            {suggestedCourses.length > 0 && (
                <section className="mt-20">
                    <h2 className="mb-8 text-2xl font-extrabold">You might also like</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {suggestedCourses.map((course) => (
                            <Link
                                key={course._id}
                                to={`/detail/${course._id}`}
                                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                            >
                                <img src={course.image} alt={course.title} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="p-4">
                                    <h4 className="line-clamp-2 font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100">
                                        {course.title}
                                    </h4>
                                    <p className="mt-2 text-lg font-black text-primary">{formatVnd(course.price)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Checkout;
