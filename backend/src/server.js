const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { siteDatabaseManager, testConnections } = require('./config/siteDatabase');
const authRoutes = require('./routes/auth');
const lookupRoutes = require('./routes/lookups');
const sitesRoutes = require('./routes/sites');
const siteManagementRoutes = require('./routes/site-management');
const siteOperationsRoutes = require('./routes/site-operations');
const siteIndicatorsRoutes = require('./routes/site-indicators');
const performanceRoutes = require('./routes/performance');
const optimizedIndicatorsRoutes = require('./routes/optimized-indicators');
const adultPatientRoutes = require('./routes/adultPatients');
const childPatientRoutes = require('./routes/childPatients');
const infantPatientRoutes = require('./routes/infantPatients');
const adultVisitRoutes = require('./routes/adultVisits');
const childVisitRoutes = require('./routes/childVisits');
const infantVisitRoutes = require('./routes/infantVisits');
const scriptDownloadRoutes = require('./routes/script-download');
const roleManagementRoutes = require('./routes/role-management');
const importRoutes = require('./routes/import');
const dataManagementRoutes = require('./routes/data-management');
const analyticsRoutes = require('./routes/analytics');
const cqiIndicatorsRoutes = require('./routes/cqi-indicators');
const mortalityRetentionIndicatorsRoutes = require('./routes/mortality-retention-indicators');
const adminRoutes = require('./routes/admin');
const labTestRoutes = require('./routes/lab-tests');
const patientTestRoutes = require('./routes/patientTests');
const infantTestRoutes = require('./routes/infantTests');
const reportsRoutes = require('./routes/reports');
const { router: userLogsRoutes } = require('./routes/user-logs');
const schedulerService = require('./services/scheduler');
const cqiSchedulerService = require('./services/cqiSchedulerService');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
      // Production domains
      'http://report.nchads.gov.kh',
      'https://report.nchads.gov.kh',
      'http://report.nchads.gov.kh:3001',
      'https://report.nchads.gov.kh:3001',
      'http://report.nchads.gov.kh:5173',
      'https://report.nchads.gov.kh:5173',
      // Development IPs
      'http://192.168.0.119:5173',  // Your current IP
      'http://192.168.0.119:5174',  // Your current IP with port 5174
      'http://192.168.0.119:3000',  // Your current IP with port 3000
      'http://192.168.0.119:3001',  // Your current IP with backend port
      'http://192.168.1.120:5173',  // Previous IP
      'http://192.168.1.120:5174',  // Previous IP with port 5174
      'http://192.168.0.120:5173',
      'http://192.168.0.120:5174',
      /^http:\/\/192\.168\.\d+\.\d+:5173$/,
      /^http:\/\/192\.168\.\d+\.\d+:5174$/,
      /^http:\/\/192\.168\.\d+\.\d+:3000$/,
      /^http:\/\/192\.168\.\d+\.\d+:3001$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:5174$/,
      /^http:\/\/172\.\d+\.\d+\.\d+:5173$/,
      /^http:\/\/172\.\d+\.\d+\.\d+:5174$/
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io globally available for analytics logging
global.io = io;
const PORT = process.env.PORT || 3001;

// CORS configuration - MUST be before other middleware
// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',  // Current local port
    // Production domains
    'http://report.nchads.gov.kh',
    'https://report.nchads.gov.kh',
    'http://report.nchads.gov.kh:3001',
    'https://report.nchads.gov.kh:3001',
    'http://report.nchads.gov.kh:5173',
    'https://report.nchads.gov.kh:5173',
    // Development IPs
    'http://192.168.1.120:5173',
    'http://192.168.0.119:5173',
    'http://192.168.1.151:5174',  // Your actual current IP
    'http://192.168.1.120:5174',  // Your actual current IP with port 5174
    'http://192.168.0.120:5173',  // Previous IP
    'http://192.168.0.120:5174',  // Previous IP with port 5174
    'http://192.168.1.249:5174',  // Previous network IP and port
    'http://192.168.1.249:5173',  // Previous network IP with default port
    'http://192.168.10.205:5173',
    'http://192.168.0.146:5173',  // Fixed port
    'http://192.168.0.146:5174',
    'http://192.168.0.63:5173',  // Previous server IP
    'http://192.168.0.63:3000', 
    'http://172.20.10.5:5173', // Alternative port
    /^http:\/\/192\.168\.\d+\.\d+:5173$/,  // Allow any device on 192.168.x.x network
    /^http:\/\/192\.168\.\d+\.\d+:5174$/,  // Allow any device on 192.168.x.x network with port 5174
    /^http:\/\/192\.168\.\d+\.\d+:3000$/,   // Allow any device on 192.168.x.x network
    /^http:\/\/192\.168\.\d+\.\d+:3001$/,   // Allow backend port on 192.168.x.x network
    /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,    // Allow any device on 10.x.x.x network
    /^http:\/\/10\.\d+\.\d+\.\d+:5174$/,    // Allow any device on 10.x.x.x network with port 5174
    /^http:\/\/172\.\d+\.\d+\.\d+:5173$/,   // Allow any device on 172.x.x.x network
    /^http:\/\/172\.\d+\.\d+\.\d+:5174$/    // Allow any device on 172.x.x.x network with port 5174
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma', 'Expires'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

// Security middleware - after CORS
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Disable to allow CORS
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(compression());

// Rate limiting - temporarily disabled for testing
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/apiv1/auth', authRoutes);
app.use('/apiv1/lookups', lookupRoutes);
app.use('/apiv1/sites', sitesRoutes);
app.use('/apiv1/site-management', siteManagementRoutes);
app.use('/apiv1/site-operations', siteOperationsRoutes);
app.use('/apiv1/site-indicators', siteIndicatorsRoutes);
app.use('/apiv1/performance', performanceRoutes);
app.use('/apiv1/indicators-optimized', optimizedIndicatorsRoutes);
app.use('/apiv1/data', importRoutes);
app.use('/apiv1/patients/adult', adultPatientRoutes);
app.use('/apiv1/patients/child', childPatientRoutes);
app.use('/apiv1/patients/infant', infantPatientRoutes);
app.use('/apiv1/visits/adult', adultVisitRoutes);
app.use('/apiv1/visits/child', childVisitRoutes);
app.use('/apiv1/visits/infant', infantVisitRoutes);
app.use('/apiv1/scripts', scriptDownloadRoutes);
app.use('/apiv1/roles', roleManagementRoutes);
app.use('/apiv1/import', importRoutes);
app.use('/apiv1/data', dataManagementRoutes);
app.use('/apiv1/analytics', analyticsRoutes);
app.use('/apiv1/cqi-indicators', cqiIndicatorsRoutes);
app.use('/apiv1/mortality-retention-indicators', mortalityRetentionIndicatorsRoutes);
app.use('/apiv1/admin', adminRoutes);
app.use('/apiv1/lab-tests', labTestRoutes);
app.use('/apiv1/patient-tests', patientTestRoutes);
app.use('/apiv1/infant-tests', infantTestRoutes);
app.use('/apiv1/reports', reportsRoutes);
app.use('/apiv1', userLogsRoutes);

// Make io available to routes
app.set('io', io);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
  
  // Join aggregation room for real-time updates
  socket.on('join-aggregation', (data) => {
    socket.join('aggregation');
    console.log(`📊 Client ${socket.id} joined aggregation room`);
  });
  
  socket.on('leave-aggregation', () => {
    socket.leave('aggregation');
    console.log(`📊 Client ${socket.id} left aggregation room`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
const startServer = async () => {
  try {
    // Test both old and new database connections
    await testConnection();
    await testConnections();
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      
      // Start analytics scheduler
      schedulerService.start();
      console.log(`📅 Analytics scheduler started`);
      
      // Initialize CQI scheduler
      try {
        cqiSchedulerService.initialize();
        console.log(`📊 CQI scheduler initialized`);
      } catch (error) {
        console.error('⚠️ Failed to initialize CQI scheduler:', error);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
