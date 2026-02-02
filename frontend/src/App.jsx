import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các trang (Chúng ta sẽ tạo file Login.jsx ở bước dưới)
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* ToastContainer giúp hiển thị thông báo pop-up đẹp mắt */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        <Routes>
          {/* Trang chủ tạm thời */}
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center h-screen">
              <h1 className="text-4xl font-bold text-blue-600">Chào mừng đến với E-Learning</h1>
              <p className="mt-4 text-gray-600">Hệ thống đang được xây dựng...</p>
              <a href="/login" className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
                Đi tới Đăng nhập
              </a>
            </div>
          } />

          {/* Trang Đăng nhập */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;