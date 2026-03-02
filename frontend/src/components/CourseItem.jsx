import React from 'react';
import { Link } from 'react-router-dom';

const CourseItem = ({ course }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <img 
                src={course.image.url || course.image} 
                alt={course.title} 
                className="w-full h-48 object-cover"
            />
            <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                        {course.category}
                    </span>
                    <div className="flex items-center text-yellow-500 text-sm">
                        <span className="font-bold mr-1">{course.avgRating}</span>
                        <i className="fas fa-star"></i>
                        <span className="text-gray-400 ml-1">({course.totalReviews})</span>
                    </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {course.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                    {course.description}
                </p>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                    <div>
                        <p className="text-xs text-gray-400">Giá khóa học</p>
                        <p className="text-lg font-extrabold text-blue-600">
                            {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
                        </p>
                    </div>
                    <Link 
                        to={`/detail/${course._id}`}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Học ngay
                    </Link>
                </div>
                
                <div className="mt-3 flex items-center text-xs text-gray-500">
                    <i className="fas fa-users mr-1"></i>
                    <span>{course.studentCount} học viên đang học</span>
                </div>
            </div>
        </div>
    );
};

export default CourseItem;