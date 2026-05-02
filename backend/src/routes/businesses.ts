import { Router, Request, Response } from 'express';
import { getHiddenGems, registerBusiness, searchBusinesses } from '../services/businesses';

const router = Router();

router.get('/hidden', async (req: Request, res: Response) => {
  const { search, lat, lon, limit = '6' } = req.query;
  const userLat = parseFloat((lat as string) ?? '-1.9441');
  const userLon = parseFloat((lon as string) ?? '30.0619');
  const limitNum = parseInt(limit as string, 10);

  try {
    const businesses = await getHiddenGems(search as string | undefined, userLat, userLon, limitNum);
    return res.json({ businesses, total: businesses.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unable to load hidden gems' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const { name, address, businessType, businessFeel, menus, plan } = req.body;

  if (!name || !address || !businessType || !businessFeel || !menus || !plan) {
    return res.status(400).json({ error: 'Please provide name, address, businessType, businessFeel, menus and plan.' });
  }

  try {
    const business = await registerBusiness({ name, address, businessType, businessFeel, menus, plan });
    return res.status(201).json({ business, message: 'Business registered successfully.' });
  } catch (error: any) {
    console.error('Business registration error:', error);
    return res.status(500).json({ error: error.message || 'Unable to register business.' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  const { query, lat, lon, limit = '10' } = req.query;
  const userLat = parseFloat((lat as string) ?? '-1.9441');
  const userLon = parseFloat((lon as string) ?? '30.0619');
  const limitNum = parseInt(limit as string, 10);

  try {
    const businesses = await searchBusinesses(String(query || ''), userLat, userLon);
    return res.json({ businesses: businesses.slice(0, limitNum), total: businesses.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unable to search businesses.' });
  }
});

export default router;
