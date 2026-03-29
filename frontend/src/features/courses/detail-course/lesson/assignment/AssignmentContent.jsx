import React from 'react';

const AssignmentLessonContent = ({ activeLesson, assignmentAnswer, setAssignmentAnswer }) => {
    if (!activeLesson) return null;

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-200">
                <p className="font-bold">De bai</p>
                <p className="mt-2 whitespace-pre-line">{activeLesson.content}</p>
            </div>
            <textarea
                rows="7"
                value={assignmentAnswer}
                onChange={(event) => setAssignmentAnswer(event.target.value)}
                placeholder="Nhap cau tra loi cua ban tai day..."
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
            />
        </div>
    );
};

export default AssignmentLessonContent;
