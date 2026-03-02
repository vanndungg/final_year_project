import React, { useContext } from 'react';
import { GlobalState } from '../GlobalState';
import CourseItem from '../components/CourseItem';
import { Link } from 'react-router-dom';

const Home = () => {
    const state = useContext(GlobalState);
    const [courses] = state.coursesAPI.courses;
    const [isLogged] = state.userAPI.isLogged;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-white py-16 border-b border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                        Nâng Tầm Kỹ Năng Với <span className="text-blue-600">Văn Dũng</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Hệ thống học trực tuyến hiện đại với lộ trình bài bản và giảng viên tâm huyết.
                    </p>
                    {!isLogged && (
                        <div className="mt-8">
                            <Link 
                                to="/register" 
                                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 inline-block"
                            >
                                Đăng ký ngay
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Course List Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Khóa học mới nhất
                    </h2>
                    <Link to="/courses" className="text-blue-600 font-semibold hover:underline">
                        Xem tất cả
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {courses.map(course => (
                        <CourseItem key={course._id} course={course} />
                    ))}
                </div>

                {courses.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 italic">Đang tải danh sách khóa học...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;