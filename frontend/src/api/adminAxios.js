import axios from 'axios';

const adminApi = axios.create({
    baseURL: `${import.meta.env.VITE_API_TARGET}/api`, // Use environment variable!
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the admin token
adminApi.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default adminApi;
