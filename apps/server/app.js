require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');

const app = express();
app.use(express.json());

// Health check routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UCEN Pulse API is running',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API health check successful',
  });
});

const PORT = process.env.PORT || 3001;

// Start server after testing database connection
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
}

startServer();