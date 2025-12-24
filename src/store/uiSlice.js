import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isSearchModalOpen: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openSearchModal: (state) => {
            state.isSearchModalOpen = true;
        },
        closeSearchModal: (state) => {
            state.isSearchModalOpen = false;
        },
    },
});

export const { openSearchModal, closeSearchModal } = uiSlice.actions;
export default uiSlice.reducer;
