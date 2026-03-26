import React, { useContext, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalState } from '../GlobalState.jsx';

const Courses = () => {
    const { coursesAPI } = useContext(GlobalState);
    const { userAPI } = useContext(GlobalState);
    const [searchParams, setSearchParams] = useSearchParams();
    const [courses] = coursesAPI.courses;
    const [user = null] = userAPI?.user || [null];
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 12;
    const searchTerm = searchParams.get('q') || '';

    // States for filters
    const [sortBy, setSortBy] = useState('price-low');

    const getStudentCount = (course) => {
        const numericCandidates = [
            course?.studentCount,
            course?.studentsEnrolled,
            course?.totalStudents,
            course?.enrolledCount
        ];

        for (const value of numericCandidates) {
            if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
                return Number(value);
            }
        }

        if (Array.isArray(course?.enrolledStudents)) return course.enrolledStudents.length;
        if (Array.isArray(course?.students)) return course.students.length;
        return 0;
    };

    // Available options
    const sortOptions = [
        { value: 'price-low', label: 'Giá: Thấp đến Cao' },
        { value: 'price-high', label: 'Giá: Cao đến Thấp' },
        { value: 'rating', label: 'Đánh giá Cao nhất' }
    ];

    // Filter and sort courses
    const enrolledCourseIds = new Set(
        (user?.enrolledCourses || []).map((item) => String(item?._id || item))
    );

    const filteredCourses = courses.filter((course) => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const courseTitle = course.title?.toLowerCase() || '';
        const teacherName = course.teacher?.toLowerCase() || '';
        const searchMatch = normalizedSearch === '' ||
            courseTitle.includes(normalizedSearch) ||
            teacherName.includes(normalizedSearch);

        return searchMatch;
    }).sort((a, b) => {
        const aOwned = enrolledCourseIds.has(String(a?._id || '')) ? 1 : 0;
        const bOwned = enrolledCourseIds.has(String(b?._id || '')) ? 1 : 0;

        // Push enrolled courses to top, then apply selected sort inside each group.
        if (aOwned !== bOwned) return bOwned - aOwned;

        switch (sortBy) {
            case 'price-low':
                return (a.price || 0) - (b.price || 0);
            case 'price-high':
                return (b.price || 0) - (a.price || 0);
            case 'rating':
                return (b.avgRating || 0) - (a.avgRating || 0);
            default:
                return 0;
        }
    });

    const myCourseCount = filteredCourses.filter((course) => enrolledCourseIds.has(String(course?._id || ''))).length;

    // Tính toán khóa học hiển thị trên trang hiện tại
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
    const indexOfLastCourse = safeCurrentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
    const currentOwnedCourses = currentCourses.filter((course) => enrolledCourseIds.has(String(course?._id || '')));
    const currentDiscoverCourses = currentCourses.filter((course) => !enrolledCourseIds.has(String(course?._id || '')));

    // Hàm chuyển trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleSearchChange = (value) => {
        setCurrentPage(1);

        const nextParams = new URLSearchParams(searchParams);
        const trimmedValue = value.trim();

        if (trimmedValue) {
            nextParams.set('q', trimmedValue);
        } else {
            nextParams.delete('q');
        }

        setSearchParams(nextParams, { replace: true });
    };

    // Clear search
    const clearSearch = () => {
        handleSearchChange('');
        setSortBy('price-low');
        setCurrentPage(1);
    };

    return (
        <div className="relative flex min-h-screen flex-col">
            {/* Hero Banner */}
            <section className="bg-primary/5 dark:bg-primary/10 py-10 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <nav aria-label="Breadcrumb" className="flex mb-4 text-xs font-medium text-slate-500">
                        <ol className="flex items-center space-x-2">
                            <li><a className="hover:text-primary" href="/">Trang chủ</a></li>
                            <li><span className="material-symbols-outlined text-xs">chevron_right</span></li>
                            <li className="text-primary">Khóa học</li>
                        </ol>
                    </nav>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Khóa học của chúng tôi</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        {filteredCourses.length} khóa học có sẵn • {myCourseCount} khóa học của tôi
                    </p>
                </div>
            </section>
            <main className="container mx-auto px-4 py-8">
                {/* Main Grid */}
                <div className="w-full">
                    {/* Search and Sorting Bar */}
                    <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                                        <span className="material-symbols-outlined text-lg">search</span>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm khóa học hoặc giảng viên..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button className="p-1.5 bg-white dark:bg-slate-700 shadow-sm rounded-md">
                                    <span className="material-symbols-outlined text-lg">grid_view</span>
                                </button>
                                <button className="p-1.5 text-slate-400">
                                    <span className="material-symbols-outlined text-lg">list</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Grid */}
                    {currentCourses.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 italic">Không tìm thấy khóa học phù hợp.</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {currentOwnedCourses.length > 0 && (
                                <section>
                                    <div className="mb-5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Khóa học của tôi</h3>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Những khóa học bạn đã sở hữu và có thể học ngay.</p>
                                        </div>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                            {currentOwnedCourses.length} khóa học
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {currentOwnedCourses.map((course) => (
                                            <Link key={course._id} to={`/detail/${course._id}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                                <div className="relative aspect-video overflow-hidden">
                                                    <img alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" src={course.image} />
                                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                        <span className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded tracking-wider">Khóa học của tôi</span>
                                                    </div>
                                                    <button onClick={(e) => e.stopPropagation()} className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined text-lg">favorite</span>
                                                    </button>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{course.teacher}</p>
                                                    <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                                                        <span className="material-symbols-outlined text-[16px]">group</span>
                                                        <span>{getStudentCount(course).toLocaleString()} học viên</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-sm font-bold text-yellow-600">{course.avgRating || 0}</span>
                                                        <div className="flex text-yellow-500">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={`material-symbols-outlined ${i < Math.floor(course.avgRating || 0) ? 'fill' : ''} text-[14px]`}>star</span>
                                                            ))}
                                                        </div>
                                                        <span className="text-[12px] text-slate-400">({course.totalReviews || 0})</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-2 mt-4">
                                                        <span className="text-lg font-bold text-slate-900 dark:text-white">${course.price}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {currentDiscoverCourses.length > 0 && (
                                <section>
                                    <div className="mb-5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Khám phá thêm</h3>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Những khóa học bạn chưa sở hữu.</p>
                                        </div>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                            {currentDiscoverCourses.length} khóa học
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {currentDiscoverCourses.map((course) => (
                                            <Link key={course._id} to={`/detail/${course._id}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                                <div className="relative aspect-video overflow-hidden">
                                                    <img alt={course.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" src={course.image} />
                                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                        <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded tracking-wider">New</span>
                                                    </div>
                                                    <button onClick={(e) => e.stopPropagation()} className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined text-lg">favorite</span>
                                                    </button>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{course.teacher}</p>
                                                    <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                                                        <span className="material-symbols-outlined text-[16px]">group</span>
                                                        <span>{getStudentCount(course).toLocaleString()} học viên</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-sm font-bold text-yellow-600">{course.avgRating || 0}</span>
                                                        <div className="flex text-yellow-500">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={`material-symbols-outlined ${i < Math.floor(course.avgRating || 0) ? 'fill' : ''} text-[14px]`}>star</span>
                                                            ))}
                                                        </div>
                                                        <span className="text-[12px] text-slate-400">({course.totalReviews || 0})</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-2 mt-4">
                                                        <span className="text-lg font-bold text-slate-900 dark:text-white">${course.price}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                    {/* Pagination */}
                    {totalPages > 1 && (
                    <nav className="flex items-center justify-center gap-2 mt-12 pb-12">
                        <button
                            onClick={() => safeCurrentPage > 1 && paginate(safeCurrentPage - 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            disabled={safeCurrentPage === 1}
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                                    safeCurrentPage === number
                                        ? 'bg-green-500 text-black shadow-sm hover:bg-green-600'
                                        : 'bg-white dark:bg-slate-900 text-primary border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => safeCurrentPage < totalPages && paginate(safeCurrentPage + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            disabled={safeCurrentPage >= totalPages}
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </nav>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Courses;
