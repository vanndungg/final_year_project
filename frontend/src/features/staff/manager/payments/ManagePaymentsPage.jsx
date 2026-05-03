

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalState } from '../../../../app/providers/GlobalState';
import axiosClient from '../../../../shared/api/axiosClient';
import { toast } from 'react-toastify';
import AdminPanelLayout from '../../pages/AdminPanelLayout';
// dinh dang so tien payment de hien thi trong bang.
const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
// hien thi danh sach giao dich thanh toan thanh cong.
const ManagePayments = () => {
    const { t } = useTranslation();
    const state = useContext(GlobalState);
    const [token = ''] = state?.token || [''];
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // tai danh sach payment da thanh toan thanh cong.
        const fetchSuccessfulPayments = async () => {
            if (!token) return;

            setLoading(true);
            try {
                const res = await axiosClient.get('/users/successful_payments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayments(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                toast.error(err.response?.data?.msg || t('admin.unableReloadPayments'));
            } finally {
                setLoading(false);
            }
        };

        fetchSuccessfulPayments();
    }, [token]);

    const totalRevenue = useMemo(
        () => payments.reduce((sum, item) => sum + Number(item?.total || 0), 0),
        [payments]
    );

    return (
        <AdminPanelLayout>
            <div className="p-8 space-y-6">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('admin.successfulPayments')}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {t('admin.trackSuccessfulTransactions')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{t('admin.totalRevenue')}</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatVnd(totalRevenue)}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.time')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.student')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.course')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.gateway')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.transactionId')}</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('admin.amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">{t('admin.loadingData')}</td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">{t('admin.noSuccessfulPayments')}</td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {payment.paidAt ? new Date(payment.paidAt).toLocaleString('vi-VN') : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{payment.name || t('admin.student')}</p>
                                                <p className="text-xs text-slate-500">{payment.email || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                                                {(payment.courseItems || []).length > 0
                                                    ? payment.courseItems.map((item) => item?.title).filter(Boolean).join(', ')
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{payment.gateway || t('common.na')}</td>
                                            <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                                                <p className="font-mono">{payment.paymentCode || payment.paymentID || '-'}</p>
                                                <p className="font-mono">{payment.referenceCode || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatVnd(payment.total)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminPanelLayout>
    );
};

export default ManagePayments;