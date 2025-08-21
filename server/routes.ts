import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStory, generateTextToSpeech } from "./openai.js";
import { insertStorySchema } from "@shared/schema";
import { z } from "zod";

const createStoryRequestSchema = z.object({
  ageGroup: z.enum(['toddlers', 'kids', 'tweens']),
  theme: z.enum(['fairy-tale', 'adventure', 'animals', 'moral']),
  characters: z.array(z.string()).min(1).max(5),
  language: z.enum(['english', 'hindi']).default('english'),
  userId: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate a new story
  app.post("/api/stories/generate", async (req, res) => {
    try {
      const validatedData = createStoryRequestSchema.parse(req.body);
      
      // Generate story using OpenAI
      const generatedStory = await generateStory(validatedData);
      
      // Save story to database
      const story = await storage.createStory({
        title: generatedStory.title,
        content: generatedStory.content,
        ageGroup: validatedData.ageGroup,
        theme: validatedData.theme,
        characters: validatedData.characters,
        language: validatedData.language,
        userId: validatedData.userId,
        readingTime: Math.ceil(generatedStory.content.length / 200), // ~200 words per minute
      });

      // Create story pages if provided
      if (generatedStory.pages && generatedStory.pages.length > 0) {
        const pages = generatedStory.pages.map((page: any, index: number) => ({
          storyId: story.id,
          pageNumber: index + 1,
          content: page.content,
          illustration: page.illustration,
        }));
        
        await storage.createStoryPages(pages);
      }

      res.json(story);
    } catch (error) {
      console.error("Error generating story:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate story" 
      });
    }
  });

  // Get a specific story
  app.get("/api/stories/:id", async (req, res) => {
    try {
      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      const pages = await storage.getStoryPages(story.id);
      res.json({ ...story, pages });
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  // Get stories by user
  app.get("/api/users/:userId/stories", async (req, res) => {
    try {
      const stories = await storage.getStoriesByUser(req.params.userId);
      res.json(stories);
    } catch (error) {
      console.error("Error fetching user stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // Get public stories
  app.get("/api/stories", async (req, res) => {
    try {
      const stories = await storage.getPublicStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching public stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // Generate audio for a story
  app.post("/api/stories/:id/audio", async (req, res) => {
    try {
      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      const audioUrl = await generateTextToSpeech(story.content, story.language);
      await storage.updateStoryAudioUrl(story.id, audioUrl);
      
      res.json({ audioUrl });
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ message: "Failed to generate audio" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
