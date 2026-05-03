

import React from 'react';
import { useTranslation } from 'react-i18next';
// hien thi de bai va o nhap cau tra loi cho assignment.
const AssignmentLessonContent = ({ activeLesson, assignmentAnswer, setAssignmentAnswer }) => {
    const { t } = useTranslation();

    if (!activeLesson) return null;

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-200">
                <p className="font-bold">{t('detail.assignmentPromptTitle')}</p>
                <p className="mt-2 whitespace-pre-line">{activeLesson.content}</p>
            </div>
            <textarea
                rows="7"
                value={assignmentAnswer}
                onChange={(event) => setAssignmentAnswer(event.target.value)}
                placeholder={t('detail.assignmentPlaceholder')}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
            />
        </div>
    );
};

export default AssignmentLessonContent;