import api from './axios';

export const getProviderBookings = async () => {
    try {
        const response = await api.get('/bookings/provider');
        return response.data;
    } catch (error) {
        console.error("Error fetching provider bookings:", error);
        return { success: false, error: error.message };
    }
};

export const updateBookingStatus = async (id, status) => {
    try {
        const response = await api.put(`/bookings/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating booking status:", error);
        return { success: false, error: error.message };
    }
};
