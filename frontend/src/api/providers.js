import api from './axios';

// Get logged-in provider's own profile
export const getMyProviderProfile = async () => {
    try {
        const response = await api.get('/providers/me');
        return response.data;
    } catch (error) {
        console.error("Error fetching provider profile:", error);
        return { success: false, error: error.message };
    }
};

// Update provider bio (accepts FormData)
export const updateProviderBio = async (formData) => {
    try {
        const response = await api.put('/providers/me/bio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating provider bio:", error);
        return { success: false, error: error.message };
    }
};

// Update provider services
export const updateProviderServices = async (data) => {
    try {
        const response = await api.put('/providers/me/services', data);
        return response.data;
    } catch (error) {
        console.error("Error updating provider services:", error);
        return { success: false, error: error.message };
    }
};

// Get provider details by user ID
export const getProviderByUserId = async (userId) => {
    try {
        const response = await api.get(`/providers/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching provider by user ID:", error);
        return { success: false, error: error.message };
    }
};

// Get providers by service ID (Public)
export const getProvidersByService = async (serviceId) => {
    try {
        const response = await api.get(`/providers/service/${serviceId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching providers for service:", error);
        return { success: false, error: error.message };
    }
};

// Get all verified providers (Public)
export const getAllVerifiedProviders = async () => {
    try {
        const response = await api.get('/providers');
        return response.data;
    } catch (error) {
        console.error("Error fetching all verified providers:", error);
        return { success: false, error: error.message };
    }
};

// Delete provider document
export const deleteProviderDocument = async (data) => {
    try {
        const response = await api.post('/providers/delete-document', data);
        return response.data;
    } catch (error) {
        console.error("Error deleting provider document:", error);
        return { success: false, error: error.message };
    }
};
