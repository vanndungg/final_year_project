// dinh dang so tien theo don vi vnd de hien thi.
export const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

// quy doi muc uu tien cua ket qua tra ve tu cong thanh toan.
export const gatewayResultRank = {
    cancel: 1,
    error: 2,
    success: 3
};