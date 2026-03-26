import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Import Components & Pages
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import DetailCourse from './pages/DetailCourse';
import Checkout from './pages/Checkout';
import PaymentCheckout from './pages/PaymentCheckout';
import AdminRoute from './components/AdminRoute'; 
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses'; 
import CreateCourse from './pages/admin/CreateCourse'; 

// Quản lý Nội dung (Vẫn giữ Route bài học để Admin có thể vào từ nút "Nội dung" trong Course)
import AdminLessons from './pages/admin/AdminLessons';
import CreateLesson from './pages/admin/CreateLesson';

// 🆕 QUẢN LÝ TÀI KHOẢN (Thêm mới)
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import ComingSoon from './pages/ComingSoon';

function AppLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/detail/:id" element={<DetailCourse />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-checkout" element={<PaymentCheckout />} />
            <Route path="/payment/success" element={<PaymentCheckout />} />
            <Route path="/payment/error" element={<PaymentCheckout />} />
            <Route path="/payment/cancel" element={<PaymentCheckout />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="*" element={<div className="text-center p-20 font-bold text-gray-500">404 - Trang không tồn tại</div>} />
          </Route>

          {/* NHÓM 2: ADMIN PANEL (Protected Routes) */}
          <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/create_course" element={<Navigate to="/admin/edit_course" replace />} />
              <Route path="/admin/edit_course" element={<CreateCourse />} />
              <Route path="/admin/edit_course/:id" element={<CreateCourse />} />

              {/* 👥 QUẢN LÝ TÀI KHOẢN (Mới thêm vào menu chính của Admin) */}
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/payments" element={<AdminPayments />} />

              {/* 🎬 QUẢN LÝ BÀI HỌC (Truy cập thông qua từng khóa học cụ thể) */}
              <Route path="/admin/lessons/:courseId" element={<AdminLessons />} />
              <Route path="/admin/create_lesson/:courseId" element={<CreateLesson />} />
              <Route path="/admin/edit_lesson/:lessonId" element={<CreateLesson />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;