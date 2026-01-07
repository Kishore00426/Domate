import api from './axios';

export const getAddresses = async () => {
    const response = await api.get('/user/addresses');
    return response.data;
};

export const addAddress = async (addressData) => {
    const response = await api.post('/user/addresses', addressData);
    return response.data;
};

export const updateAddress = async (id, addressData) => {
    const response = await api.put(`/user/addresses/${id}`, addressData);
    return response.data;
};

export const deleteAddress = async (id) => {
    const response = await api.delete(`/user/addresses/${id}`);
    return response.data;
};
