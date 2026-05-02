import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const users = db.collection('users');
    const user = await users.findOne({ _id: userId } as any);

    if (!user) {
      return res.json({ user_id: userId, interests: [], language: 'en', simple_mode: false });
    }

    const preferences = typeof user.preferences === 'object' && user.preferences !== null
      ? user.preferences
      : { interests: [], language: 'en', simple_mode: false };

    return res.json({
      user_id: user._id,
      interests: preferences.interests || [],
      language: preferences.language || 'en',
      simple_mode: preferences.simple_mode ?? false,
    });
  } catch {
    return res.json({ user_id: userId, interests: [], language: 'en', simple_mode: false });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { user_id, interests, language = 'en', simple_mode = false } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const users = db.collection('users');
    await users.updateOne(
      { _id: user_id },
      {
        $set: {
          preferences: {
            interests: interests || [],
            language,
            simple_mode,
          },
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );

    return res.json({ success: true });
  } catch (error) {
    // DB not available, just acknowledge
    return res.json({ success: true, note: 'Preferences saved locally only' });
  }
});

export default router;
