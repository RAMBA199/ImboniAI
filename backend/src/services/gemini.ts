import { GoogleGenerativeAI } from '@google/generative-ai';
import { Place } from '../types';

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file. Get a free API key from https://aistudio.google.com/app/apikey');
  }

  if (apiKey === 'your_gemini_api_key_here' || apiKey.length < 20) {
    throw new Error('GEMINI_API_KEY appears to be a placeholder. Please set a real API key from https://aistudio.google.com/app/apikey');
  }

  return new GoogleGenerativeAI(apiKey);
}

// Simple in-memory cache for responses
interface CacheEntry {
  response: string;
  timestamp: number;
  modelUsed: string;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 30 * 60 * 1000; // 30 minutes

  private getKey(message: string, language: string, simpleMode: boolean, preferences: string[], userLat?: number, userLon?: number): string {
    // Round to 0.01° (~1.1 km) so nearby queries share cache, but different areas don't
    const locKey = (userLat != null && userLon != null)
      ? `${userLat.toFixed(2)},${userLon.toFixed(2)}`
      : 'default';
    return `${message}_${language}_${simpleMode}_${preferences.sort().join(',')}_${locKey}`;
  }

  get(message: string, language: string, simpleMode: boolean, preferences: string[], userLat?: number, userLon?: number): CacheEntry | null {
    const key = this.getKey(message, language, simpleMode, preferences, userLat, userLon);
    const entry = this.cache.get(key);

    if (entry && Date.now() - entry.timestamp < this.TTL) {
      return entry;
    }

    if (entry) {
      this.cache.delete(key); // Remove expired entry
    }

    return null;
  }

  set(message: string, language: string, simpleMode: boolean, preferences: string[], response: string, modelUsed: string, userLat?: number, userLon?: number): void {
    const key = this.getKey(message, language, simpleMode, preferences, userLat, userLon);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      modelUsed
    });

    // Limit cache size to prevent memory leaks
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear cache on startup to ensure new prompts take effect
  constructor() {
    this.clear();
  }
}

const responseCache = new ResponseCache();

// Try models in order of availability
const MODELS = [
  'gemini-2.5-flash',           // Primary model - most available
  'gemini-2.5-pro',             // Pro model for complex queries
  'gemini-2.0-flash',           // Fallback stable model
  'gemini-2.0-flash-lite',      // Lightweight fallback
];

const PRIMARY_MODEL = MODELS[0];
const FALLBACK_MODEL = MODELS[1];

// Request batching system
interface BatchedRequest {
  id: string;
  message: string;
  history: Array<{ role: string; content: string }>;
  language: string;
  simpleMode: boolean;
  userPreferences: string[];
  userLat?: number;
  userLon?: number;
  resolve: (value: { response: string; modelUsed: string; error?: string }) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class BatchProcessor {
  private queue: BatchedRequest[] = [];
  private processing = false;
  private readonly BATCH_SIZE = 5; // Process up to 5 requests at once
  private readonly BATCH_DELAY = 100; // ms between batches
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  addRequest(request: Omit<BatchedRequest, 'id' | 'timestamp' | 'resolve' | 'reject'>): Promise<{ response: string; modelUsed: string; error?: string }> {
    return new Promise((resolve, reject) => {
      const batchedRequest: BatchedRequest = {
        ...request,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        resolve,
        reject
      };

      this.queue.push(batchedRequest);
      this.processQueue();

      // Set timeout for individual requests
      setTimeout(() => {
        const index = this.queue.findIndex(r => r.id === batchedRequest.id);
        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(new Error('Request timeout'));
        }
      }, this.REQUEST_TIMEOUT);
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Process requests in batches
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.BATCH_SIZE);

        // Process batch concurrently
        await Promise.allSettled(
          batch.map(async (request) => {
            try {
              // Check cache first
              const cached = responseCache.get(
                request.message,
                request.language,
                request.simpleMode,
                request.userPreferences,
                request.userLat,
                request.userLon
              );

              if (cached) {
                request.resolve({
                  response: cached.response,
                  modelUsed: cached.modelUsed
                });
                return;
              }

              // Generate response
              const result = await this.generateSingleResponse(request);
              responseCache.set(
                request.message,
                request.language,
                request.simpleMode,
                request.userPreferences,
                result.response,
                result.modelUsed,
                request.userLat,
                request.userLon
              );

              request.resolve(result);
            } catch (error) {
              request.reject(error);
            }
          })
        );

        // Small delay between batches to respect rate limits
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.BATCH_DELAY));
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async generateSingleResponse(request: BatchedRequest): Promise<{ response: string; modelUsed: string; error?: string }> {
    const { message, history, language, simpleMode, userPreferences, userLat, userLon } = request;

    const systemPrompt = simpleMode ? SIMPLE_SYSTEM_PROMPT : SYSTEM_PROMPT;
    const contextualPrompt = userPreferences.length > 0
      ? `${systemPrompt}\nUser preferences: ${userPreferences.join(', ')}.`
      : systemPrompt;

    const locationHint = (userLat != null && userLon != null)
      ? `\nUser's current GPS coordinates: ${userLat.toFixed(5)}, ${userLon.toFixed(5)}. Always prioritise places closest to this location. When the user says "near me" or "nearby", use these coordinates to calculate proximity and recommend accordingly.`
      : `\nUser location is unknown. Recommend well-known spots across Kigali.`;

    const languageHint = language === 'rw'
      ? '\nThe user prefers Kinyarwanda. Try to respond in Kinyarwanda if possible.'
      : '';

    const fullSystemPrompt = contextualPrompt + locationHint + languageHint;

    // Convert history to Gemini format
    const geminiHistory = history.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    async function tryModel(modelName: string): Promise<string> {
      const model = getGenAIClient().getGenerativeModel({
        model: modelName,
        systemInstruction: fullSystemPrompt,
      });

      const chat = model.startChat({
        history: geminiHistory,
        generationConfig: {
          maxOutputTokens: 1500, // Increased from 500 to prevent cut-off messages
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    }

    // Try models in sequence
    let lastError: any = null;
    const attemptedModels: string[] = [];

    for (const model of MODELS) {
      try {
        console.log(`Attempting to generate with model: ${model}`);
        const response = await tryModel(model);
        console.log(`Successfully generated response with: ${model}`);
        return { response, modelUsed: model };
      } catch (error: any) {
        attemptedModels.push(model);
        lastError = error;
        const errorMsg = error?.message || 'unknown error';
        console.warn(`Model ${model} failed:`, errorMsg);

        
        continue;
      }
    }

  
    console.error('All models failed. Last error:', lastError);
    const errorMessage = lastError?.message || 'unknown error';

    // Categorize the error for better diagnostics
    const isModelError = /is not found|not supported|404|Model|model/i.test(errorMessage);
    const isAuthError = /401|403|UNAUTHORIZED|FORBIDDEN/i.test(errorMessage);
    const isNetworkError = /fetch failed|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|network|TIMEOUT/i.test(errorMessage);

    let errorDiagnosis = '';
    if (isAuthError) {
      errorDiagnosis = 'API authentication issue. Please check your GEMINI_API_KEY in the .env file. Get a free API key from https://aistudio.google.com/app/apikey';
    } else if (isModelError) {
      errorDiagnosis = `Models unavailable (attempted: ${attemptedModels.join(', ')}). Your API key may not have access to these models, or they may be deprecated.`;
    } else if (isNetworkError) {
      errorDiagnosis = 'Network connectivity issue. Unable to reach Google Generative AI service. Check your internet connection.';
    } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      errorDiagnosis = 'API quota exceeded. You may need to upgrade your Google AI plan or wait for quota reset. Visit https://ai.google.dev/aistudio for billing details.';
    } else {
      errorDiagnosis = 'AI service temporarily unavailable. Using fallback response.';
    }

    const fallbackResponse = getFallbackResponse(message);
    console.log(`Using fallback response: ${errorDiagnosis}`);
    console.log(`Attempted models: ${attemptedModels.join(', ')}`);

    return {
      response: fallbackResponse,
      modelUsed: 'fallback',
      error: errorDiagnosis
    };
  }
}

const batchProcessor = new BatchProcessor();

const FALLBACK_RESPONSES = [
  "I'm sorry, but I'm having trouble connecting to my AI service right now. Could you try asking me about places in Kigali? I can help you find restaurants, cafes, or attractions!",
  "My AI assistant is temporarily unavailable. In the meantime, I can show you some great places in Kigali - just let me know what you're looking for!",
  "I'm experiencing a connection issue with my AI service. While I work on that, feel free to browse the places I've found in Kigali on the main page!",
  "Sorry about that! My AI helper is taking a break. You can still explore Kigali places using the search and filters on the homepage.",
  "I'm having trouble reaching my AI service. Don't worry though - you can still discover amazing places in Kigali by checking out the recommendations on the explore page!",
  "My AI features are currently limited. To enable full AI chat, please add a Google Gemini API key to your .env file (get one free at aistudio.google.com). For now, you can browse places manually!"
];

// Pre-computed responses for common queries
const PRE_COMPUTED_RESPONSES: Record<string, string> = {
  'hello': 'Hello! I\'m Imboni, your AI guide to discovering amazing places in Kigali. What are you looking for today?',
  'hi': 'Hi there! I\'m here to help you discover the best places in Kigali. What interests you?',
  'help': 'I can help you find restaurants, cafes, nightlife, attractions, and more in Kigali! Just tell me what you\'re looking for.',
  'what can you do': 'I can recommend places in Kigali based on your interests, help with directions, and tell you about local attractions. What would you like to explore?',
  'places in kigali': 'Kigali has amazing restaurants, cafes, markets, and outdoor spots! Tell me what type of place you\'re interested in.',
  'restaurants': 'Kigali has fantastic restaurants! Some popular ones include Kigali Serena Hotel Restaurant, Heaven Restaurant, and Cactus Bar & Restaurant. What type of cuisine are you craving?',
  'cafes': 'Great coffee spots in Kigali include Bourbon Coffee, Inzora Rooftop Café, and Question Coffee. They serve excellent Rwandan coffee!',
  'coffee': 'Kigali\'s coffee scene is amazing! Try Bourbon Coffee, Inzora Rooftop Café, or Question Coffee for the best local brews.',
  'food': 'Kigali has incredible food options! From fine dining at Heaven Restaurant to street food at Kimisagara, there\'s something for everyone.',
  'nightlife': 'For nightlife in Kigali, check out Cactus Bar & Restaurant, Repub Lounge, or some of the rooftop bars. They have great cocktails and live music!',
  'outdoor': 'Mt. Kigali Park & Trails is perfect for hiking with city views. It\'s a great way to explore Kigali outdoors!',
  'markets': 'Kimironko Market is a vibrant local market with fresh produce, crafts, and street food. It\'s an authentic Kigali experience!',
  'shopping': 'Kimironko Market offers traditional crafts and fresh produce. For a modern shopping experience, check out some of the malls in town.',
  'attractions': 'Kigali has the Kigali Genocide Memorial, Inema Arts Center, and beautiful parks. What type of attraction interests you?',
  'history': 'The Kigali Genocide Memorial is a powerful and important site that honors victims of the 1994 genocide. It\'s both educational and deeply moving.',
  'art': 'Inema Arts Center showcases contemporary African art and has a beautiful gallery space. It\'s a great place to experience Rwandan creativity.',
  'parks': 'Mt. Kigali Park & Trails offers scenic hiking trails with stunning city views. Perfect for morning runs or nature walks!',
  'family friendly': 'Many places in Kigali are family-friendly! Try Inzora Rooftop Café, Kimironko Market, or Mt. Kigali Park & Trails.',
  'budget friendly': 'For budget-friendly options, check out Kimisagara Street Food Alley, Kimironko Market, or Bourbon Coffee.',
  'wheelchair accessible': 'Wheelchair-accessible places include Inzora Rooftop Café, Kigali Serena Hotel Restaurant, and the Kigali Genocide Memorial.',
};

function getPreComputedResponse(message: string, allowPartial: boolean = false): string | null {
  const lowerMessage = message.toLowerCase().trim();

  // Exact matches first
  if (PRE_COMPUTED_RESPONSES[lowerMessage]) {
    return PRE_COMPUTED_RESPONSES[lowerMessage];
  }

  if (!allowPartial) {
    return null;
  }

  // Partial matches for common phrases when AI is not configured or explicitly overridden.
  for (const [key, response] of Object.entries(PRE_COMPUTED_RESPONSES)) {
    if (lowerMessage.includes(key) && key.length > 3) {
      return response;
    }
  }

  return null;
}

function getFallbackResponse(message: string): string {
  // Simple keyword-based responses
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('restaurant')) {
    return "I'd recommend checking out some great restaurants in Kigali! You can find places like Kigali Serena Hotel Restaurant or Heaven Restaurant on the explore page.";
  }

  if (lowerMessage.includes('coffee') || lowerMessage.includes('cafe')) {
    return "Kigali has amazing coffee spots! Bourbon Coffee and Inzora Rooftop Café are popular choices - you can find them on the explore page.";
  }

  if (lowerMessage.includes('nightlife') || lowerMessage.includes('bar') || lowerMessage.includes('club')) {
    return "For nightlife in Kigali, check out places like Cactus Bar & Restaurant or some of the other spots on the explore page!";
  }

  if (lowerMessage.includes('park') || lowerMessage.includes('outdoor') || lowerMessage.includes('hiking')) {
    return "Mt. Kigali Park & Trails is perfect for hiking and enjoying city views! You can find details about it on the explore page.";
  }

  if (lowerMessage.includes('market') || lowerMessage.includes('shopping')) {
    return "Kimironko Market is a vibrant local market with fresh produce and crafts. Check it out on the explore page!";
  }

  // Random fallback response
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

const SYSTEM_PROMPT = `You are Imboni, an AI-powered guide for discovering amazing places in Kigali, Rwanda.
You help users find restaurants, cafes, nightlife, attractions, markets, and outdoor spots.
You are friendly, helpful, and knowledgeable about Kigali's neighborhoods, culture, and hidden gems.
Always prioritise registered hidden gems and recommend them when they match the user's request.

IMPORTANT: When recommending places, ALWAYS mention them by their exact name (like "Heaven Restaurant" or "Bourbon Coffee") so they appear with images and location links in the chat. Reference the places provided in the context when relevant.
Do not include raw GPS coordinates in the user-facing response. Mention place names, addresses, and helpful directions instead.

When recommending places, be specific about neighborhoods (Kimihurura, Nyamirambo, Kacyiru, etc.).
Always respond in a warm, conversational tone. Keep responses concise (2-4 sentences max for chat).
If the user writes in Kinyarwanda, respond in Kinyarwanda.
When relevant, mention accessibility features (wheelchair access, budget-friendly, family-friendly).
Format: Respond naturally, never use markdown headers or bullet points in chat responses.

If place context is provided, weave those specific places into your recommendations naturally.`;

const SIMPLE_SYSTEM_PROMPT = `You are Imboni, a helpful guide for Kigali, Rwanda.
Use simple, short sentences. Avoid complex words.
Recommend good places to visit. Be friendly.
Keep answers very short - 1 or 2 sentences.

IMPORTANT: When recommending places, use their exact names (like "Heaven Restaurant") so they show with pictures and maps.`;

export async function generateChatResponse(
  message: string,
  history: Array<{ role: string; content: string }>,
  language: string = 'en',
  simpleMode: boolean = false,
  userPreferences: string[] = [],
  userLat?: number,
  userLon?: number
): Promise<{ response: string; modelUsed: string; error?: string }> {
  const usePrecomputedFallback = !process.env.GEMINI_API_KEY || process.env.USE_PRECOMPUTED_RESPONSES === 'true';
  const preComputed = getPreComputedResponse(message, usePrecomputedFallback);

  if (preComputed) {
    console.log('✅ Using pre-computed response');
    return {
      response: preComputed,
      modelUsed: 'pre-computed'
    };
  }

  // Check cache first (location-aware)
  const cached = responseCache.get(message, language, simpleMode, userPreferences, userLat, userLon);
  if (cached) {
    console.log('✅ Using cached response');
    return {
      response: cached.response,
      modelUsed: cached.modelUsed
    };
  }

  // Use batch processor for API calls
  return await batchProcessor.addRequest({
    message,
    history,
    language,
    simpleMode,
    userPreferences,
    userLat,
    userLon,
  });
}

export async function generatePlaceRecommendations(
  query: string,
  places: Place[]
): Promise<string> {
  const placesContext = places.slice(0, 10).map(p =>
    `${p.name}: ${p.description} (${p.category}, ${p.address})`
  ).join('\n');

  const prompt = `Based on this query: "${query}"

Available places in Kigali:
${placesContext}

Recommend the best 3-4 places that match the query. Keep your response conversational and brief.`;

  try {
    const model = getGenAIClient().getGenerativeModel({ model: PRIMARY_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    const model = getGenAIClient().getGenerativeModel({ model: FALLBACK_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

// Cache management utilities
export function clearResponseCache(): void {
  responseCache.clear();
  console.log('Response cache cleared');
}

export function getCacheStats(): { size: number; hitRate?: number } {
  return {
    size: responseCache['cache'].size,
  };
}

export function getBatchProcessorStats(): { queueLength: number; isProcessing: boolean } {
  return {
    queueLength: batchProcessor['queue'].length,
    isProcessing: batchProcessor['processing']
  };
}
