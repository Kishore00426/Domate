import api from './axios';

export const getAllServices = async () => {
    try {
        const response = await api.get('/services');
        return response.data;
    } catch (error) {
        console.error("Error fetching all services:", error);
        return { success: false, error: error.message };
    }
};


export const getAllCategories = async () => {
    try {
        const response = await api.get('/services/categories');
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { success: false, error: error.message };
    }
};

export const getCategoryDetails = async (name) => {
    try {
        const response = await api.get(`/services/categories/${encodeURIComponent(name)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching category details:", error);
        return { success: false, error: error.message };
    }
};

export const getServiceById = async (id) => {
    try {
        const response = await api.get(`/services/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching service details:", error);
        return { success: false, error: error.message };
    }
};
