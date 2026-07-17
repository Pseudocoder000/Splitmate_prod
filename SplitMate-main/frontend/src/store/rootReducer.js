import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
// import groupReducer from './slices/groupSlice';
// import expenseReducer from './slices/expenseSlice';
// import activityReducer from './slices/activitySlice';
// import settlementReducer from './slices/settlementSlice';
import themeReducer from './slices/themeSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
    // groups: groupReducer,
    // expenses: expenseReducer,
    // activities: activityReducer,
    // settlements: settlementReducer,
    theme: themeReducer,
});

export default rootReducer;
