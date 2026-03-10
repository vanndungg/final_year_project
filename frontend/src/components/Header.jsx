import React, { useContext } from 'react';
import { GlobalState } from '../GlobalState';
import { Link } from 'react-router-dom';

function Header() {
    const state = useContext(GlobalState);
    
    // Kiểm tra an toàn để tránh lỗi "cannot destructure property"
    if (!state) return null;

    const [isLogged, setIsLogged] = state.userAPI.isLogged;
    const [user] = state.userAPI.user;

    const logoutUser = () => {
        localStorage.clear();
        setIsLogged(false);
        window.location.href = "/";
    };

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center px-10 sticky top-0 z-50">
            <div className="text-2xl font-bold text-blue-600">
                <Link to="/">E-Learning</Link>
            </div>

            <nav className="space-x-6 flex items-center">
                <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Khóa học</Link>
                
                {isLogged ? (
                    <div className="flex items-center space-x-4">
                        {/* NÚT ADMIN: Chỉ hiện khi user.role là 1 */}
                        {user?.role === 1 && (
                            <Link 
                                to="/admin/dashboard" 
                                className="bg-amber-500 text-white px-4 py-1.5 rounded-lg hover:bg-amber-600 transition shadow-sm font-bold flex items-center gap-1"
                            >
                                ⚙️ Quản trị
                            </Link>
                        )}

                        <span className="font-semibold text-gray-800">
                            👋 Chào, <span className="text-blue-600">{user?.name || 'Học viên'}</span>
                        </span>
                        
                        <button 
                            onClick={logoutUser}
                            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition shadow-sm"
                        >
                            Đăng xuất
                        </button>
                    </div>
                ) : (
                    <div className="space-x-4">
                        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Đăng nhập</Link>
                        <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">
                            Đăng ký
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;