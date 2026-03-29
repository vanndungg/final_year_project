

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// hien thi trang thong bao tinh nang dang duoc phat trien.
const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  // xu ly form dang ky nhan thong bao khi tinh nang san sang.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập email để nhận thông báo.' });
      return;
    }
    setStatus({ type: 'success', message: 'Cảm ơn bạn! Chúng tôi sẽ thông báo khi tính năng sẵn sàng.' });
    setEmail('');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 text-center max-w-4xl mx-auto w-full">
        <div className="relative mb-12">
          <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
          <div className="relative flex flex-col items-center">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
              <span className="material-symbols-outlined text-9xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                construction
              </span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-white p-3 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900">
              <span className="material-symbols-outlined text-3xl">lightbulb</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase">
              Sắp ra mắt
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Tính năng này đang được phát triển
            </h1>
          </div>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Chúng tôi đang nỗ lực hoàn thiện từng chi tiết để mang đến cho bạn trải nghiệm học tập hiện đại và hiệu quả nhất. Hãy quay lại sớm nhé!
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-amber-500 text-white font-bold text-lg shadow-lg shadow-amber-300 hover:bg-amber-600 transition-all hover:-translate-y-1"
            >
              <span className="material-symbols-outlined mr-2">home</span>
              Quay lại trang chủ
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <span className="material-symbols-outlined mr-2">mail</span>
              Nhận thông báo
            </button>
          </form>

          {status && (
            <div
              className={`mt-4 rounded-xl px-5 py-4 text-sm font-semibold ${
                status.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="mt-20 w-full max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500">Tiến độ hoàn thiện</span>
              <span className="text-sm font-bold text-primary">85%</span>
            </div>
            <div className="w-full bg-amber-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ComingSoon;