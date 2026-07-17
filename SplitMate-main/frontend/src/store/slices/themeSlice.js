import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    mode: localStorage.getItem('splitmate-theme') || 'dark',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme(state) {
            state.mode = state.mode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('splitmate-theme', state.mode);
        },

        setTheme(state, action) {
            state.mode = action.payload;
            localStorage.setItem('splitmate-theme', action.payload);
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
