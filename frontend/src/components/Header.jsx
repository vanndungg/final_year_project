import React, { useContext, useMemo, useRef } from 'react';
import { GlobalState } from '../GlobalState';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Header() {
    const state = useContext(GlobalState);
    const location = useLocation();
    const navigate = useNavigate();
    const searchInputRef = useRef(null);

    const userAPI = state?.userAPI;
    const [isLogged, setIsLogged] = userAPI?.isLogged || [false, () => {}];
    const [user] = userAPI?.user || [null];
    const [isAdmin] = userAPI?.isAdmin || [false];
    const cartCount = Array.isArray(user?.cart) ? user.cart.length : 0;

    const searchTerm = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return location.pathname === '/courses' ? params.get('q') || '' : '';
    }, [location.pathname, location.search]);

    const logoutUser = () => {
        localStorage.clear();
        setIsLogged(false);
        window.location.href = "/";
    };

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
                        {isAdmin && (
                            <Link
                                to="/admin/dashboard"
                                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                            >
                                Quản trị
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
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                👋 Chào, <span className="text-primary">{user?.name || 'Học viên'}</span>
                            </span>
                            <button 
                                onClick={logoutUser}
                                className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition shadow-sm text-sm"
                            >
                                Đăng xuất
                            </button>
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