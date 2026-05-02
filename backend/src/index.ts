import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import chatRouter from './routes/chat';
import voiceRouter from './routes/voice';
import placesRouter from './routes/places';
import businessesRouter from './routes/businesses';
import preferencesRouter from './routes/preferences';
import authRouter from './routes/auth';
import conciergeRouter from './routes/concierge';
import { clearResponseCache, getCacheStats, getBatchProcessorStats } from './services/gemini';
import { testConnection, getOrCreateDemoUser } from './db';
import { seedPlaces, seedBusinesses } from './db/seed';

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://imboninkigali.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: origin not allowed'));
    }
  },
  credentials: true,
}));

// Logging
app.use(morgan('dev'));

// Detailed request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('  URL:', req.originalUrl);
  console.log('  Origin:', req.get('origin'));
  console.log('  Host:', req.get('host'));
  console.log('  User-Agent:', req.get('user-agent')?.substring(0, 100));
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Chat rate limit exceeded. Please wait a moment.' },
});

const voiceLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 8,
  message: { error: 'Voice transcription rate limit exceeded. Please try again in a few minutes.' },
});

// Routes
app.use('/api/chat', chatLimiter, chatRouter);
app.use('/api/voice', voiceLimiter, voiceRouter);
app.use('/api/places', placesRouter);
app.use('/api/businesses', businessesRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/auth', authRouter);
app.use('/api/concierge', conciergeRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    name: 'Imboni API',
  });
});

// Admin routes for cache management
app.get('/admin/cache/stats', (req, res) => {
  const cacheStats = getCacheStats();
  const batchStats = getBatchProcessorStats();
  res.json({
    cache: cacheStats,
    batchProcessor: batchStats,
    timestamp: new Date().toISOString()
  });
});

app.post('/admin/cache/clear', (req, res) => {
  clearResponseCache();
  res.json({ message: 'Cache cleared successfully' });
});

// 404 handler with detailed logging
app.use((req, res) => {
  const errorDetails = {
    error: 'Route not found',
    timestamp: new Date().toISOString(),
    request: {
      method: req.method,
      path: req.path,
      fullUrl: req.originalUrl,
      query: req.query,
      headers: {
        host: req.get('host'),
        origin: req.get('origin'),
        'content-type': req.get('content-type'),
      },
    },
    server: {
      env: process.env.NODE_ENV,
      backend_url: process.env.BACKEND_URL || 'not set',
      frontend_url: process.env.FRONTEND_URL || 'not set',
    },
    available_routes: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'PUT /api/auth/profile',
      'DELETE /api/auth/profile',
      'POST /api/chat',
      'POST /api/voice',
      'GET /api/places',
      'GET /api/businesses/hidden',
      'POST /api/businesses/register',
      'POST /api/preferences',
      'POST /api/concierge/recommend',
      'POST /api/concierge/quick',
      'GET /api/concierge/trending',
    ],
  };

  console.error('404 Not Found:', JSON.stringify(errorDetails, null, 2));
  res.status(404).json(errorDetails);
});

// Error handler with detailed logging
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errorDetails = {
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    request: {
      method: req.method,
      path: req.path,
      fullUrl: req.originalUrl,
    },
    errorStack: err.stack,
    errorType: err.constructor.name,
  };

  console.error('500 Server Error:', JSON.stringify(errorDetails, null, 2));
  res.status(500).json(errorDetails);
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🌍 Imboni API running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Frontend URL (CORS): ${process.env.FRONTEND_URL || 'not set'}`);
  console.log(`📋 Available API routes:`);
  console.log(`   - POST /api/auth/register, /api/auth/login`);
  console.log(`   - GET /api/auth/profile (with userId param)`);
  console.log(`   - PUT /api/auth/profile, DELETE /api/auth/profile`);
  console.log(`   - POST /api/chat, /api/voice, /api/preferences`);
  console.log(`   - GET /api/places, /api/businesses/hidden`);
  console.log(`   - POST /api/businesses/register`);
  console.log(`   - POST/GET /api/concierge/recommend, /api/concierge/quick, /api/concierge/trending`);
  
  try {
    await testConnection();
    console.log('✅ Database connected');
    
    // Seed database
    await getOrCreateDemoUser();
    await seedPlaces();
    console.log('✅ Database seeded');
    
    console.log(`\n✅ Ready to serve requests!\n`);
  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
});

export default app;
