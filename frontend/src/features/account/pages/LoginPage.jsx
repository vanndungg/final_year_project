

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
import { GlobalState } from '../../../app/providers/GlobalState';
// hien thi form dang nhap va cap nhat trang thai phien dang nhap.
function Login() {
    const state = useContext(GlobalState);
    const [, setIsLogged] = state.userAPI.isLogged;
    const [, setUserGlobal] = state.userAPI.user;
    const [, setToken] = state.token;

    const [user, setUser] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const onChangeInput = e => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const loginSubmit = async e => {
        e.preventDefault();
        try {
            // gui thong tin dang nhap len backend.
            const res = await axiosClient.post('/login', { ...user });

            // luu token de giu trang thai dang nhap sau khi tai lai trang.
            localStorage.setItem('firstLogin', true);
            localStorage.setItem('access_token', res.data.access_token);
            
            // cap nhat global state ngay sau khi dang nhap thanh cong.
            setToken(res.data.access_token);
            setIsLogged(true);
            // luu thong tin user vao context neu backend tra ve.
            if (res.data.user) {
                setUserGlobal(res.data.user);
            }
            
            toast.success("Đăng nhập thành công! 🚀");
            
            // chuyen ve trang chu sau khi hien thong bao.
            setTimeout(() => navigate('/'), 1000);
            
        } catch (err) {
            const msg = err.response?.data?.msg || "Đăng nhập thất bại";
            toast.error(msg);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                <main className="flex-1">
                    <section className="relative overflow-hidden bg-white dark:bg-background-dark py-16 md:py-24">
                        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                            <div className="grid items-center gap-12 lg:grid-cols-2">
                                <div className="flex flex-col gap-8">
                                    <div className="space-y-4">
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">Đăng nhập</span>
                                        <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl">
                                            Chào mừng trở lại <span className="text-primary">EduLearn</span>
                                        </h2>
                                        <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
                                            Đăng nhập để tiếp tục hành trình học tập và phát triển bản thân của bạn.
                                        </p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
                                    <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-background-dark p-8">
                                        <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-8">
                                            Đăng Nhập
                                        </h2>
                                        
                                        <form onSubmit={loginSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                                                <input 
                                                    type="email" name="email" required
                                                    placeholder="example@gmail.com"
                                                    className="mt-1 block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                                    value={user.email} onChange={onChangeInput}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
                                                <input 
                                                    type="password" name="password" required
                                                    placeholder="******"
                                                    className="mt-1 block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                                    value={user.password} onChange={onChangeInput}
                                                />
                                            </div>

                                            <button 
                                                type="submit"
                                                className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all font-bold uppercase tracking-wide"
                                            >
                                                Vào học ngay
                                            </button>
                                        </form>
                                        
                                        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                                            Chưa có tài khoản?{' '}
                                            <Link
                                                to="/register"
                                                className="inline-flex items-center justify-center px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition"
                                            >
                                                Đăng ký
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

            </div>
        </div>
    );
}

export default Login;