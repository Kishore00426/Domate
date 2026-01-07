import api from './axios';

export const getProviderBookings = async () => {
    try {
        const response = await api.get('/bookings/provider');
        return response.data;
    } catch (error) {
        console.error("Error fetching provider bookings:", error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || "Failed to fetch bookings"
        };
    }
};

export const updateBookingStatus = async (id, status) => {
    try {
        const response = await api.put(`/bookings/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating booking status:", error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || "Failed to update status"
        };
    }
};


// Create a new booking
export const createBooking = async (bookingData) => {
    try {
        const response = await api.post('/bookings', bookingData);
        return { success: true, booking: response.data.booking };
    } catch (error) {
        console.error("Error creating booking:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Failed to create booking"
        };
    }
};

// Get user's bookings
export const getUserBookings = async () => {
    try {
        const response = await api.get('/bookings/my');
        return { success: true, bookings: response.data.bookings };
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Failed to fetch bookings"
        };
    }
};
