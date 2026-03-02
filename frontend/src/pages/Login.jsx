import React, { useState, useContext } from 'react'; // 1. Thêm useContext
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';
import { GlobalState } from '../GlobalState'; // 2. Import GlobalState

function Login() {
    // 3. Lấy hàm setIsLogged từ GlobalState
    const state = useContext(GlobalState);
    const [isLogged, setIsLogged] = state.userAPI.isLogged;
    const [userGlobal, setUserGlobal] = state.userAPI.user;
    const [token, setToken] = state.token;

    const [user, setUser] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const onChangeInput = e => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const loginSubmit = async e => {
        e.preventDefault();
        try {
            // Gọi API đăng nhập
            const res = await axiosClient.post('/login', { ...user });

            // Lưu thông tin vào localStorage để duy trì đăng nhập khi F5
            localStorage.setItem('firstLogin', true);
            localStorage.setItem('access_token', res.data.access_token);
            
            // 4. Cập nhật State ngay lập tức để Header thay đổi giao diện
            setToken(res.data.access_token);
            setIsLogged(true);
            // Cập nhật thông tin user ngay lập tức
            if (res.data.user) {
                setUserGlobal(res.data.user);
            }
            
            toast.success("Đăng nhập thành công! 🚀");
            
            // Chuyển về trang chủ sau 1 giây
            setTimeout(() => navigate('/'), 1000);
            
        } catch (err) {
            const msg = err.response?.data?.msg || "Đăng nhập thất bại";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
                    Đăng Nhập
                </h2>
                
                <form onSubmit={loginSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                        <input 
                            type="email" name="email" required
                            placeholder="example@gmail.com"
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={user.email} onChange={onChangeInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                        <input 
                            type="password" name="password" required
                            placeholder="******"
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={user.password} onChange={onChangeInput}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all font-bold uppercase tracking-wide"
                    >
                        Vào học ngay
                    </button>
                </form>
                
                <p className="mt-6 text-center text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-blue-600 font-bold hover:underline">
                        Đăng ký
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;