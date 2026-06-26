const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  skip: () => process.env.NODE_ENV !== 'production' // Skip rate limiting in development mode
});
app.use('/api', limiter);

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const buildingsRoutes = require('./modules/buildings/buildings.routes');
const apartmentsRoutes = require('./modules/apartments/apartments.routes');
const residentsRoutes = require('./modules/residents/residents.routes');
const staffRoutes = require('./modules/staff/staff.routes');
const documentsRoutes = require('./modules/documents/documents.routes');
const requestsRoutes = require('./modules/requests/requests.routes');
const visitorsRoutes = require('./modules/visitors/visitors.routes');
const announcementsRoutes = require('./modules/announcements/announcements.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingsRoutes);
app.use('/api/apartments', apartmentsRoutes);
app.use('/api/residents', residentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/visitors', visitorsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Swagger Documentation Setup
const setupSwagger = require('./docs/swagger');
setupSwagger(app);


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error ', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
  });
});

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;
