import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

function Register() {
    const [user, setUser] = useState({ name: '', email: '', password: '', cf_password: '' });
    const navigate = useNavigate();

    const onChangeInput = e => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const registerSubmit = async e => {
        e.preventDefault();
        try {
            // Kiểm tra khớp mật khẩu ở phía Frontend trước cho nhanh
            if (user.password !== user.cf_password) {
                return toast.error("Mật khẩu xác nhận không khớp!");
            }

            // Gọi API đăng ký
            await axiosClient.post('/register', { 
                name: user.name, 
                email: user.email, 
                password: user.password 
            });

            toast.success("Đăng ký tài khoản thành công! 🎉");
            
            // Chuyển sang trang Login sau khi đăng ký xong
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.msg || "Đăng ký thất bại");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Tạo tài khoản</h2>
                
                <form onSubmit={registerSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Họ và tên</label>
                        <input 
                            type="text" name="name" required
                            placeholder="Nguyễn Văn A"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={user.name} onChange={onChangeInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                        <input 
                            type="email" name="email" required
                            placeholder="example@gmail.com"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={user.email} onChange={onChangeInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                        <input 
                            type="password" name="password" required
                            placeholder="Tối thiểu 6 ký tự"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={user.password} onChange={onChangeInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Xác nhận mật khẩu</label>
                        <input 
                            type="password" name="cf_password" required
                            placeholder="Nhập lại mật khẩu"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={user.cf_password} onChange={onChangeInput}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-3 mt-4 text-white bg-green-600 hover:bg-green-700 rounded-lg font-bold shadow-md transition-all uppercase"
                    >
                        Đăng ký ngay
                    </button>
                </form>
                
                <p className="mt-6 text-center text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;