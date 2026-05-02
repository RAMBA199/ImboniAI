import { Router, Request, Response } from 'express';
import { getPlaces, searchPlaces } from '../services/places';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const {
    category,
    lat,
    lon,
    limit = '20',
    search
  } = req.query;

  const hasUserLocation = lat != null && lon != null;
  const userLat = parseFloat((lat as string) ?? '-1.9441');
  const userLon = parseFloat((lon as string) ?? '30.0619');
  const limitNum = parseInt(limit as string, 10);

  try {
    if (search) {
      const places = await searchPlaces(search as string, userLat, userLon);
      return res.json({ 
        places, 
        total: places.length,
        dataSource: 'database',
        locationUsed: hasUserLocation ? 'user' : 'default',
        message: places.length === 0 ? 'No places found in your area. Try searching for specific locations.' : undefined
      });
    }

    const places = await getPlaces(category as string, userLat, userLon, limitNum);
    return res.json({ 
      places, 
      total: places.length,
      dataSource: 'database',
      locationUsed: hasUserLocation ? 'user' : 'default',
      message: places.length === 0 ? 'No places found in your area. Try searching for specific locations.' : undefined
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const places = await getPlaces();
  const place = places.find(p => p.id === id);

  if (!place) {
    return res.status(404).json({ error: 'Place not found' });
  }

  return res.json(place);
});

export default router;
