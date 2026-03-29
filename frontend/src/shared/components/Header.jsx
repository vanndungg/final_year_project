import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GlobalState } from '../../app/providers/GlobalState';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Header() {
    const state = useContext(GlobalState);
    const location = useLocation();
    const navigate = useNavigate();
    const searchInputRef = useRef(null);
    const accountMenuRef = useRef(null);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const userAPI = state?.userAPI;
    const [isLogged, setIsLogged] = userAPI?.isLogged || [false, () => {}];
    const [user] = userAPI?.user || [null];
    const cartCount = Array.isArray(user?.cart) ? user.cart.length : 0;
    const userRole = Number(user?.role);
    const isAdmin = userRole === 1;
    const isStaff = isAdmin || userRole === 2;

    const accountRoleLabel = useMemo(() => {
        const role = Number(user?.role);
        if (role === 1) return 'Admin';
        if (role === 2) return 'Giáo viên';
        return 'Học viên';
    }, [user?.role]);

    const searchTerm = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return location.pathname === '/courses' ? params.get('q') || '' : '';
    }, [location.pathname, location.search]);

    const logoutUser = () => {
        localStorage.clear();
        setIsLogged(false);
        window.location.href = "/";
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setIsAccountMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchSubmit = (event) => {
        event.preventDefault();

        const inputValue = searchInputRef.current?.value || '';
        const trimmedQuery = inputValue.trim();
        const params = new URLSearchParams();

        if (trimmedQuery) {
            params.set('q', trimmedQuery);
        }

        navigate(`/courses${params.toString() ? `?${params.toString()}` : ''}`);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 text-primary" aria-label="Về trang chủ">
                        <span className="material-symbols-outlined text-3xl font-bold">school</span>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EduLearn</h1>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Trang chủ</Link>
                        <Link to="/courses" className="text-sm font-medium hover:text-primary transition-colors">Khóa học</Link>
                        <Link to="/coming-soon" className="text-sm font-medium hover:text-primary transition-colors">Danh mục</Link>
                        <Link to="/coming-soon" className="text-sm font-medium hover:text-primary transition-colors">Giảng viên</Link>
                        {isStaff && (
                            <Link
                                to={isAdmin ? '/admin/dashboard' : '/admin/courses'}
                                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                            >
                                Quan ly
                            </Link>
                        )}
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end gap-4 max-w-2xl">
                    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            key={`${location.pathname}:${location.search}`}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-11 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            placeholder="Tìm kiếm khóa học hoặc giảng viên..."
                            type="search"
                            defaultValue={searchTerm}
                            ref={searchInputRef}
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-primary hover:bg-primary/10 transition-colors"
                            aria-label="Tìm kiếm khóa học"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </form>
                    <Link to="/checkout" className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {isLogged ? (
                        <div className="relative" ref={accountMenuRef}>
                            <button
                                type="button"
                                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 transition hover:border-primary dark:border-slate-700"
                                aria-haspopup="menu"
                                aria-expanded={isAccountMenuOpen}
                                aria-label="Mở menu tài khoản"
                            >
                                <img
                                    src={user?.avatar || 'https://via.placeholder.com/80'}
                                    alt={user?.name || 'Avatar'}
                                    className="h-full w-full object-cover"
                                />
                            </button>

                            {isAccountMenuOpen && (
                                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                                        <img
                                            src={user?.avatar || 'https://via.placeholder.com/80'}
                                            alt={user?.name || 'Avatar'}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Học viên'}</p>
                                            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{accountRoleLabel}</p>
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsAccountMenuOpen(false)}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">person</span>
                                            Xem profile
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={logoutUser}
                                            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-primary font-medium text-sm">Đăng nhập</Link>
                            <Link to="/register" className="bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition shadow-md text-sm">
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;