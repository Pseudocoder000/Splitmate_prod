import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';

export const fetchDashboard = createAsyncThunk(
    'dashboard/fetchDashboard',

    async (_, thunkAPI) => {
        try {
            const response = await api.get('/dashboard');

            return response.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error?.message || 'Failed to fetch dashboard'
            );
        }
    }
);

const initialState = {
    loading: false,

    error: null,

    summary: {
        totalGroups: 0,

        totalExpenses: 0,

        totalSpent: 0,

        youOwe: 0,

        youAreOwed: 0,

        netBalance: 0,
    },

    groups: [],

    recentExpenses: [],

    recentActivities: [],

    pendingBalances: [],
};

const dashboardSlice = createSlice({
    name: 'dashboard',

    initialState,

    reducers: {},

    extraReducers: (builder) => {
        builder

            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;

                state.error = null;
            })

            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;

                state.summary = action.payload.summary;

                state.groups = action.payload.groups;

                state.recentExpenses = action.payload.recentExpenses;

                state.recentActivities = action.payload.recentActivities;

                state.pendingBalances = action.payload.pendingBalances;
            })

            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;

                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;
