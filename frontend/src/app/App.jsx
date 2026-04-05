

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import ScrollToTop from '../shared/components/ScrollToTop';
import Home from '../features/home/HomePage';
import Courses from '../features/courses/CoursesPage';
import Teachers from '../features/teachers/TeachersPage';
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

import ManageLessons from '../features/staff/manager/courses/lessons/ManageLessonsPage';
import CreateLesson from '../features/staff/manager/courses/lessons/CreateLessonPage';

import ManageUsers from '../features/staff/manager/users/ManageUsersPage';
import ManageStaffAccounts from '../features/staff/manager/users/ManageStaffAccountsPage';
import StudentCourses from '../features/staff/manager/users/StudentCoursesPage';
import ManagePayments from '../features/staff/manager/payments/ManagePaymentsPage';
import ManageCourseStudents from '../features/staff/manager/courses/ManageCourseStudentsPage';
import ComingSoon from '../features/home/ComingSoonPage';
import ConfirmDialog from '../shared/components/ConfirmDialog';
// tao layout chung co header, noi dung va footer.
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
// khai bao router va map url den tung trang.
function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/teachers" element={<Teachers />} />
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

            <Route element={<StaffRoute />}>
              <Route path="/admin/courses" element={<ManageCourses />} />
              <Route path="/admin/create_course" element={<Navigate to="/admin/edit_course" replace />} />
              <Route path="/admin/edit_course" element={<CreateCourse />} />
              <Route path="/admin/edit_course/:id" element={<CreateCourse />} />
              <Route path="/admin/course-progress/:courseId" element={<ManageCourseStudents />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/student-courses/:studentId" element={<StudentCourses />} />

              <Route path="/admin/lessons/:courseId" element={<ManageLessons />} />
              <Route path="/admin/create_lesson/:courseId" element={<CreateLesson />} />
              <Route path="/admin/edit_lesson/:lessonId" element={<CreateLesson />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/staff-accounts" element={<ManageStaffAccounts />} />
              <Route path="/admin/payments" element={<ManagePayments />} />
          </Route>
        </Routes>
        <ConfirmDialog />
      </div>
    </Router>
  );
}

export default App;