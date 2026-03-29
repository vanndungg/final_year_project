import { useCallback } from 'react';
import axiosClient from '../../shared/api/axiosClient';

export default function useRefreshCurrentUser(token, setUser) {
    return useCallback(async () => {
        if (!token) return;

        try {
            const response = await axiosClient.get('/users/infor', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    }, [setUser, token]);
}