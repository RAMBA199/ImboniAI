import { Router, Request, Response } from 'express';
import { generateChatResponse } from '../services/gemini';
import { searchPlaces, STATIC_PLACES } from '../services/places';
import { searchBusinesses, getHiddenGems } from '../services/businesses';
import { LocationLink, Place } from '../types';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Generate Google Maps link and LocationLink object
function generateLocationLink(place: any): LocationLink {
  const hasCoordinates = typeof place.latitude === 'number' && typeof place.longitude === 'number' && place.latitude !== 0 && place.longitude !== 0;
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${encodeURIComponent(place.name)}+${encodeURIComponent(place.address)}&ll=${place.latitude},${place.longitude}&z=15`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${place.name} ${place.address}`)}`;

  return {
    placeId: place.id,
    placeName: place.name,
    latitude: place.latitude || 0,
    longitude: place.longitude || 0,
    address: place.address,
    image_url: place.image_url,
    mapsUrl,
    requiresPayment: false,
    price_rwf: 0,
    payment_note: '',
  };
}

// Save message to DB (graceful fail)
async function saveMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const chats = db.collection('chats');
    await chats.insertOne({
      sessionId,
      role,
      content,
      createdAt: new Date(),
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
    const messages = await chats.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(50)
      .toArray();

    return messages.map(msg => ({
      id: msg._id.toString(),
      session_id: sessionId,
      role: msg.role,
      content: msg.content,
      created_at: msg.createdAt,
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
    const hiddenGems = await getHiddenGems(
      undefined,
      hasLocation ? userLat! : -1.9441,
      hasLocation ? userLon! : 30.0619,
      3
    );

    const combinedPlaces = [...relevantBusinesses, ...relevantPlaces, ...hiddenGems];
    const uniqueTopPlaces = Array.from(new Map(combinedPlaces.map(place => [place.id, place])).values()).slice(0, 5);

    // Build enhanced message with place context + distance info
    let enhancedMessage = trimmedMessage;
    const locCtx = hasLocation
      ? `User is near Kigali, Rwanda. Do not repeat raw GPS coordinates to the user.`
      : 'User location unknown.';

    const placeContext = uniqueTopPlaces.map(p => {
      const distStr = p.distance_km != null ? `, ${p.distance_km} km away` : '';
      return `"${p.name}" (${p.category}, ${p.address}, rating: ${p.rating}${distStr})`;
    }).join(', ');

    const hiddenGemContext = hiddenGems.slice(0, 3).map((p: Place) => {
      const distStr = p.distance_km != null ? `, ${p.distance_km} km away` : '';
      return `"${p.name}" (${p.category}, ${p.address}${distStr})`;
    }).join(', ');

    if (placeContext.length > 0 || hiddenGemContext.length > 0) {
      enhancedMessage = `${trimmedMessage}\n\n[Context: ${locCtx} Nearby places: ${placeContext}`;
      if (hiddenGemContext.length > 0) {
        enhancedMessage += ` Registered hidden gems: ${hiddenGemContext}.`;
      }
      enhancedMessage += `] \n\nWhen recommending places, mention their exact names and addresses. Never include raw GPS coordinates in the final response.`;
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
