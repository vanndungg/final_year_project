import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Components & Pages
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DetailCourse from './pages/DetailCourse'; // Đảm bảo bạn đã tạo file này

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans antialiased">
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          theme="light"
          pauseOnHover={false}
        />

        {/* Header luôn xuất hiện */}
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Route chi tiết khóa học */}
            <Route path="/detail/:id" element={<DetailCourse />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-[80vh]">
                <h2 className="text-4xl font-black text-gray-300">404</h2>
                <h2 className="text-2xl font-bold text-gray-800 mt-2">Không tìm thấy trang</h2>
                <a href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all">
                   Quay lại trang chủ
                </a>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;