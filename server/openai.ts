import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface StoryGenerationRequest {
  ageGroup: 'toddlers' | 'kids' | 'tweens';
  theme: 'fairy-tale' | 'adventure' | 'animals' | 'moral';
  characters: string[];
  language: 'english' | 'hindi';
}

interface GeneratedStory {
  title: string;
  content: string;
  pages?: {
    content: string;
    illustration?: string;
  }[];
}

export async function generateStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
  try {
    const { ageGroup, theme, characters, language } = request;
    
    // Create age-appropriate and safe prompts
    const agePrompts = {
      toddlers: "very simple words, short sentences, basic concepts, repetitive patterns",
      kids: "simple vocabulary, clear moral lessons, engaging adventures, easy to understand",
      tweens: "richer vocabulary, complex characters, deeper moral lessons, exciting plots"
    };

    const themePrompts = {
      'fairy-tale': "magical kingdoms, princes and princesses, happy endings, wonder and magic",
      'adventure': "exciting journeys, brave heroes, overcoming challenges, discovery",
      'animals': "friendly animal characters, forest adventures, animal friendships, nature lessons",
      'moral': "important life lessons, kindness and sharing, being brave and honest, helping others"
    };

    const languageInstructions = language === 'hindi' 
      ? "Write the story in Hindi using Devanagari script. Use simple Hindi vocabulary appropriate for children."
      : "Write the story in English using simple, child-friendly vocabulary.";

    const safetyGuidelines = `
    IMPORTANT SAFETY GUIDELINES:
    - Only positive, uplifting, and educational content
    - No violence, scary elements, or frightening situations
    - No inappropriate themes or adult content
    - Characters should be kind, helpful, and demonstrate good values
    - Story should teach positive life lessons
    - Use encouraging and supportive language
    - Ensure all content is completely safe for children
    `;

    const systemPrompt = `You are a professional children's story writer who creates safe, educational, and entertaining stories for kids. ${safetyGuidelines}

Create stories that are:
- Age-appropriate for ${ageGroup}
- Themed around ${theme}
- Featuring characters: ${characters.join(', ')}
- Using ${agePrompts[ageGroup]}
- Following ${themePrompts[theme]}
- ${languageInstructions}

The story should be exactly the right length for the age group:
- Toddlers: 100-200 words
- Kids: 200-400 words  
- Tweens: 400-600 words

Format your response as JSON with this structure:
{
  "title": "Story title",
  "content": "Full story text",
  "pages": [
    {
      "content": "Content for page 1",
      "illustration": "Description of illustration for this page"
    }
  ]
}

Break longer stories into 3-5 pages for better reading experience.`;

    const userPrompt = `Create a ${theme} story for ${ageGroup} featuring these characters: ${characters.join(', ')}. 
    
The story should:
- Be completely safe and appropriate for children
- Teach a positive moral lesson
- Be engaging and fun to read
- Include the characters as heroes of the story
- Have a happy, uplifting ending
- Be written in ${language}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8, // More creative for storytelling
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate the response has required fields
    if (!result.title || !result.content) {
      throw new Error('Invalid story format received from AI');
    }

    // Ensure content is appropriate length
    const wordCount = result.content.split(' ').length;
    const expectedRanges = {
      toddlers: [50, 250],
      kids: [150, 500],
      tweens: [300, 700]
    };
    
    const [minWords, maxWords] = expectedRanges[ageGroup];
    if (wordCount < minWords || wordCount > maxWords) {
      console.warn(`Story length (${wordCount} words) outside expected range for ${ageGroup}`);
    }

    return {
      title: result.title,
      content: result.content,
      pages: result.pages || []
    };

  } catch (error) {
    console.error('Error generating story:', error);
    throw new Error(`Failed to generate story: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateTextToSpeech(text: string, language: 'english' | 'hindi'): Promise<string> {
  try {
    // For now, we'll return a placeholder URL since implementing actual TTS would require
    // additional setup for audio file storage and serving
    // In a production environment, you would:
    // 1. Use OpenAI's TTS API or Google Text-to-Speech
    // 2. Store the audio file in cloud storage (S3, etc.)
    // 3. Return the public URL to the audio file
    
    // Since we have Web Speech API implemented on the frontend,
    // we'll return a placeholder that indicates browser TTS should be used
    return `browser-tts://${language}`;
    
  } catch (error) {
    console.error('Error generating text-to-speech:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Alternative implementation using actual OpenAI TTS (commented out for now)
/*
export async function generateTextToSpeechWithOpenAI(text: string, language: 'english' | 'hindi'): Promise<string> {
  try {
    const voice = language === 'hindi' ? 'alloy' : 'nova'; // OpenAI voices
    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
      speed: 0.9, // Slightly slower for kids
    });

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // In production, upload to cloud storage and return URL
    // For now, we'll need to implement file serving
    const filename = `story-${Date.now()}.mp3`;
    
    // This would require implementing file storage and serving
    // For example, with AWS S3 or similar service
    
    return `/api/audio/${filename}`;
    
  } catch (error) {
    console.error('Error generating OpenAI TTS:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
*/
