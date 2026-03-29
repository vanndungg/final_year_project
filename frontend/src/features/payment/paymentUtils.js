export const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export const gatewayResultRank = {
    cancel: 1,
    error: 2,
    success: 3
};