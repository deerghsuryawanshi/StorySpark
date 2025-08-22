import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../_lib/storage';

export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req: NextRequest) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    console.log('Fetching story with ID:', id);
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'Invalid story ID' }, { status: 400 });
    }

    const story = await storage.getStory(Number(id));
    if (!story) {
      return NextResponse.json({ message: 'Story not found' }, { status: 404 });
    }

    const pages = await storage.getStoryPages(story.id);
    const storyWithPages = { ...story, pages };
    
    console.log(`Retrieved story: ${story.title} with ${pages.length} pages`);
    
    return NextResponse.json(storyWithPages, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    
    return NextResponse.json(
      { 
        message: 'Failed to fetch story',
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