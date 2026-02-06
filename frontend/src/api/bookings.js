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

export const updateBookingStatus = async (id, status, message) => {
    try {
        const payload = { status };
        if (message) payload.message = message;
        const response = await api.put(`/bookings/${id}/status`, payload);
        return response.data;
    } catch (error) {
        console.error("Error updating booking status:", error);
        return {
            success: false,
            error: error.response?.data?.error || error.message || "Failed to update status"
        };
    }
};


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

export const getProviderContact = async (bookingId) => {
    try {
        const response = await api.get(`/bookings/${bookingId}/contact`);
        return response.data;
    } catch (error) {
        console.error("Error fetching provider contact:", error);
        return { success: false, error: error.response?.data?.error || "Failed to fetch contact details" };
    }
};

export const deleteBooking = async (bookingId) => {
    try {
        const response = await api.delete(`/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting booking:", error);
        return { success: false, error: error.response?.data?.error || "Failed to delete booking" };
    }
};

export const completeBooking = async (bookingId, invoiceData) => {
    try {
        const response = await api.post(`/bookings/${bookingId}/complete`, invoiceData);
        return response.data;
    } catch (error) {
        console.error("Error completing booking:", error);
        return { success: false, error: error.response?.data?.error || "Failed to complete booking" };
    }
};

export const rateBooking = async (bookingId, reviewData) => {
    try {
        const response = await api.post(`/bookings/${bookingId}/rate`, reviewData);
        return response.data;
    } catch (error) {
        console.error("Error rating booking:", error);
        return { success: false, error: error.response?.data?.error || "Failed to rate booking" };
    }
};

export const confirmBooking = async (bookingId) => {
    try {
        const response = await api.put(`/bookings/${bookingId}/confirm`);
        return response.data;
    } catch (error) {
        console.error("Error confirming booking:", error);
        return { success: false, error: error.response?.data?.error || "Failed to confirm booking" };
    }
};

export const updateBookingDetails = async (id, data) => {
    try {
        const response = await api.put(`/bookings/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating booking details:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Failed to update booking"
        };
    }
};

export const updateBookingDetailsProvider = async (id, data) => {
    try {
        const response = await api.put(`/bookings/${id}/provider-update`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating provider booking details:", error);
        return {
            success: false,
            error: error.response?.data?.error || "Failed to update booking"
        };
    }
};
