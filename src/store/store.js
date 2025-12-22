import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import servicesReducer from './servicesSlice';

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        services: servicesReducer,
    },
});
