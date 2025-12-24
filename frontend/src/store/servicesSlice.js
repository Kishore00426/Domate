import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [
    { id: 1, name: 'House Cleaning', category: 'Cleaning' },
    { id: 2, name: 'Plumbing Repair', category: 'Plumbing' },
    { id: 3, name: 'Electrical Wiring', category: 'Electrical' },
    { id: 4, name: 'Interior Painting', category: 'Painting' },
    { id: 5, name: 'Furniture Assembly', category: 'Carpentry' },
  ],
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Add reducers here if we need to modify services later
  },
});

export default servicesSlice.reducer;
