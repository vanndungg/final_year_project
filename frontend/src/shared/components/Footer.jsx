

import React from 'react';
import { Link } from 'react-router-dom';

// hien thi footer chung voi link dieu huong va form nhan tin.
export default function Footer() {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl font-bold">school</span>
              <h2 className="text-xl font-extrabold tracking-tight">EduLearn</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Đồng hành cùng bạn trên con đường chinh phục tri thức và phát triển sự nghiệp bền vững.
            </p>
            <div className="flex gap-4">
              <a className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-all" href="#">
                <span className="material-symbols-outlined text-sm">social_leaderboard</span>
              </a>
              <a className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-all" href="#">
                <span className="material-symbols-outlined text-sm">link</span>
              </a>
              <a className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-all" href="#">
                <span className="material-symbols-outlined text-sm">alternate_email</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Về EduLearn</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link className="hover:text-primary" to="/coming-soon">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" to="/teachers">
                  Giảng viên
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" to="/coming-soon">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" to="/coming-soon">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Khám phá</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link className="hover:text-primary" to="/courses">
                  Khóa học mới
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" to="/coming-soon">
                  Khóa học miễn phí
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" to="/coming-soon">
                  Chứng chỉ quốc tế
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary" to="/coming-soon">
                  Bài viết / Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Đăng ký nhận tin</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Cập nhật những khóa học mới nhất và ưu đãi hấp dẫn.
            </p>
            <form className="flex gap-2">
              <input
                className="flex-1 rounded-lg border-slate-200 bg-slate-50 py-2 text-sm focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
                placeholder="Email của bạn"
                type="email"
              />
              <button className="rounded-lg bg-primary px-4 py-2 font-bold text-white">Gửi</button>
            </form>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 EduLearn. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <Link className="hover:text-primary" to="/coming-soon">
              Điều khoản
            </Link>
            <Link className="hover:text-primary" to="/coming-soon">
              Bảo mật
            </Link>
            <Link className="hover:text-primary" to="/coming-soon">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
