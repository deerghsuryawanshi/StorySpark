import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../_lib/storage.js';
import { generateStory } from '../_lib/openai.js';
import { insertStorySchema } from '../../shared/schema.js';

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
    
    console.log('Received story generation request:', body);
    
    const validatedData = insertStorySchema.parse({
      title: body.title || "Generating...",
      ageGroup: body.ageGroup,
      theme: body.theme,
      characters: body.characters || [],
      language: body.language || 'english',
      content: "Generating story...",
      estimatedReadingTime: 5,
    });

    console.log('Validated data:', validatedData);

    // Generate story using OpenAI
    const generatedStory = await generateStory({
      ageGroup: validatedData.ageGroup,
      theme: validatedData.theme,
      characters: validatedData.characters,
      language: validatedData.language,
    });

    console.log('Generated story:', { title: generatedStory.title, contentLength: generatedStory.content.length });

    // Save to database
    const story = await storage.createStory({
      ...validatedData,
      title: generatedStory.title,
      content: generatedStory.content,
      characters: generatedStory.characters,
      estimatedReadingTime: generatedStory.estimatedReadingTime,
    });

    console.log('Saved story to database:', story.id);

    return NextResponse.json(story, { 
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error generating story:', error);
    
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Failed to generate story',
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