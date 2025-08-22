import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../_lib/storage.js';

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
    console.log('Fetching stories from database...');
    
    const stories = await storage.getStoriesWithPages();
    
    console.log(`Retrieved ${stories.length} stories`);
    
    return NextResponse.json(stories, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    
    return NextResponse.json(
      { 
        message: 'Failed to fetch stories',
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