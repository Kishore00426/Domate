import api from './axios';

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const getMe = async () => {
    // Use /users/profile to get full profile including address
    const response = await api.get('/users/profile');
    return response.data;
};

export const updateProfile = async (userData) => {
    // Determine if we need to call specific user update routes
    // For now, let's assume we use the /users/profile-address endpoint
    const response = await api.put('/users/profile-address', userData);
    return response.data;
};
