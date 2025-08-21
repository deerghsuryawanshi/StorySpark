# StoryMagic - AI-Powered Kids Story Generator

A full-stack web application that creates personalized, educational stories for children using AI. Features multilingual support (English & Hindi), text-to-speech audiobook functionality, and beautiful, kid-friendly design.

## Features

- 🎨 AI-powered story generation with OpenAI GPT-4o
- 🌍 Multilingual support (English & Hindi)
- 🔊 Text-to-speech audiobook feature
- 📚 Story library with save and share functionality
- 🎭 Age-appropriate content filtering
- 📱 Mobile-responsive design
- 🎯 Customizable themes, characters, and age groups

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4o API
- **UI**: Shadcn/ui + Tailwind CSS
- **Audio**: Web Speech API

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `OPENAI_API_KEY`: OpenAI API key
4. Push database schema: `npm run db:push`
5. Start development server: `npm run dev`

## Deployment on Render

### Prerequisites
- Valid OpenAI API key from https://platform.openai.com
- GitHub repository with your code

### Steps

1. **Create PostgreSQL Database**:
   - Go to Render dashboard
   - Click "New" → "PostgreSQL"
   - Name: `storymagic-database`
   - Plan: Free tier
   - Save the connection string

2. **Deploy Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - Name: `storymagic-app`
     - Environment: Node
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

3. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (Your PostgreSQL connection string)
   - `OPENAI_API_KEY`: (Your OpenAI API key)

4. **Initialize Database**:
   - After deployment, open Shell in Render dashboard
   - Run: `npm run db:push`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for story generation | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared schemas and types
├── components.json  # Shadcn/ui configuration
├── tailwind.config.ts
├── drizzle.config.ts
├── render.yaml      # Render deployment config
└── Dockerfile       # Docker configuration
```

## API Endpoints

- `POST /api/stories/generate` - Generate a new story
- `GET /api/stories/:id` - Get specific story with pages
- `GET /api/stories` - Get public stories
- `POST /api/stories/:id/audio` - Generate audio for story

## Safety Features

- Content filtering for age-appropriate material
- No violence, scary themes, or inappropriate content
- Educational focus with positive moral lessons
- Parental control considerations built-in

## License

MIT License - feel free to use this project for educational purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions, please create an issue in the GitHub repository.