import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_TARGET}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
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

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is invalid or expired
            sessionStorage.clear();
            localStorage.removeItem('user');
            // Reload the page to trigger the auth checks in the Layout components
            // This will redirect the user to the appropriate login page
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
