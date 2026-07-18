import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    settlements: [],
};

const settlementSlice = createSlice({
    name: "settlements",
    initialState,
    reducers: {
        setSettlements: (state, action) => {
            state.settlements = action.payload;
        },

        addSettlement: (state, action) => {
            state.settlements.unshift(action.payload);
        },

        updateSettlement: (state, action) => {
            const index = state.settlements.findIndex(
                settlement => settlement._id === action.payload._id
            );

            if (index !== -1) {
                state.settlements[index] = action.payload;
            }
        },

        removeSettlement: (state, action) => {
            state.settlements = state.settlements.filter(
                settlement => settlement._id !== action.payload
            );
        },

        clearSettlements: (state) => {
            state.settlements = [];
        },
    },
});

export const {
    setSettlements,
    addSettlement,
    updateSettlement,
    removeSettlement,
    clearSettlements,
} = settlementSlice.actions;

export default settlementSlice.reducer;