require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');

require('./models/User');
require('./models/Activity');
require('./models/Metric');

const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const metricRoutes = require('./routes/metricRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'https://www.ucenpulse.com',
    credentials: true,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/metrics', metricRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API health check successful',
  });
});

module.exports = { app, sequelize };