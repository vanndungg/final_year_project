

import React from 'react';
import { useTranslation } from 'react-i18next';
// hien thi video upload, youtube hoac video url cua lesson.
const VideoLessonContent = ({ activeLesson, getYoutubeEmbedUrl }) => {
    const { t } = useTranslation();

    if (!activeLesson) return null;

    const youtubeEmbedUrl = getYoutubeEmbedUrl(activeLesson);

    return (
        <div className="space-y-4">
            {activeLesson.videoUploadData ? (
                <video controls className="w-full rounded-xl bg-black" src={activeLesson.videoUploadData} />
            ) : youtubeEmbedUrl ? (
                <div className="aspect-video overflow-hidden rounded-xl">
                    <iframe
                        title={activeLesson.title}
                        src={youtubeEmbedUrl}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            ) : activeLesson.videoUrl ? (
                <video controls className="w-full rounded-xl bg-black" src={activeLesson.videoUrl} />
            ) : (
                <p className="text-sm text-slate-500">{t('detail.videoNotReady')}</p>
            )}
        </div>
    );
};

export default VideoLessonContent;