import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    groups: [],
};

const groupSlice = createSlice({
    name: "groups",
    initialState,
    reducers: {
        setGroups: (state, action) => {
            state.groups = action.payload;
        },

        addGroup: (state, action) => {
            state.groups.unshift(action.payload);
        },

        updateGroup: (state, action) => {
            const index = state.groups.findIndex(
                group => group._id === action.payload._id
            );

            if (index !== -1) {
                state.groups[index] = action.payload;
            }
        },

        removeGroup: (state, action) => {
            state.groups = state.groups.filter(
                group => group._id !== action.payload
            );
        },

        clearGroups: (state) => {
            state.groups = [];
        },
    },
});

export const {
    setGroups,
    addGroup,
    updateGroup,
    removeGroup,
    clearGroups,
} = groupSlice.actions;

export default groupSlice.reducer;