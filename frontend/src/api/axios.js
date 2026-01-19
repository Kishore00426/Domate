import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_TARGET}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login (optional, but good UX)
            // Note: We can't use useNavigate here as this is not a 
            // React component
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
