import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Components & Pages
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DetailCourse from './pages/DetailCourse';
import AdminRoute from './components/AdminRoute'; 
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses'; 
import CreateCourse from './pages/admin/CreateCourse'; 

// Quản lý Nội dung (Vẫn giữ Route bài học để Admin có thể vào từ nút "Nội dung" trong Course)
import AdminLessons from './pages/admin/AdminLessons';
import CreateLesson from './pages/admin/CreateLesson';

// 🆕 QUẢN LÝ TÀI KHOẢN (Thêm mới)
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans antialiased">
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* NHÓM 1: USER (Client Side) */}
          <Route path="/*" element={
            <>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/detail/:id" element={<DetailCourse />} />
                  <Route path="*" element={<div className="text-center p-20 font-bold text-gray-500">404 - Trang không tồn tại</div>} />
                </Routes>
              </main>
            </>
          } />

          {/* NHÓM 2: ADMIN PANEL (Protected Routes) */}
          <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/create_course" element={<CreateCourse />} />
              <Route path="/admin/edit_course/:id" element={<CreateCourse />} />

              {/* 👥 QUẢN LÝ TÀI KHOẢN (Mới thêm vào menu chính của Admin) */}
              <Route path="/admin/users" element={<AdminUsers />} />

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