import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GlobalState } from '../GlobalState';

const getRoleLabel = (roleValue) => {
    const normalizedRole = Number(roleValue);

    if (normalizedRole === 1) return 'Admin';
    if (normalizedRole === 2) return 'Giáo viên';
    return 'Học viên';
};

const buildNavItemClassName = (isActive) => (
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive
            ? 'bg-primary/10 text-primary'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`
);

const AdminPanelLayout = ({ children }) => {
    const location = useLocation();
    const state = useContext(GlobalState);
    const [user] = state?.userAPI?.user || [null];

    const pathname = location.pathname;
    const role = Number(user?.role);
    const isAdmin = role === 1;
    const isDashboardActive = pathname === '/admin/dashboard';
    const isCoursesActive = pathname.startsWith('/admin/courses') ||
        pathname.startsWith('/admin/create_course') ||
        pathname === '/admin/edit_course' ||
        pathname.startsWith('/admin/edit_course') ||
        pathname.startsWith('/admin/lessons') ||
        pathname.startsWith('/admin/create_lesson') ||
        pathname.startsWith('/admin/edit_lesson');
    const isUsersActive = pathname.startsWith('/admin/users');
    const isPaymentsActive = pathname.startsWith('/admin/payments');

    const accountName = user?.name || 'Admin';
    const accountRole = getRoleLabel(user?.role);
    const accountAvatar = user?.avatar || 'https://via.placeholder.com/48';

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display flex min-h-screen">
            <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col fixed h-full">
                <div className="p-6">
                    <Link to="/" className="flex items-center gap-2 text-primary" aria-label="Về trang chủ">
                        <span className="material-symbols-outlined text-3xl font-bold">school</span>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EduLearn</h1>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Admin Panel</p>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    <Link to="/" className={buildNavItemClassName(false)}>
                        <span className="material-symbols-outlined">home</span>
                        <span className="text-sm font-semibold">Home</span>
                    </Link>
                    {isAdmin && (
                        <Link to="/admin/dashboard" className={buildNavItemClassName(isDashboardActive)}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-sm font-semibold">Dashboard</span>
                        </Link>
                    )}
                    <Link to="/admin/courses" className={buildNavItemClassName(isCoursesActive)}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>book_2</span>
                        <span className="text-sm font-semibold">Courses</span>
                    </Link>
                    {isAdmin && (
                        <Link to="/admin/users" className={buildNavItemClassName(isUsersActive)}>
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-sm font-semibold">Students</span>
                        </Link>
                    )}
                    {isAdmin && (
                        <Link to="/admin/payments" className={buildNavItemClassName(isPaymentsActive)}>
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span className="text-sm font-semibold">Payments</span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2">
                        <img className="size-10 rounded-full border-2 border-primary/20 object-cover" alt="Admin user profile avatar" src={accountAvatar} />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{accountName}</p>
                            <p className="text-xs text-slate-500 truncate">{accountRole}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 ml-64 min-h-screen bg-background-light dark:bg-background-dark overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminPanelLayout;