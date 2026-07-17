const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { clientUrl } = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');
const groupRoutes = require("./routes/group.routes");
const expenseRoutes = require("./routes/expense.routes");
const balanceRoutes = require("./routes/balance.routes");
const settlementRoutes = require("./routes/settlement.routes");
const activityRoutes = require("./routes/activity.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

const allowedOrigins = new Set([clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173']);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'SplitMate API is running.' });
});

app.use('/api/auth', authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api", balanceRoutes);
app.use("/api/settlements", settlementRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);

module.exports = app;
