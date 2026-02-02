import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

function Login() {
    const [user, setUser] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const onChangeInput = e => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const loginSubmit = async e => {
        e.preventDefault();
        try {
            // Gọi API đăng nhập (Backend cổng 5000)
            const res = await axiosClient.post('/login', { ...user });

            // Lưu trạng thái đăng nhập
            localStorage.setItem('firstLogin', true);
            localStorage.setItem('access_token', res.data.accesstoken);
            
            toast.success("Đăng nhập thành công! 🚀");
            
            // Chuyển hướng về trang chủ
            window.location.href = "/";
        } catch (err) {
            toast.error(err.response.data.msg || "Đăng nhập thất bại");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng Nhập</h2>
                
                <form onSubmit={loginSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" name="email" required
                            placeholder="example@gmail.com"
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={user.email} onChange={onChangeInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input 
                            type="password" name="password" required
                            placeholder="******"
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={user.password} onChange={onChangeInput}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Vào học ngay
                    </button>
                </form>
                
                <p className="mt-4 text-center text-sm text-gray-600">
                    Chưa có tài khoản? <a href="/register" className="text-blue-600 font-bold">Đăng ký</a>
                </p>
            </div>
        </div>
    );
}

export default Login;