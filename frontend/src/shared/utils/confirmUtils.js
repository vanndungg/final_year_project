// Utility function để show confirm dialog
export const showConfirm = (setConfirmDialog, { title = 'Xác nhận', message = 'Bạn có chắc chắn không?' }) => {
    return new Promise((resolve) => {
        setConfirmDialog({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                resolve(true);
            },
            onCancel: () => {
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                resolve(false);
            }
        });
    });
};
