import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

/*
  ==================== BẮT ĐẦU TỪ ĐÂY ====================
  Bước 1 - Hãy đọc file này đầu tiên.
  Lý do: Đây là bản đồ route của toàn bộ frontend.

  Hãy tưởng tượng file này như bản đồ thành phố:
  - path="/courses"  -> địa chỉ
  - element={<Courses />} -> trang hiển thị tại địa chỉ đó
  - <StaffRoute/> / <AdminRoute/> -> cổng kiểm tra quyền
  - <AppLayout/> -> khung chung (Header + Footer + nội dung trang)

  Thứ tự nên đọc sau file này:
  Bước 2: src/app/providers/GlobalState.jsx
  Bước 3: src/shared/api/axiosClient.js
  Bước 4: src/features/courses/detail-course/DetailCoursePage.jsx (luồng chính của học viên)
  Bước 5: src/features/staff/lessons/CreateLessonPage.jsx (luồng chính của giáo viên/admin)
  Bước 6: backend/server.js (nơi backend mount toàn bộ routes)
  ========================================================
*/

// Import Components & Pages
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import ScrollToTop from '../shared/components/ScrollToTop';
import Home from '../features/home/HomePage';
import Courses from '../features/courses/CoursesPage';
import Login from '../features/account/pages/LoginPage';
import Register from '../features/account/pages/RegisterPage';
import Profile from '../features/account/pages/ProfilePage';
import DetailCourse from '../features/courses/detail-course/DetailCoursePage';
import Checkout from '../features/payment/pages/CheckoutPage';
import PaymentCheckout from '../features/payment/pages/PaymentCheckoutPage';
import AdminRoute from '../features/staff/guards/AdminRoute'; 
import StaffRoute from '../features/staff/guards/StaffRoute';
import AdminDashboard from '../features/staff/pages/AdminDashboardPage';
import ManageCourses from '../features/staff/manager/courses/ManageCoursesPage'; 
import CreateCourse from '../features/staff/manager/courses/CreateCoursePage'; 

// Quản lý Nội dung (Vẫn giữ Route bài học để Admin có thể vào từ nút "Nội dung" trong Course)
import ManageLessons from '../features/staff/manager/courses/lessons/ManageLessonsPage';
import CreateLesson from '../features/staff/manager/courses/lessons/CreateLessonPage';

// 🆕 QUẢN LÝ TÀI KHOẢN (Thêm mới)
import ManageUsers from '../features/staff/manager/users/ManageUsersPage';
import ManagePayments from '../features/staff/manager/payments/ManagePaymentsPage';
import ManageCourseStudents from '../features/staff/manager/courses/ManageCourseStudentsPage';
import ComingSoon from '../features/home/ComingSoonPage';

function AppLayout() {
  // AppLayout bọc các trang public bằng Header và Footer.
  // <Outlet /> là vị trí React Router đổ nội dung trang hiện tại vào.
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
          {/* Nhóm A: Trang public / người dùng thường. Các trang này dùng AppLayout. */}
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

            {/* Nhóm B: Trang dành cho staff (Admin + Giáo viên). */}
            {/* Nếu user không phải role 1/2 thì StaffRoute sẽ chặn lại. */}
            <Route element={<StaffRoute />}>
              <Route path="/admin/courses" element={<ManageCourses />} />
              <Route path="/admin/create_course" element={<Navigate to="/admin/edit_course" replace />} />
              <Route path="/admin/edit_course" element={<CreateCourse />} />
              <Route path="/admin/edit_course/:id" element={<CreateCourse />} />
              <Route path="/admin/course-progress/:courseId" element={<ManageCourseStudents />} />

              {/* 🎬 QUẢN LÝ BÀI HỌC (Truy cập thông qua từng khóa học cụ thể) */}
              <Route path="/admin/lessons/:courseId" element={<ManageLessons />} />
              <Route path="/admin/create_lesson/:courseId" element={<CreateLesson />} />
              <Route path="/admin/edit_lesson/:lessonId" element={<CreateLesson />} />
            </Route>

            {/* Nhóm C: Trang chỉ dành cho Admin. Đây là vùng quyền cao nhất. */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* 👥 QUẢN LÝ TÀI KHOẢN (Mới thêm vào menu chính của Admin) */}
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/payments" element={<ManagePayments />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;