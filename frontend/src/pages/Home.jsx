import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-5xl font-extrabold text-blue-600 tracking-tight">
        E-Learning Platform
      </h1>
      <p className="mt-4 text-xl text-gray-600 max-w-2xl">
        Chào mừng bạn đến với hệ thống học trực tuyến của Văn Dũng. 
        Nâng cao kỹ năng của bạn ngay hôm nay!
      </p>
      <div className="mt-8 flex gap-4">
        <Link 
          to="/login" 
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
        >
          Bắt đầu ngay
        </Link>
      </div>
    </div>
  );
};

export default Home;