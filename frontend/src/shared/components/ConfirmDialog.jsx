import React, { useContext } from 'react';
import { GlobalState } from '../../app/providers/GlobalState';

const ConfirmDialog = () => {
    const state = useContext(GlobalState);
    const [confirmDialog = {}] = state?.confirmDialog || [{}];

    if (!confirmDialog.isOpen) {
        return null;
    }

    const { title = 'Xác nhận', message = '', onConfirm = () => {}, onCancel = () => {} } = confirmDialog;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
            <div className="w-96 rounded-2xl bg-white p-6 shadow-2xl">
                <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>
                <p className="mb-6 text-sm text-gray-600">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="rounded-lg bg-gray-200 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-300"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
