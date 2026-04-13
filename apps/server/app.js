require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Allow secure communication with the React frontend
app.use(
  cors({
    origin: 'https://www.ucenpulse.com',
    credentials: true,
  })
);

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API health check successful',
  });
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Create tables if they do not exist
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();