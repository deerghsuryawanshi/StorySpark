import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  ageGroup: text("age_group").notNull(), // toddlers, kids, tweens
  theme: text("theme").notNull(), // fairy-tale, adventure, animals, moral
  characters: text("characters").array().notNull().default(sql`ARRAY[]::text[]`),
  language: text("language").notNull().default('english'), // english, hindi
  userId: varchar("user_id"), // optional for guest users
  isPublic: boolean("is_public").default(false),
  readingTime: integer("reading_time"), // estimated reading time in minutes
  audioUrl: text("audio_url"), // URL to generated audio file
  createdAt: timestamp("created_at").defaultNow(),
});

export const storyPages = pgTable("story_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storyId: varchar("story_id").notNull(),
  pageNumber: integer("page_number").notNull(),
  content: text("content").notNull(),
  illustration: text("illustration"), // URL to illustration image
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  preferredLanguage: text("preferred_language").default('english'),
  contentFiltering: boolean("content_filtering").default(true),
  timeLimit: integer("time_limit"), // minutes per day
  bedtimeMode: boolean("bedtime_mode").default(false),
});

// Relations
export const userRelations = relations(users, ({ many, one }) => ({
  stories: many(stories),
  settings: one(userSettings),
}));

export const storyRelations = relations(stories, ({ many, one }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
  pages: many(storyPages),
}));

export const storyPageRelations = relations(storyPages, ({ one }) => ({
  story: one(stories, {
    fields: [storyPages.storyId],
    references: [stories.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  audioUrl: true,
});

export const insertStoryPageSchema = createInsertSchema(storyPages).omit({
  id: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type StoryPage = typeof storyPages.$inferSelect;
export type InsertStoryPage = z.infer<typeof insertStoryPageSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
