-- StoryMagic Database Schema for Neon
-- Run this SQL in your Neon database console after creating the database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    age_group VARCHAR(100) NOT NULL CHECK (age_group IN ('toddlers', 'kids', 'tweens')),
    theme VARCHAR(100) NOT NULL CHECK (theme IN ('fairy-tale', 'adventure', 'animals', 'moral')),
    characters TEXT[] NOT NULL DEFAULT '{}',
    language VARCHAR(50) NOT NULL DEFAULT 'english' CHECK (language IN ('english', 'hindi')),
    content TEXT NOT NULL,
    estimated_reading_time INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story pages table (for paginated stories)
CREATE TABLE IF NOT EXISTS story_pages (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, page_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_age_group ON stories(age_group);
CREATE INDEX IF NOT EXISTS idx_stories_theme ON stories(theme);
CREATE INDEX IF NOT EXISTS idx_stories_language ON stories(language);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_pages_story_id ON story_pages(story_id);
CREATE INDEX IF NOT EXISTS idx_story_pages_page_number ON story_pages(story_id, page_number);

-- Insert sample data (optional)
INSERT INTO stories (title, age_group, theme, characters, language, content, estimated_reading_time) 
VALUES 
('The Brave Little Rabbit', 'kids', 'adventure', ARRAY['Bunny', 'Forest Friends'], 'english', 
 'Once upon a time, in a magical forest, there lived a brave little rabbit named Bunny. Bunny loved exploring the forest with all the forest friends. One day, they discovered a hidden treasure that taught them the value of friendship and courage.

This is a wonderful story that shows children how being brave and helping friends can lead to amazing adventures. The forest was full of colorful flowers and singing birds.

Bunny learned that true treasure is not gold or jewels, but the friendships we make along the way. All the forest friends celebrated together under the starry sky.', 
 3)
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'stories', 'story_pages')
ORDER BY table_name, ordinal_position;