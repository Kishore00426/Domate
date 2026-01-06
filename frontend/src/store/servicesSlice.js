import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllServices } from '../api/services';

// Async thunk to fetch services from the backend
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async () => {
    const response = await getAllServices();
    if (response.success) {
      return response.services;
    }
    throw new Error(response.error || 'Failed to fetch services');
  }
);

const initialState = {
  services: [],
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Add reducers here if we need to modify services later
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default servicesSlice.reducer;
