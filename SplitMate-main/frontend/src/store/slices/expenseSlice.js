import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    expenses: [],
};

const expenseSlice = createSlice({
    name: "expenses",
    initialState,
    reducers: {
        setExpenses: (state, action) => {
            state.expenses = action.payload;
        },

        addExpense: (state, action) => {
            state.expenses.unshift(action.payload);
        },

        updateExpense: (state, action) => {
            const index = state.expenses.findIndex(
                expense => expense._id === action.payload._id
            );

            if (index !== -1) {
                state.expenses[index] = action.payload;
            }
        },

        removeExpense: (state, action) => {
            state.expenses = state.expenses.filter(
                expense => expense._id !== action.payload
            );
        },

        clearExpenses: (state) => {
            state.expenses = [];
        },
    },
});

export const {
    setExpenses,
    addExpense,
    updateExpense,
    removeExpense,
    clearExpenses,
} = expenseSlice.actions;

export default expenseSlice.reducer;