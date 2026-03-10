import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalState } from '../../GlobalState';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const initialState = {
    title: '',
    description: '',
    price: 0,
    category: '',
    _id: ''
};

const CreateCourse = () => {
    const state = useContext(GlobalState);
    const [course, setCourse] = useState(initialState);
    const [token] = state.token;
    const [courses] = state.coursesAPI.courses;
    const [callback, setCallback] = state.coursesAPI.callback;

    const navigate = useNavigate();
    const param = useParams(); // Lấy ID từ URL: /admin/edit_course/:id

    const [onEdit, setOnEdit] = useState(false);

    // 1. Kiểm tra nếu có ID trên URL thì đổ dữ liệu cũ vào Form
    useEffect(() => {
        if (param.id) {
            setOnEdit(true);
            courses.forEach(item => {
                if (item._id === param.id) {
                    setCourse({
                        title: item.title,
                        description: item.description,
                        price: item.price,
                        category: item.category,
                        _id: item._id
                    });
                }
            });
        } else {
            setOnEdit(false);
            setCourse(initialState);
        }
    }, [param.id, courses]);

    const handleChangeInput = e => {
        const { name, value } = e.target;
        setCourse({ ...course, [name]: value });
    };

    // 2. Hàm xử lý khi bấm nút "Cập nhật" hoặc "Tạo mới"
    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (onEdit) {
                // GỌI API CẬP NHẬT (PUT)
                await axiosClient.put(`/courses/${course._id}`, { ...course }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Cập nhật khóa học thành công!");
            } else {
                // GỌI API TẠO MỚI (POST)
                await axiosClient.post('/courses', { ...course }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Tạo khóa học mới thành công!");
            }
            
            setCallback(!callback); // Refresh lại danh sách
            navigate("/admin/courses"); // Quay về trang danh sách
        } catch (err) {
            toast.error(err.response?.data?.msg || "Có lỗi xảy ra");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-2xl mt-10">
            <h2 className="text-3xl font-black mb-6 text-gray-800 border-b pb-4">
                {onEdit ? "📝 Chỉnh sửa khóa học" : "➕ Thêm khóa học mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-gray-700">Tên khóa học</label>
                        <input type="text" name="title" required value={course.title}
                            onChange={handleChangeInput} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-gray-700">Giá (VNĐ)</label>
                        <input type="number" name="price" required value={course.price}
                            onChange={handleChangeInput} className="p-3 border rounded-xl" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700">Mô tả ngắn</label>
                    <textarea name="description" rows="5" required value={course.description}
                        onChange={handleChangeInput} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-700">Danh mục (Category ID)</label>
                    <input type="text" name="category" required value={course.category}
                        onChange={handleChangeInput} className="p-3 border rounded-xl" />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border rounded-xl hover:bg-gray-100 transition font-bold">
                        Hủy
                    </button>
                    <button type="submit" className="px-10 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-black shadow-lg">
                        {onEdit ? "CẬP NHẬT NGAY" : "TẠO KHÓA HỌC"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;
