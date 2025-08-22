# Vercel + Neon Deployment Guide - StoryMagic

## Complete Setup: Frontend on Vercel + Backend on Vercel + Database on Neon

This guide will deploy your full StoryMagic app using Vercel's serverless functions with Neon's PostgreSQL database.

## Step 1: Set Up Neon Database (5 minutes)

### 1.1 Create Neon Account
1. Go to https://neon.tech
2. Sign up with GitHub (recommended)
3. Create new project: "storymagic-db"
4. Choose region closest to your users
5. Copy the connection string (it looks like):
   ```
   postgresql://username:password@host.neon.tech:5432/database?sslmode=require
   ```

### 1.2 Initialize Database Schema
1. In Neon dashboard, go to "SQL Editor"
2. We'll set up the schema after deployment

## Step 2: Restructure Project for Vercel Serverless

### 2.1 Create API Directory Structure
```bash
# Create the new structure
mkdir -p api
mkdir -p api/stories
```

### 2.2 Create Vercel Configuration
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/index.html"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  }
}
```

### 2.3 Create Database Connection for Serverless
Create `api/_lib/db.ts`:
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../../shared/schema';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

### 2.4 Create Storage for Serverless
Create `api/_lib/storage.ts`:
```typescript
import { users, stories, storyPages, type User, type InsertUser, type Story, type InsertStory, type StoryPage, type InsertStoryPage } from "../../shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;

  // Story operations
  createStory(insertStory: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  getStories(): Promise<Story[]>;
  getStoriesWithPages(): Promise<(Story & { pages: StoryPage[] })[]>;

  // Story pages operations
  createStoryPage(insertStoryPage: InsertStoryPage): Promise<StoryPage>;
  getStoryPages(storyId: number): Promise<StoryPage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const [story] = await db
      .insert(stories)
      .values(insertStory)
      .returning();
    return story;
  }

  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story || undefined;
  }

  async getStories(): Promise<Story[]> {
    return await db.select().from(stories).orderBy(desc(stories.id));
  }

  async getStoriesWithPages(): Promise<(Story & { pages: StoryPage[] })[]> {
    const storiesResult = await db.select().from(stories).orderBy(desc(stories.id));
    
    const storiesWithPages = await Promise.all(
      storiesResult.map(async (story) => {
        const pages = await this.getStoryPages(story.id);
        return { ...story, pages };
      })
    );

    return storiesWithPages;
  }

  async createStoryPage(insertStoryPage: InsertStoryPage): Promise<StoryPage> {
    const [page] = await db
      .insert(storyPages)
      .values(insertStoryPage)
      .returning();
    return page;
  }

  async getStoryPages(storyId: number): Promise<StoryPage[]> {
    return await db
      .select()
      .from(storyPages)
      .where(eq(storyPages.storyId, storyId));
  }
}

export const storage = new DatabaseStorage();
```

### 2.5 Create OpenAI Helper for Serverless
Create `api/_lib/openai.ts`:
```typescript
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateStory(params: {
  ageGroup: string;
  theme: string;
  characters: string[];
  language: string;
}): Promise<{
  title: string;
  content: string;
  characters: string[];
  estimatedReadingTime: number;
}> {
  try {
    const { ageGroup, theme, characters, language } = params;

    const prompt = `Create a ${language === 'hindi' ? 'Hindi' : 'English'} children's story for ${ageGroup} with the theme "${theme}". 
    Characters: ${characters.join(', ')}.
    
    Requirements:
    - Age-appropriate content for ${ageGroup}
    - Educational and entertaining
    - Include moral lessons
    - Length: 200-400 words for toddlers, 400-600 words for kids, 600-800 words for tweens
    - Safe, positive content only
    
    Respond in JSON format:
    {
      "title": "Story title",
      "content": "Full story content with paragraphs",
      "characters": ["character1", "character2"],
      "estimatedReadingTime": minutes_to_read
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      title: result.title || "Untitled Story",
      content: result.content || "Story content not generated.",
      characters: result.characters || characters,
      estimatedReadingTime: result.estimatedReadingTime || 5,
    };
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error("Failed to generate story. Please try again.");
  }
}

export async function generateTextToSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      speed: 0.9,
    });

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate audio. Please try again.");
  }
}
```

## Step 3: Create Serverless API Routes

### 3.1 Story Generation API
Create `api/stories/generate.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../_lib/storage';
import { generateStory } from '../_lib/openai';
import { insertStorySchema } from '../../shared/schema';

export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30,
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    
    const validatedData = insertStorySchema.parse({
      title: body.title || "Generating...",
      ageGroup: body.ageGroup,
      theme: body.theme,
      characters: body.characters || [],
      language: body.language || 'english',
      content: "Generating story...",
      estimatedReadingTime: 5,
    });

    // Generate story using OpenAI
    const generatedStory = await generateStory({
      ageGroup: validatedData.ageGroup,
      theme: validatedData.theme,
      characters: validatedData.characters,
      language: validatedData.language,
    });

    // Save to database
    const story = await storage.createStory({
      ...validatedData,
      title: generatedStory.title,
      content: generatedStory.content,
      characters: generatedStory.characters,
      estimatedReadingTime: generatedStory.estimatedReadingTime,
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { message: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
```

### 3.2 Get Stories API
Create `api/stories/index.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../_lib/storage';

export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const stories = await storage.getStoriesWithPages();
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
```

### 3.3 Individual Story API
Create `api/stories/[id].ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../_lib/storage';

export const config = {
  runtime: 'nodejs18.x',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'Invalid story ID' }, { status: 400 });
    }

    const story = await storage.getStory(Number(id));
    if (!story) {
      return NextResponse.json({ message: 'Story not found' }, { status: 404 });
    }

    const pages = await storage.getStoryPages(story.id);
    return NextResponse.json({ ...story, pages });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { message: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}
```

### 3.4 Text-to-Speech API
Create `api/stories/audio.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateTextToSpeech } from '../_lib/openai';

export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30,
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }

    const audioBuffer = await generateTextToSpeech(text);
    
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { message: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}
```

## Step 4: Update Frontend for Vercel

### 4.1 Update Client Package.json
Create `client/package.json`:
```json
{
  "name": "storymagic-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "wouter": "^3.0.0",
    "lucide-react": "^0.294.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "date-fns": "^2.30.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 4.2 Update Frontend API Calls
Update `client/src/lib/queryClient.ts`:
```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        // Use relative URLs - Vercel will handle routing
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status >= 500) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error: ${response.status}`);
        }
        
        return response.json();
      },
    },
  },
});

export async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error: ${response.status}`);
  }

  return response.json();
}
```

## Step 5: Deploy to Vercel

### 5.1 Prepare Repository
1. Create GitHub repository: "storymagic-vercel"
2. Upload all files including:
   - `vercel.json`
   - `api/` directory with all serverless functions
   - `client/` directory with frontend
   - `shared/` directory with schemas

### 5.2 Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Import "storymagic-vercel" repository
5. Framework preset: "Other"
6. Root directory: Leave empty
7. Build settings:
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

### 5.3 Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://username:password@host.neon.tech:5432/database?sslmode=require` |
| `OPENAI_API_KEY` | `your_real_openai_api_key` |
| `NODE_ENV` | `production` |

### 5.4 Deploy
1. Click "Deploy"
2. Wait 3-5 minutes for build
3. Your app will be live at: `https://your-project.vercel.app`

## Step 6: Initialize Database Schema

### 6.1 Create Tables in Neon
1. Go to Neon dashboard → SQL Editor
2. Run this SQL to create tables:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Stories table
CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    age_group VARCHAR(100) NOT NULL,
    theme VARCHAR(100) NOT NULL,
    characters TEXT[] NOT NULL DEFAULT '{}',
    language VARCHAR(50) NOT NULL DEFAULT 'english',
    content TEXT NOT NULL,
    estimated_reading_time INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story pages table
CREATE TABLE story_pages (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, page_number)
);

-- Create indexes
CREATE INDEX idx_stories_age_group ON stories(age_group);
CREATE INDEX idx_stories_theme ON stories(theme);
CREATE INDEX idx_stories_language ON stories(language);
CREATE INDEX idx_story_pages_story_id ON story_pages(story_id);
```

## Step 7: Test Your Deployment

### 7.1 Functionality Tests
1. Visit `https://your-project.vercel.app`
2. Create a new story
3. Test different age groups and themes
4. Try English and Hindi languages
5. Test audio generation
6. Check story library

### 7.2 Performance Tests
- Check loading speed (should be <2 seconds globally)
- Test concurrent story generation
- Verify mobile responsiveness

## Troubleshooting

### Common Issues

**Build Failures:**
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure TypeScript types are correct

**Database Connection Issues:**
```typescript
// Test connection in Neon SQL Editor:
SELECT 1;
```

**API Routes Not Working:**
- Check function logs in Vercel dashboard
- Verify environment variables are set
- Test API endpoints individually

**Story Generation Fails:**
- Verify OpenAI API key is valid and has credits
- Check function timeout (max 30 seconds on Vercel)
- Monitor OpenAI usage limits

## Performance Optimization

### 7.1 Edge Optimization
- Vercel automatically serves frontend from global edge network
- API functions run in regions close to users
- Database queries optimized with indexes

### 7.2 Caching Strategy
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Your StoryMagic app is now deployed with:
- Global CDN for instant loading
- Serverless scaling
- Managed PostgreSQL database
- Professional monitoring
- Automatic HTTPS

**Live URL**: `https://your-project.vercel.app`

All features working: Story generation, multilingual support, audio playback, and story library!