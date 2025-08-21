# Overview

StoryMagic is an AI-powered children's story generation platform that creates personalized, educational stories for kids. The application allows users to generate custom stories by selecting age groups (toddlers, kids, tweens), themes (fairy-tale, adventure, animals, moral), and characters. Stories can be generated in both English and Hindi, with built-in text-to-speech functionality for an immersive reading experience. The platform emphasizes safety with content filtering and age-appropriate material.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom color variables and themes
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with structured error handling
- **File Structure**: Monorepo structure with shared schemas between client and server

## Data Storage
- **Database**: PostgreSQL with Neon serverless driver
- **Schema Design**: 
  - Users table for authentication
  - Stories table with metadata (age group, theme, language, etc.)
  - Story pages for paginated content
  - User settings for preferences and parental controls
- **Migration System**: Drizzle Kit for database migrations

## Authentication & Authorization
- Currently designed for guest users with optional user ID tracking
- User settings table prepared for future user account features
- Content filtering and parental controls built into the schema

## AI Integration
- **OpenAI API**: GPT-4o integration for story generation
- **Safety Measures**: Built-in content filtering and age-appropriate prompts
- **Multi-language Support**: English and Hindi story generation
- **Text-to-Speech**: Browser-based Speech Synthesis API for audio playback

## Content Management
- **Story Structure**: Title, content, character list, and optional pagination
- **Theming**: Predefined themes with associated colors and emojis
- **Age Targeting**: Content complexity adjusted based on selected age group
- **Reading Time**: Automatic calculation based on content length

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **openai**: AI-powered story generation
- **drizzle-orm**: Type-safe database operations and migrations
- **@tanstack/react-query**: Server state management and caching

## UI & Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Dynamic CSS class generation
- **lucide-react**: Icon library

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Validation & Forms
- **zod**: Runtime type validation and schema definitions
- **react-hook-form**: Performant form handling
- **@hookform/resolvers**: Zod integration for form validation

## Utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **clsx** & **tailwind-merge**: Conditional CSS class handling