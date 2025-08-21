import { 
  users, 
  stories, 
  storyPages, 
  userSettings,
  type User, 
  type InsertUser,
  type Story,
  type InsertStory,
  type StoryPage,
  type InsertStoryPage,
  type UserSettings,
  type InsertUserSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Story methods
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: string): Promise<Story | undefined>;
  getStoriesByUser(userId: string): Promise<Story[]>;
  getPublicStories(): Promise<Story[]>;
  updateStoryAudioUrl(id: string, audioUrl: string): Promise<void>;
  
  // Story page methods
  createStoryPages(pages: InsertStoryPage[]): Promise<StoryPage[]>;
  getStoryPages(storyId: string): Promise<StoryPage[]>;
  
  // User settings methods
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createOrUpdateUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
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

  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db
      .insert(stories)
      .values(story)
      .returning();
    return newStory;
  }

  async getStory(id: string): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story || undefined;
  }

  async getStoriesByUser(userId: string): Promise<Story[]> {
    return await db
      .select()
      .from(stories)
      .where(eq(stories.userId, userId))
      .orderBy(desc(stories.createdAt));
  }

  async getPublicStories(): Promise<Story[]> {
    return await db
      .select()
      .from(stories)
      .where(eq(stories.isPublic, true))
      .orderBy(desc(stories.createdAt))
      .limit(20);
  }

  async updateStoryAudioUrl(id: string, audioUrl: string): Promise<void> {
    await db
      .update(stories)
      .set({ audioUrl })
      .where(eq(stories.id, id));
  }

  async createStoryPages(pages: InsertStoryPage[]): Promise<StoryPage[]> {
    return await db
      .insert(storyPages)
      .values(pages)
      .returning();
  }

  async getStoryPages(storyId: string): Promise<StoryPage[]> {
    return await db
      .select()
      .from(storyPages)
      .where(eq(storyPages.storyId, storyId))
      .orderBy(storyPages.pageNumber);
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings || undefined;
  }

  async createOrUpdateUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const existing = await this.getUserSettings(settings.userId);
    
    if (existing) {
      const [updated] = await db
        .update(userSettings)
        .set(settings)
        .where(eq(userSettings.userId, settings.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userSettings)
        .values(settings)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
