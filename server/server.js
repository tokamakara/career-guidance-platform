const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Route imports with error handling
let authRoutes, adminRoutes, instituteRoutes, studentRoutes, companyRoutes, jobRoutes, applicationRoutes;

try {
  authRoutes = require('./routes/authRoutes');
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
  process.exit(1);
}

try {
  adminRoutes = require('./routes/adminRoutes');
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error.message);
  process.exit(1);
}

try {
  instituteRoutes = require('./routes/instituteRoutes');
  console.log('✅ Institute routes loaded');
} catch (error) {
  console.error('❌ Failed to load institute routes:', error.message);
  console.error('❌ Error stack:', error.stack);
  process.exit(1);
}

try {
  studentRoutes = require('./routes/studentRoutes');
  console.log('✅ Student routes loaded');
} catch (error) {
  console.error('❌ Failed to load student routes:', error.message);
  process.exit(1);
}

try {
  companyRoutes = require('./routes/companyRoutes');
  console.log('✅ Company routes loaded');
} catch (error) {
  console.error('❌ Failed to load company routes:', error.message);
  process.exit(1);
}

try {
  jobRoutes = require('./routes/jobRoutes');
  console.log('✅ Job routes loaded');
} catch (error) {
  console.error('❌ Failed to load job routes:', error.message);
  process.exit(1);
}

try {
  applicationRoutes = require('./routes/applicationRoutes');
  console.log('✅ Application routes loaded');
} catch (error) {
  console.error('❌ Failed to load application routes:', error.message);
  process.exit(1);
}

const app = express();

// Trust proxy for Render.com (required for rate limiting behind proxy)
app.set('trust proxy', 1);

// Middlewares
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'https://career-guidance-frontend-96nv.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Career Guidance Platform API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Career Guidance Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api-docs'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Career Guidance Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API root route
app.get('/api', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Career Guidance Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      student: '/api/student',
      company: '/api/company',
      institute: '/api/institute',
      jobs: '/api/jobs',
      applications: '/api/applications',
      docs: '/api-docs'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Check email configuration on startup (non-blocking)
try {
  const emailService = require('./utils/emailService');
  setTimeout(() => {
    if (!emailService.isConfigured) {
      console.warn('');
      console.warn('⚠️  ════════════════════════════════════════════════════════════');
      console.warn('⚠️  EMAIL SERVICE NOT CONFIGURED');
      console.warn('⚠️  ════════════════════════════════════════════════════════════');
      console.warn('⚠️  Verification emails will NOT be sent.');
      console.warn('⚠️  Please set the following environment variables:');
      console.warn('⚠️    - EMAIL_USER (your Gmail address)');
      console.warn('⚠️    - EMAIL_PASS (Gmail App Password)');
      console.warn('⚠️  ════════════════════════════════════════════════════════════');
      console.warn('');
    } else {
      console.log('✅ Email service is configured and ready');
    }
  }, 2000); // Wait 2 seconds for email service to verify
} catch (error) {
  console.warn('⚠️  Email service initialization warning (non-critical):', error.message);
  console.warn('⚠️  Server will continue without email functionality');
}

// Start server with error handling
try {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Career Guidance Platform API`);
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`🌐 Allowed CORS Origins:`);
    allowedOrigins.forEach(origin => {
      console.log(`   ✓ ${origin}`);
    });
    if (NODE_ENV === 'development') {
      console.log(`💡 Local development mode - Frontend should connect to: http://localhost:${PORT}/api`);
    }
    console.log('');
    console.log('✅ Server is ready to accept requests');
  });

  // Handle server errors
  app.on('error', (error) => {
    console.error('❌ Server error:', error);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.error('Stack:', error.stack);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
  });

} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}

module.exports = app;