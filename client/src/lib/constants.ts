export const AGE_GROUPS = [
  { value: 'toddlers', label: 'Toddlers (2-4)', emoji: '👶' },
  { value: 'kids', label: 'Kids (5-8)', emoji: '🧒' },
  { value: 'tweens', label: 'Tweens (9-12)', emoji: '👦' },
] as const;

export const THEMES = [
  { value: 'fairy-tale', label: 'Fairy Tale', emoji: '🦄', color: 'story-pink' },
  { value: 'adventure', label: 'Adventure', emoji: '🗺️', color: 'story-orange' },
  { value: 'animals', label: 'Animals', emoji: '🐻', color: 'story-yellow' },
  { value: 'moral', label: 'Moral', emoji: '❤️', color: 'story-green' },
] as const;

export const LANGUAGES = [
  { value: 'english', label: 'EN', fullLabel: 'English' },
  { value: 'hindi', label: 'हिं', fullLabel: 'Hindi' },
] as const;

export type AgeGroup = typeof AGE_GROUPS[number]['value'];
export type Theme = typeof THEMES[number]['value'];
export type Language = typeof LANGUAGES[number]['value'];
