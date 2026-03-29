import React from 'react';

const DocumentLessonContent = ({ activeLesson, pdfBlobUrl }) => {
    if (!activeLesson) return null;

    return (
        <div className="space-y-4">
            {pdfBlobUrl ? (
                <div className="space-y-3">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                        <iframe
                            title={activeLesson.title}
                            src={`${pdfBlobUrl}#navpanes=0&toolbar=1&scrollbar=1`}
                            className="h-[70vh] w-full"
                        />
                    </div>
                    <a
                        href={pdfBlobUrl}
                        download={activeLesson.title + '.pdf'}
                        className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined mr-2 text-[18px]">download</span>
                        Tai xuong PDF
                    </a>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="prose max-w-none text-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: String(activeLesson.content || '') }} />
                </div>
            )}
        </div>
    );
};

export default DocumentLessonContent;
