import api from './axios';

export const getCategoryDetails = async (name) => {
    try {
        const response = await api.get(`/services/categories/${encodeURIComponent(name)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching category details:", error);
        return { success: false, error: error.message };
    }
};
