import React from 'react';

const VideoLessonContent = ({ activeLesson, getYoutubeEmbedUrl }) => {
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
                <p className="text-sm text-slate-500">Video hien chua san sang.</p>
            )}
        </div>
    );
};

export default VideoLessonContent;
