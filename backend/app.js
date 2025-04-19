const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const artsyRoutes = require('./routes/artsy');
const genesRoutes = require('./routes/genes');
const notificationRoutes = require('./routes/notifications');

dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'ARTSY_CLIENT_ID', 'ARTSY_CLIENT_SECRET'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) throw new Error(`Missing required environment variable: ${varName}`);
});

const app = express();

app.use(cors({
    origin: 'https://artistsearch9898.wl.r.appspot.com',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/artsy', artsyRoutes);
app.use('/api/genes', genesRoutes);
app.use('/api/notifications', notificationRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public', 'dist', 'frontend')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dist', 'frontend', 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res) => {
    res.status(404).json({
      error: "Endpoint not found",
      debug: `Request path: ${req.path}`
    });
  });
}

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const response = {
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  };
  
  if (err.response?.data?.message) {
    response.error.details = err.response.data.message;
  }

  res.status(statusCode).json(response);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access URL: http://localhost:${PORT}`);
});

