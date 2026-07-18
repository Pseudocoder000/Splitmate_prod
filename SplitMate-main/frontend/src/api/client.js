import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL || '';

const api = axios.create({
    baseURL: `${baseUrl}/api`.replace(/([^:]\/)\/{2,}/g, '$1/'),
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;