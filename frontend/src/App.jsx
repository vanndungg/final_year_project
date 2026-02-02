import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Components & Pages
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans antialiased">
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          theme="light"
        />

        {/* Header luôn xuất hiện */}
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-[80vh]">
                <h2 className="text-2xl font-bold text-gray-800">404 - Không tìm thấy trang</h2>
                <a href="/" className="mt-4 text-blue-500 underline">Quay lại trang chủ</a>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;