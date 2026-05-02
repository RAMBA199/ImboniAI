import { Router, Request, Response } from 'express';
import { generateConciergeRecommendations } from '../services/concierge';

const router = Router();

interface ConciergeRequest {
  interests?: string[];
  budget?: 'budget' | 'moderate' | 'expensive';
  language?: string;
  neighborhoods?: string[];
  favorite_genres?: string[];
  vibe_preferences?: string[];
  mood?: string;
}

/**
 * POST /api/concierge/recommend
 * Generate personalized event recommendations based on user preferences
 */
router.post('/recommend', async (req: Request, res: Response) => {
  try {
    const userPreferences = req.body as ConciergeRequest;

    // Validate that at least some preferences are provided
    if (!userPreferences || Object.keys(userPreferences).length === 0) {
      return res.status(400).json({
        error: 'Please provide at least one preference (interests, budget, mood, etc.)',
      });
    }

    // Generate recommendations
    const recommendations = await generateConciergeRecommendations(userPreferences);

    return res.json({
      message: 'Recommendations generated successfully',
      data: recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Concierge recommendation error:', error);
    return res.status(500).json({
      error: 'Unable to generate recommendations. Please try again.',
      details: error.message,
    });
  }
});

/**
 * POST /api/concierge/quick
 * Quick recommendation with minimal input
 */
router.post('/quick', async (req: Request, res: Response) => {
  try {
    const { mood, budget } = req.body;

    if (!mood && !budget) {
      return res.status(400).json({
        error: 'Please provide at least a mood or budget preference',
      });
    }

    const userPreferences = {
      mood: mood || undefined,
      budget: budget || undefined,
      interests: [], // Start with general interests
    };

    const recommendations = await generateConciergeRecommendations(userPreferences);

    return res.json({
      message: 'Quick recommendations ready!',
      data: recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Quick recommendation error:', error);
    return res.status(500).json({
      error: 'Unable to generate quick recommendations.',
    });
  }
});

/**
 * GET /api/concierge/trending
 * Get trending events in Kigali
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { limit = '5' } = req.query;
    const trendingLimit = Math.min(parseInt(limit as string) || 5, 10);

    const trendingEvents = require('../data/events')
      .EVENTS_DATA.filter((evt: any) => evt.trending_factor > 0.7)
      .sort((a: any, b: any) => b.trending_factor - a.trending_factor)
      .slice(0, trendingLimit);

    return res.json({
      message: `Top ${trendingLimit} trending events in Kigali right now`,
      data: trendingEvents,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Trending events error:', error);
    return res.status(500).json({
      error: 'Unable to fetch trending events.',
    });
  }
});

export default router;
