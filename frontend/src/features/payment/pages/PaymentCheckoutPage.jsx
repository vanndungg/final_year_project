import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../../shared/api/axiosClient';
import { GlobalState } from '../../../app/providers/GlobalState';
import { formatVnd, gatewayResultRank } from '../paymentUtils';
import useRefreshCurrentUser from '../useRefreshCurrentUser';

const PaymentCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = useContext(GlobalState);

    const [token = ''] = state?.token || [''];
    const [isLogged = false] = state?.userAPI?.isLogged || [false];
    const [user = null, setUser = () => {}] = state?.userAPI?.user || [null, () => {}];

    const [pendingPayment, setPendingPayment] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [checkoutMeta, setCheckoutMeta] = useState(null);
    const [redirectingGateway, setRedirectingGateway] = useState(false);
    const [hasHandledPaidState, setHasHandledPaidState] = useState(false);

    // Get payment ID from URL or session
    const searchParams = new URLSearchParams(window.location.search);
    const paymentId = searchParams.get('paymentId');
    const pathResult = location.pathname.startsWith('/payment/')
        ? String(location.pathname.split('/').pop() || '').toLowerCase()
        : '';
    const paymentResult = String(searchParams.get('gatewayResult') || searchParams.get('payment') || pathResult || '').toLowerCase();

    const refreshUser = useRefreshCurrentUser(token, setUser);

    const checkPaymentStatus = useCallback(async (id, { silent = false } = {}) => {
        if (!id || !token) return;

        if (!silent) setCheckingStatus(true);
        try {
            const response = await axiosClient.get(`/users/vnpay/payment/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const payment = response.data;
            setPendingPayment((prev) => (prev ? { ...prev, status: payment.status, paidAt: payment.paidAt } : prev));

            if (String(payment.status).toLowerCase() === 'paid') {
                if (hasHandledPaidState) return;
                setHasHandledPaidState(true);
                await refreshUser();
                toast.success('Thanh toán thành công. Khóa học đã được mở và bạn sẽ quay về trang chủ.');
                setTimeout(() => navigate('/'), 1500);
            } else if (!silent) {
                toast.info('Chưa ghi nhận thanh toán. Vui lòng thử lại sau khi thanh toán VNPAY.');
            }
        } catch (error) {
            if (!silent) {
                toast.error(error.response?.data?.msg || 'Không thể kiểm tra trạng thái thanh toán.');
            }
        } finally {
            if (!silent) setCheckingStatus(false);
        }
    }, [hasHandledPaidState, navigate, refreshUser, token]);

    // Load payment info on mount
    useEffect(() => {
        if (!paymentId || !token) {
            navigate('/checkout');
            return;
        }
        (async () => {
            try {
                const response = await axiosClient.get(`/users/vnpay/payment/${paymentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPendingPayment(response.data);

                if (String(response.data?.status).toLowerCase() !== 'paid') {
                    const formResponse = await axiosClient.get(`/users/vnpay/payment-url/${paymentId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCheckoutMeta(formResponse.data);
                }
            } catch (error) {
                console.error('Failed to load payment:', error);
                toast.error('Không thể tải thông tin thanh toán.');
            }
        })();
    }, [paymentId, token, navigate]);

    useEffect(() => {
        if (!paymentResult) return;

        const storageKey = `vnpay_gateway_result_${paymentId || 'unknown'}`;
        const previous = String(sessionStorage.getItem(storageKey) || '').toLowerCase();
        const previousRank = gatewayResultRank[previous] || 0;
        const currentRank = gatewayResultRank[paymentResult] || 0;
        const effectiveResult = currentRank >= previousRank ? paymentResult : previous;

        if (currentRank >= previousRank) {
            sessionStorage.setItem(storageKey, paymentResult);
        }

        if (effectiveResult === 'success') {
            toast.info('Da quay lai tu cong thanh toan VNPAY. Dang doi IPN xac nhan.');
        } else if (effectiveResult === 'error') {
            toast.error('Thanh toan VNPAY that bai. Vui long thu lai.');
        } else if (effectiveResult === 'cancel') {
            toast.warn('Ban da huy thanh toan tren cong VNPAY.');
        }
    }, [paymentId, paymentResult]);

    // Auto-polling
    useEffect(() => {
        if (!pendingPayment?._id || String(pendingPayment.status).toLowerCase() === 'paid') 
            return undefined;

        const intervalId = setInterval(() => {
            checkPaymentStatus(pendingPayment._id, { silent: true });
        }, 10000);

        return () => clearInterval(intervalId);
    }, [checkPaymentStatus, pendingPayment?._id, pendingPayment?.status]);

    const copyText = async (text, successMessage) => {
        try {
            await navigator.clipboard.writeText(String(text || ''));
            toast.success(successMessage);
        } catch {
            toast.error('Không thể sao chép.');
        }
    };

    const submitGatewayCheckout = (event) => {
        event.preventDefault();
        if (!checkoutMeta?.paymentUrl) {
            toast.error('Khong lay duoc URL thanh toan VNPAY.');
            return;
        }
        setRedirectingGateway(true);
        window.location.href = checkoutMeta.paymentUrl;
    };

    if (!isLogged || !paymentId) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="mb-4 text-3xl font-black">Vui lòng đăng nhập</h1>
                <p className="mb-6 text-slate-500">Bạn cần đăng nhập để tiếp tục thanh toán.</p>
                <Link to="/login" className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white">
                    Đăng nhập
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background dark:bg-slate-950">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-outline dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-black text-primary tracking-tight">EduLearn</Link>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                        <span className="material-symbols-outlined text-primary" style={{fontSize: '20px'}}>lock</span>
                        Thanh toán bảo mật
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
                {/* Breadcrumb & Title */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black tracking-tight text-on-surface dark:text-slate-100 mb-2">Hoàn tất đăng ký</h1>
                    <p className="text-on-surface-variant dark:text-slate-400">Vui lòng kiểm tra lại thông tin đơn hàng và chọn phương thức thanh toán.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Checkout Info */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Personal Info Section */}
                        <section className="bg-surface dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-outline dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-primary-container dark:bg-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary" style={{fontSize: '20px'}}>person</span>
                                </div>
                                <h2 className="text-xl font-bold text-on-surface dark:text-slate-100">Thông tin cá nhân</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-on-surface-variant dark:text-slate-300">Họ và tên</label>
                                    <input 
                                        id="checkout-full-name"
                                        name="fullName"
                                        type="text" 
                                        value={user?.name || ''}
                                        disabled
                                        className="w-full bg-surface-container-low dark:bg-slate-800 border border-outline dark:border-slate-700 rounded-xl px-4 py-3 disabled:opacity-60 text-on-surface dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-on-surface-variant dark:text-slate-300">Email nhận khóa học</label>
                                    <input 
                                        id="checkout-email"
                                        name="email"
                                        type="email" 
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full bg-surface-container-low dark:bg-slate-800 border border-outline dark:border-slate-700 rounded-xl px-4 py-3 disabled:opacity-60 text-on-surface dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-on-surface-variant dark:text-slate-300">Số điện thoại</label>
                                    <input 
                                        id="checkout-phone"
                                        name="phone"
                                        type="text" 
                                        value={user?.phone || ''}
                                        placeholder="Chưa cập nhật"
                                        disabled
                                        className="w-full bg-surface-container-low dark:bg-slate-800 border border-outline dark:border-slate-700 rounded-xl px-4 py-3 disabled:opacity-60 text-on-surface dark:text-slate-100"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Payment Methods Section */}
                        <section className="bg-surface dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-outline dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-primary-container dark:bg-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary" style={{fontSize: '20px'}}>payments</span>
                                </div>
                                <h2 className="text-xl font-bold text-on-surface dark:text-slate-100">Phương thức thanh toán</h2>
                            </div>
                            <div className="space-y-4">
                                {/* Bank Transfer Option - Selected by Default */}
                                <label className="relative flex items-center p-5 border-2 border-primary bg-primary-container/10 dark:bg-primary/10 rounded-xl cursor-pointer group">
                                    <input id="payment-method-vnpay" name="paymentMethod" type="radio" checked disabled className="w-5 h-5 text-primary border-outline" />
                                    <div className="ml-4 flex-1">
                                        <div className="font-bold text-on-surface dark:text-slate-100">Chuyển khoản ngân hàng</div>
                                        <p className="text-sm text-on-surface-variant dark:text-slate-400">Quét mã VietQR hoặc chuyển khoản qua ứng dụng ngân hàng</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary opacity-100" style={{fontSize: '24px'}}>account_balance</span>
                                </label>
                            </div>

                            {/* VNPAY Payment Info */}
                            {pendingPayment && (
                                <div className="mt-8 pt-8 border-t border-outline dark:border-slate-700 space-y-6">
                                    <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6">
                                        <h3 className="font-bold text-emerald-900 dark:text-emerald-300 mb-4">Thong tin thanh toan VNPAY</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-on-surface-variant dark:text-slate-400">Mã đơn hàng:</span>
                                                <span className="font-mono font-bold text-on-surface dark:text-slate-100">{pendingPayment.paymentCode || pendingPayment.paymentID}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-on-surface-variant dark:text-slate-400">Trạng thái:</span>
                                                <span className={`font-bold ${String(pendingPayment.status).toLowerCase() === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    {String(pendingPayment.status).toLowerCase() === 'paid' ? 'Da thanh toan' : 'Cho thanh toan'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-on-surface-variant dark:text-slate-400">Ngân hàng:</span>
                                                <span className="font-bold text-on-surface dark:text-slate-100">VNPAY Gateway</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-on-surface-variant dark:text-slate-400">Số tài khoản:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-on-surface dark:text-slate-100">Thanh toan qua cong VNPAY</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyText(String(pendingPayment.paymentCode || pendingPayment.paymentID || ''), 'Đã sao chép mã đơn hàng')}
                                                        className="text-xs font-bold text-primary hover:underline"
                                                    >
                                                        Sao chép
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-on-surface-variant dark:text-slate-400">Chủ tài khoản:</span>
                                                <span className="font-bold text-on-surface dark:text-slate-100">VNPAY</span>
                                            </div>
                                            <div className="border-t border-emerald-200 dark:border-emerald-800 pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-on-surface-variant dark:text-slate-400">Số tiền:</span>
                                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">{formatVnd(pendingPayment?.total)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-2">
                                                <div className="text-xs font-bold text-on-surface-variant dark:text-slate-400 uppercase">Ma tham chieu</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-on-surface dark:text-slate-100 break-all">{pendingPayment.paymentCode || pendingPayment.paymentID}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyText(String(pendingPayment.paymentCode || pendingPayment.paymentID || ''), 'Đã sao chép mã tham chiếu')}
                                                        className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
                                                    >
                                                        Sao chép
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-on-surface-variant dark:text-slate-400">
                                                Luu y: he thong chi cap nhat ket qua thanh toan tu IPN VNPAY (server-to-server).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {String(pendingPayment.status).toLowerCase() !== 'paid' && checkoutMeta?.paymentUrl && (
                                            <form onSubmit={submitGatewayCheckout}>
                                                <button
                                                    type="submit"
                                                    disabled={redirectingGateway}
                                                    className="w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-60"
                                                >
                                                    {redirectingGateway ? 'Dang chuyen den VNPAY...' : 'Thanh toan qua cong VNPAY'}
                                                </button>
                                            </form>
                                        )}

                                        <button
                                            type="button"
                                            disabled={checkingStatus}
                                            onClick={() => checkPaymentStatus(pendingPayment._id)}
                                            className="w-full bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-60"
                                        >
                                            {checkingStatus ? '⏳ Đang kiểm tra...' : '✓ Tôi đã chuyển khoản - Kiểm tra trạng thái'}
                                        </button>
                                        <p className="text-xs text-on-surface-variant dark:text-slate-400 text-center">
                                            💡 Hệ thống sẽ tự kiểm tra thanh toán mỗi 10 giây
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            <section className="bg-surface dark:bg-slate-900 rounded-xl shadow-lg border border-outline dark:border-slate-800 overflow-hidden">
                                <div className="p-6 bg-surface-container-low dark:bg-slate-800 border-b border-outline dark:border-slate-700">
                                    <h2 className="text-xl font-black tracking-tight text-on-surface dark:text-slate-100">Tóm tắt đơn hàng</h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    {pendingPayment && (
                                        <>
                                            {/* Course Items */}
                                            {pendingPayment.courseItems && pendingPayment.courseItems.length > 0 ? (
                                                pendingPayment.courseItems.map((course) => (
                                                    <div key={course._id} className="flex gap-4 pb-4 border-b border-outline dark:border-slate-700">
                                                        <img
                                                            src={course.image}
                                                            alt={course.title}
                                                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-on-surface dark:text-slate-100 leading-tight mb-1 line-clamp-2">{course.title}</h3>
                                                            <div className="flex items-center gap-1 text-sm text-amber-500">
                                                                <span className="material-symbols-outlined" style={{fontSize: '16px', fontVariationSettings: "'FILL' 1"}}>star</span>
                                                                <span className="font-bold">{course.rating || '5.0'}</span>
                                                                <span className="text-on-surface-variant dark:text-slate-400 font-normal">({course.studentCount || '0'} học viên)</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-on-surface-variant dark:text-slate-400">Khong co du lieu khoa hoc trong don hang.</p>
                                                </div>
                                            )}

                                            {/* Price Summary */}
                                            <div className="space-y-3 pt-4 border-t border-outline dark:border-slate-700">
                                                <div className="flex justify-between text-on-surface-variant dark:text-slate-400">
                                                    <span>Giá gốc</span>
                                                    <span className="line-through font-medium">{formatVnd(pendingPayment.subtotal)}</span>
                                                </div>
                                                {pendingPayment.discount > 0 && (
                                                    <div className="flex justify-between text-primary font-bold">
                                                        <span>Giảm giá</span>
                                                        <span>-{formatVnd(pendingPayment.discount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center pt-4 border-t border-outline dark:border-slate-700">
                                                    <span className="text-lg font-bold text-on-surface dark:text-slate-100">Tổng cộng</span>
                                                    <span className="text-3xl font-black text-primary tracking-tighter">{formatVnd(pendingPayment.total)}</span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => navigate('/checkout')}
                                                className="w-full py-3 text-center rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
                                            >
                                                ← Quay lại giỏ hàng
                                            </button>
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* Trust Signals */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-center gap-4 opacity-70 text-xs font-bold">
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                        <span className="material-symbols-outlined" style={{fontSize: '16px'}}>verified_user</span>
                                        <span>SSL SECURE</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                        <span className="material-symbols-outlined" style={{fontSize: '16px'}}>shield</span>
                                        <span>TRUSTED</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined" style={{fontSize: '16px'}}>history</span>
                                        <span>30-DAY REFUND</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-low dark:bg-slate-800 w-full py-12 border-t border-outline dark:border-slate-700 mt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 max-w-7xl mx-auto">
                    <div>
                        <div className="text-lg font-bold text-on-surface dark:text-slate-100 mb-4">EduLearn</div>
                        <p className="text-on-surface-variant dark:text-slate-400 text-xs max-w-xs">
                            © 2024 EduLearn. Nền tảng học trực tuyến hàng đầu. Đội ngũ chúng tôi cam kết mang lại kiến thức chất lượng cao nhất cho mọi học viên.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-on-surface dark:text-slate-100 uppercase tracking-wider mb-2">Thông tin</span>
                            <a href="#" className="text-on-surface-variant dark:text-slate-400 text-xs hover:text-primary transition-colors">Về chúng tôi</a>
                            <a href="#" className="text-on-surface-variant dark:text-slate-400 text-xs hover:text-primary transition-colors">Điều khoản</a>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-on-surface dark:text-slate-100 uppercase tracking-wider mb-2">Hỗ trợ</span>
                            <a href="#" className="text-on-surface-variant dark:text-slate-400 text-xs hover:text-primary transition-colors">Chính sách bảo mật</a>
                            <a href="#" className="text-on-surface-variant dark:text-slate-400 text-xs hover:text-primary transition-colors">Liên hệ</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PaymentCheckout;
