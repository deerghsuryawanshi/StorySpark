import { users, stories, storyPages, type User, type InsertUser, type Story, type InsertStory, type StoryPage, type InsertStoryPage } from "../../shared/schema.js";
import { db } from "./db.js";
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