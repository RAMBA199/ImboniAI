import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import chatRouter from './routes/chat';
import voiceRouter from './routes/voice';
import placesRouter from './routes/places';
import businessesRouter from './routes/businesses';
import preferencesRouter from './routes/preferences';
import authRouter from './routes/auth';
import { clearResponseCache, getCacheStats, getBatchProcessorStats } from './services/gemini';
import { testConnection, getOrCreateDemoUser } from './db';
import { seedPlaces, seedBusinesses } from './db/seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL,
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🌍 Imboni API running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
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
