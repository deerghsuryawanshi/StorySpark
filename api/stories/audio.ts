import { NextRequest, NextResponse } from 'next/server';
import { generateTextToSpeech } from '../_lib/openai.js';

export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30,
};

export default async function handler(req: NextRequest) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { text } = body;

    console.log('Generating audio for text length:', text?.length || 0);

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }

    if (text.length > 4000) {
      return NextResponse.json({ 
        message: 'Text too long. Maximum 4000 characters allowed.' 
      }, { status: 400 });
    }

    const audioBuffer = await generateTextToSpeech(text);
    
    console.log('Generated audio buffer size:', audioBuffer.byteLength);
    
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Failed to generate audio',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}