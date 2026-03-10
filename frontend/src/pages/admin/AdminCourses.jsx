import React, { useContext } from 'react';
import { GlobalState } from '../../GlobalState';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const AdminCourses = () => {
    const state = useContext(GlobalState);
    
    if (!state) return <div className="p-10 text-center italic">Đang tải dữ liệu...</div>;

    const coursesAPI = state.coursesAPI || {};
    const [courses] = coursesAPI.courses || [[]]; 
    const [token] = state.token || [];
    const [callback, setCallback] = coursesAPI.callback || [false, () => {}];

    const deleteCourse = async (id) => {
        if (window.confirm("❗ Bạn có chắc chắn muốn xóa khóa học này không?")) {
            try {
                const res = await axiosClient.delete(`/courses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(res.data.msg || "Xóa thành công!");
                setCallback(!callback); 
            } catch (err) {
                toast.error(err.response?.data?.msg || "Lỗi khi xóa");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Danh sách Khóa học</h1>
                    <p className="text-gray-500 text-sm mt-1">Cập nhật và điều chỉnh nội dung đào tạo</p>
                </div>
                <Link to="/admin/create_course" className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg flex items-center gap-2">
                    <span>+</span> Thêm khóa học mới
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 font-bold text-gray-600 uppercase text-[10px] tracking-widest">Hình ảnh</th>
                            <th className="p-5 font-bold text-gray-600 uppercase text-[10px] tracking-widest">Thông tin khóa học</th>
                            <th className="p-5 font-bold text-gray-600 uppercase text-[10px] tracking-widest">Giá bán</th>
                            <th className="p-5 font-bold text-gray-600 uppercase text-[10px] tracking-widest text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses && courses.length > 0 ? (
                            courses.map(course => (
                                <tr key={course._id} className="border-b border-gray-50 hover:bg-blue-50/20 transition group">
                                    <td className="p-5">
                                        <img 
                                            src={course.image?.url || course.image} 
                                            alt="" 
                                            className="w-24 h-14 object-cover rounded-xl shadow-sm border border-gray-100 group-hover:scale-105 transition-all" 
                                        />
                                    </td>
                                    <td className="p-5">
                                        <div className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{course.title}</div>
                                        <div className="text-[10px] font-mono text-gray-400">UID: {course._id}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-lg font-bold text-sm ${course.price === 0 ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                                            {course.price === 0 ? "MIỄN PHÍ" : `${course.price?.toLocaleString()}đ`}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center items-center gap-4">
                                            <Link to={`/admin/edit_course/${course._id}`} className="text-blue-600 hover:text-blue-800 font-bold text-sm">Sửa</Link>
                                            <button onClick={() => deleteCourse(course._id)} className="text-red-600 hover:text-red-800 font-bold text-sm">Xóa</button>
                                            <Link to={`/admin/lessons/${course._id}`} className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-gray-800 hover:text-white transition">NỘI DUNG 🎬</Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-20 text-center text-gray-400 italic font-medium">Đang tải danh sách khóa học...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default AdminCourses;
