import { useEffect, useState } from 'react';
import axiosClient from '../../shared/api/axiosClient';

export default function useProfileProgress(enrolledCourses, token) {
    const [progressByCourse, setProgressByCourse] = useState({});
    const [loadingProgress, setLoadingProgress] = useState(false);

    useEffect(() => {
        if (!token || enrolledCourses.length === 0) {
            setProgressByCourse({});
            return;
        }

        let alive = true;

        const fetchProgress = async () => {
            setLoadingProgress(true);
            try {
                const results = await Promise.all(
                    enrolledCourses.map(async (course) => {
                        const courseId = String(course?._id || '');
                        if (!courseId) return [courseId, null];

                        const res = await axiosClient.get(`/progress/${courseId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        return [courseId, res.data || null];
                    })
                );

                if (!alive) return;

                const nextMap = {};
                results.forEach(([courseId, data]) => {
                    if (!courseId) return;
                    nextMap[courseId] = {
                        progressPercent: Number(data?.progressPercent || 0),
                        completedCount: Number(data?.completedCount || 0),
                        totalLessons: Number(data?.totalLessons || 0)
                    };
                });

                setProgressByCourse(nextMap);
            } catch (error) {
                console.error('Khong the tai tien do profile:', error);
            } finally {
                if (alive) setLoadingProgress(false);
            }
        };

        fetchProgress();

        return () => {
            alive = false;
        };
    }, [enrolledCourses, token]);

    return { progressByCourse, loadingProgress };
}