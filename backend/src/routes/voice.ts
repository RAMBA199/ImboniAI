import { Router, Request, Response } from 'express';
import OpenAI, { toFile } from 'openai';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { audio_data, mime_type, language = 'en' } = req.body;
  const openaiApiKey = process.env.OPENAI_API_KEY || '';

  if (!openaiApiKey) {
    return res.status(500).json({ error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY.' });
  }

  const openai = new OpenAI({ apiKey: openaiApiKey });

  if (!audio_data || typeof audio_data !== 'string') {
    return res.status(400).json({ error: 'audio_data is required and must be a base64-encoded string.' });
  }

  if (!mime_type || typeof mime_type !== 'string') {
    return res.status(400).json({ error: 'mime_type is required and must be a valid audio MIME type.' });
  }

  try {
    const buffer = Buffer.from(audio_data, 'base64');
    const maxAudioBytes = 4 * 1024 * 1024; // 4 MB
    if (buffer.length > maxAudioBytes) {
      return res.status(413).json({ error: 'Audio file is too large. Please record a shorter clip.' });
    }

    const file = await toFile(buffer, 'voice.webm', { type: mime_type });
    const transcriptionArgs: Record<string, unknown> = {
      file,
      model: 'whisper-1',
    };

    // Whisper does not accept 'rw' directly in OpenAI requests, so we omit the language
    // parameter for Kinyarwanda and allow the model to auto-detect.
    if (language !== 'rw') {
      transcriptionArgs.language = language;
    }

    const transcription = await openai.audio.transcriptions.create(transcriptionArgs as any);

    const typedTranscription = transcription as any;
    const text = typeof typedTranscription === 'string'
      ? typedTranscription
      : typedTranscription.text ?? String(typedTranscription);

    return res.json({
      transcription: text,
      confidence: 0.88,
      language,
      simulated: false,
      message: 'Transcription from OpenAI Whisper',
    });
  } catch (error: any) {
    console.error('OpenAI Whisper error:', error);
    const message = error?.message || 'Failed to transcribe audio with Whisper.';
    return res.status(502).json({ error: message, simulated: false });
  }
});

export default router;
