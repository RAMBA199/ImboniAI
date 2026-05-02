import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const HASH_ITERATIONS = 120000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

function hashPassword(password: string, salt?: string) {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, usedSalt, HASH_ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return { salt: usedSalt, hash: derived };
}

function verifyPassword(password: string, salt: string, storedHash: string) {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, username, password, profilePic } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'Name, email, username and password are required.' });
  }

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const users = db.collection<any>('users');
    const existingCount = await users.countDocuments({ authSource: 'local' });
    if (existingCount >= 5) {
      return res.status(403).json({ error: 'Account limit reached. Only 5 users may be created during this testing phase.' });
    }

    const existingUser = await users.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Email or username already exists.' });
    }

    const { salt, hash } = hashPassword(password);
    const newUser = {
      _id: uuidv4(),
      name,
      email,
      username,
      profilePic: profilePic || '',
      authSource: 'local',
      passwordHash: hash,
      passwordSalt: salt,
      preferences: {
        interests: [],
        language: 'en',
        simpleMode: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await users.insertOne(newUser as any);

    return res.json({
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        profilePic: newUser.profilePic,
        preferences: newUser.preferences,
      },
    });
  } catch (error) {
    console.error('Auth register error:', error);
    return res.status(500).json({ error: 'Unable to register user.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const users = db.collection<any>('users');
    const user = await users.findOne({ email, authSource: 'local' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        profilePic: user.profilePic || '',
        preferences: user.preferences || { interests: [], language: 'en', simpleMode: false },
      },
    });
  } catch (error) {
    console.error('Auth login error:', error);
    return res.status(500).json({ error: 'Unable to sign in.' });
  }
});

router.get('/profile', async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
    const users = db.collection<any>('users');
    const user = await users.findOne({ _id: userId, authSource: 'local' });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        profilePic: user.profilePic || '',
        preferences: user.preferences || { interests: [], language: 'en', simpleMode: false },
      },
    });
  } catch (error) {
    console.error('Auth profile fetch error:', error);
    return res.status(500).json({ error: 'Unable to load profile.' });
  }
});

router.put('/profile', async (req: Request, res: Response) => {
  const { userId, email, name, username, profilePic, password } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
    const users = db.collection<any>('users');
    const existingUser = await users.findOne({ _id: userId, authSource: 'local' });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email && email !== existingUser.email) {
      const emailTaken = await users.findOne({ email, _id: { $ne: userId } });
      if (emailTaken) {
        return res.status(409).json({ error: 'Email already in use.' });
      }
    }

    if (username && username !== existingUser.username) {
      const nameTaken = await users.findOne({ username, _id: { $ne: userId } });
      if (nameTaken) {
        return res.status(409).json({ error: 'Username already in use.' });
      }
    }

    const updates: any = {
      updatedAt: new Date(),
    };

    if (email) updates.email = email;
    if (name) updates.name = name;
    if (username) updates.username = username;
    if (profilePic !== undefined) updates.profilePic = profilePic;
    if (password) {
      const { salt, hash } = hashPassword(password);
      updates.passwordHash = hash;
      updates.passwordSalt = salt;
    }

    await users.updateOne({ _id: userId, authSource: 'local' }, { $set: updates });
    const updatedUser = await users.findOne({ _id: userId, authSource: 'local' });
    if (!updatedUser) {
      return res.status(500).json({ error: 'Unable to load updated profile.' });
    }

    return res.json({
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
        profilePic: updatedUser.profilePic || '',
        preferences: updatedUser.preferences || { interests: [], language: 'en', simpleMode: false },
      },
    });
  } catch (error) {
    console.error('Auth profile update error:', error);
    return res.status(500).json({ error: 'Unable to update profile.' });
  }
});

router.delete('/profile', async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');

    const users = db.collection<any>('users');
    const result = await users.deleteOne({ _id: userId, authSource: 'local' });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found or already deleted.' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Auth delete profile error:', error);
    return res.status(500).json({ error: 'Unable to delete account.' });
  }
});

router.post('/logout', async (_req: Request, res: Response) => {
  return res.json({ success: true });
});

export default router;