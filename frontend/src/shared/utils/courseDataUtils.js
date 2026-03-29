// lay tong so hoc vien tu nhieu kieu du lieu khoa hoc khac nhau.
export const getStudentCount = (course) => {
    const numericCandidates = [
        course?.studentCount,
        course?.studentsEnrolled,
        course?.totalStudents,
        course?.enrolledCount,
        course?.enrolled
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
// lay tong so bai hoc tu nhieu kieu du lieu khoa hoc khac nhau.
export const getLessonCount = (course) => {
    const numericCandidates = [course?.lessonCount, course?.lessonsCount, course?.totalLessons];

    for (const value of numericCandidates) {
        if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
            return Number(value);
        }
    }

    if (Array.isArray(course?.lessons)) return course.lessons.length;
    return 0;
};
// chuan hoa trang thai khoa hoc ve publish hoac draft.
export const normalizeCourseStatus = (statusValue) => {
    const normalizedStatus = String(statusValue || '').trim().toLowerCase();

    if (normalizedStatus === 'draft') return 'draft';
    if (normalizedStatus === 'published') return 'publish';
    if (normalizedStatus === 'publish') return 'publish';
    return 'publish';
};