

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
// hien thi form dang ky va gui thong tin tao tai khoan moi.
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
            // kiem tra mat khau xac nhan truoc khi goi api.
            if (user.password !== user.cf_password) {
                return toast.error("Mật khẩu xác nhận không khớp!");
            }

            // gui thong tin dang ky len backend.
            await axiosClient.post('/register', { 
                name: user.name, 
                email: user.email, 
                password: user.password 
            });

            toast.success("Account registered successfully! 🎉");
            
            // chuyen sang trang dang nhap sau khi dang ky xong.
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.msg || "Đăng ký thất bại");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Create account</h2>
                
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
                        Register now
                    </button>
                </form>
                
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;