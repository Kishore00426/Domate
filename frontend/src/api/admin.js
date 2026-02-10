import adminApi from './adminAxios';

// --- Categories ---
export const getCategories = async () => {
    const response = await adminApi.get('/admin/categories');
    return response.data;
};

export const createCategory = async (formData) => {
    // Expects FormData if image is included, otherwise JSON
    // If formData is an instance of FormData, axios sets Content-Type automatically
    const response = await adminApi.post('/admin/categories', formData, {
        headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
};

export const updateCategory = async (id, formData) => {
    const response = await adminApi.put(`/admin/categories/${id}`, formData, {
        headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await adminApi.delete(`/admin/categories/${id}`);
    return response.data;
};

// --- Subcategories ---
export const getSubcategories = async () => {
    const response = await adminApi.get('/admin/subcategories');
    return response.data;
};

export const createSubcategory = async (formData) => {
    const response = await adminApi.post('/admin/subcategories', formData, {
        headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
};

export const updateSubcategory = async (id, formData) => {
    const response = await adminApi.put(`/admin/subcategories/${id}`, formData, {
        headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
};

export const deleteSubcategory = async (id) => {
    const response = await adminApi.delete(`/admin/subcategories/${id}`);
    return response.data;
};

export const linkSubcategory = async (categoryId, subcategoryId) => {
    const response = await adminApi.post('/admin/categories/link-subcategory', { categoryId, subcategoryId });
    return response.data;
};

// --- Bookings ---
export const getAllBookings = async () => {
    const response = await adminApi.get('/admin/bookings');
    return response.data;
};

// --- Dashboard ---
export const getDashboardStats = async () => {
    const response = await adminApi.get('/admin/stats');
    return response.data;
};

// --- User Management ---
export const getUsers = async () => {
    const response = await adminApi.get('/admin/users');
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await adminApi.delete(`/admin/users/${id}`);
    return response.data;
};

// --- Provider Verification ---
export const getPendingProviders = async () => {
    const response = await adminApi.get('/admin/providers/pending');
    return response.data;
};

export const verifyProvider = async (id, action) => {
    // action: 'approve' or 'reject'
    const response = await adminApi.post(`/admin/providers/${id}/verify`, { action });
    return response.data;
};

// --- Services ---
export const getServices = async () => {
    const response = await adminApi.get('/admin/services');
    return response.data;
};

export const createService = async (formData) => {
    const response = await adminApi.post('/admin/services', formData, {
        headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
};

export const updateService = async (id, formData) => {
    const response = await adminApi.put(`/admin/services/${id}`, formData, {
        headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
};

export const deleteService = async (id) => {
    const response = await adminApi.delete(`/admin/services/${id}`);
    return response.data;
};
