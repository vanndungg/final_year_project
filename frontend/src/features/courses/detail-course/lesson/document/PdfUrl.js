

import { useEffect, useRef, useState } from 'react';
// tao url pdf tu resourceUrl cua lesson document.
const getPdfUrlFromLesson = (lesson) => {
    if (lesson?.lessonType !== 'document' || !lesson?.resourceUrl) {
        return { url: null, shouldRevoke: false };
    }

    const raw = lesson.resourceUrl;

    if (!raw.startsWith('data:')) {
        return { url: raw, shouldRevoke: false };
    }

    try {
        const [header, base64] = raw.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || 'application/pdf';
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }

        const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
        return { url: blobUrl, shouldRevoke: true };
    } catch {
        return { url: null, shouldRevoke: false };
    }
};

// quan ly blob url pdf va tu dong giai phong bo nho khi doi lesson.
export default function usePdfLessonUrl(activeLesson) {
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const previousBlobUrl = useRef(null);

    useEffect(() => {
        if (previousBlobUrl.current) {
            URL.revokeObjectURL(previousBlobUrl.current);
            previousBlobUrl.current = null;
        }

        const { url, shouldRevoke } = getPdfUrlFromLesson(activeLesson);
        previousBlobUrl.current = shouldRevoke ? url : null;
        setPdfBlobUrl(url);

        return () => {
            if (previousBlobUrl.current) {
                URL.revokeObjectURL(previousBlobUrl.current);
                previousBlobUrl.current = null;
            }
        };
    }, [activeLesson]);

    return pdfBlobUrl;
}