import { Router, Request, Response } from 'express';
import { generateChatResponse } from '../services/gemini';
import { searchPlaces, STATIC_PLACES } from '../services/places';
import { searchBusinesses } from '../services/businesses';
import { LocationLink } from '../types';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Generate Google Maps link and LocationLink object
function generateLocationLink(place: any): LocationLink {
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(place.name)}+${encodeURIComponent(place.address)}&ll=${place.latitude},${place.longitude}&z=15`;
  
  return {
    placeId: place.id,
    placeName: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
    image_url: place.image_url,
    mapsUrl,
    requiresPayment: false,
    price_rwf: 0,
    payment_note: '',
  };
}

// Save message to DB (graceful fail)
async function saveMessage(sessionId: string, role: string, content: string) {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const chats = db.collection('chats');
    await chats.insertOne({
      userId: 'demo-user',
      message: role === 'user' ? content : null,
      response: role === 'assistant' ? content : null,
      createdAt: new Date()
    });
  } catch (error) {
    // Graceful fail
  }
}

// Get chat history from DB
async function getChatHistory(sessionId: string) {
  try {
    const db = mongoose.connection.db;
    if (!db) return [];

    const chats = db.collection('chats');
    const messages = await chats.find({ userId: 'demo-user' })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return messages.reverse().map(msg => ({
      id: msg._id.toString(),
      session_id: sessionId,
      role: msg.message ? 'user' : 'assistant',
      content: msg.message || msg.response,
      created_at: msg.createdAt
    }));
  } catch (error) {
    return [];
  }
}

router.post('/', async (req: Request, res: Response) => {
  const { message, session_id, language = 'en', user_preferences = [], simple_mode = false, user_lat, user_lon } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const sessionId = session_id || uuidv4();
  const trimmedMessage = message.trim();

  // Parse coordinates if provided
  const userLat = user_lat != null ? parseFloat(String(user_lat)) : undefined;
  const userLon = user_lon != null ? parseFloat(String(user_lon)) : undefined;
  const hasLocation = userLat != null && !isNaN(userLat) && userLon != null && !isNaN(userLon);

  try {
    // Get chat history
    const history = await getChatHistory(sessionId);

    // Save user message
    await saveMessage(sessionId, 'user', trimmedMessage);

    // Find relevant places using the user's real location
    const relevantPlaces = await searchPlaces(
      trimmedMessage,
      hasLocation ? userLat! : -1.9441,
      hasLocation ? userLon! : 30.0619
    );
    const relevantBusinesses = await searchBusinesses(
      trimmedMessage,
      hasLocation ? userLat! : -1.9441,
      hasLocation ? userLon! : 30.0619
    );
    const combinedPlaces = [...relevantBusinesses, ...relevantPlaces];
    const uniqueTopPlaces = Array.from(new Map(combinedPlaces.map(place => [place.id, place])).values()).slice(0, 5);

    // Build enhanced message with place context + distance info
    let enhancedMessage = trimmedMessage;
    if (uniqueTopPlaces.length > 0 || relevantBusinesses.length > 0) {
      const placeContext = uniqueTopPlaces.map(p => {
        const distStr = p.distance_km != null ? `, ${p.distance_km} km from user` : '';
        return `"${p.name}" (${p.category}, ${p.address}, rating: ${p.rating}${distStr})`;
      }).join(', ');

      const businessContext = relevantBusinesses.slice(0, 3).map(p => {
        const distStr = p.distance_km != null ? `, ${p.distance_km} km from user` : '';
        return `"${p.name}" (${p.category}, ${p.address}${distStr})`;
      }).join(', ');

      const locCtx = hasLocation
        ? `User is at coordinates ${userLat!.toFixed(5)}, ${userLon!.toFixed(5)}.`
        : 'User location unknown.';

      enhancedMessage = `${trimmedMessage}\n\n[Context: ${locCtx} Relevant nearby places: ${placeContext}`;
      if (businessContext.length > 0) {
        enhancedMessage += ` Hidden gems from registered businesses: ${businessContext}.`;
      }
      enhancedMessage += `]\n\nWhen recommending places, mention them by their exact names so they appear with images and location links.`;
    }

    // Generate AI response with location context
    const aiResult = await generateChatResponse(
      enhancedMessage,
      history,
      language,
      simple_mode,
      user_preferences,
      hasLocation ? userLat : undefined,
      hasLocation ? userLon : undefined
    );
    
    const { response, modelUsed, error: aiError } = aiResult;
    
    // Log fallback usage
    if (modelUsed === 'fallback') {
      console.log(`[FALLBACK TRIGGERED] Reason: ${aiError}`);
      console.log(`[FALLBACK TRIGGERED] User message: "${trimmedMessage.substring(0, 100)}..."`);
    } else {
      console.log(`[AI RESPONSE] Model: ${modelUsed}`);
    }


    // Save assistant message
    await saveMessage(sessionId, 'assistant', response);

    // Generate location links for top places
    const locationLinks = uniqueTopPlaces.map(place => generateLocationLink(place));

    return res.json({
      response,
      places: uniqueTopPlaces,
      locationLinks,
      session_id: sessionId,
      model_used: modelUsed,
      ...(aiError && { warning: aiError }),
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    const message = error?.message || 'Failed to generate response';
    const isServiceUnavailable = message.includes('AI service temporarily unavailable');

    return res.status(isServiceUnavailable ? 503 : 500).json({
      error: message,
      session_id: sessionId,
    });
  }
});

// Get chat history
router.get('/history/:sessionId', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const history = await getChatHistory(sessionId);
    res.json({ messages: history, session_id: sessionId });
  } catch (error) {
    res.json({ messages: [], session_id: sessionId });
  }
});

export default router;
