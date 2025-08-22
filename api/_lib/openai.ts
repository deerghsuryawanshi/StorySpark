import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set. Please add your OpenAI API key to environment variables.");
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
    - No violence, scary themes, or inappropriate content
    
    Respond in JSON format:
    {
      "title": "Story title",
      "content": "Full story content with paragraphs separated by \\n\\n",
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
    
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error("Invalid OpenAI API key. Please check your API key is correct and has credits available.");
    }
    
    throw new Error("Failed to generate story. Please try again.");
  }
}

export async function generateTextToSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text.substring(0, 4000), // Limit text length for TTS
      speed: 0.9,
    });

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error generating speech:", error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error("Invalid OpenAI API key for text-to-speech. Please check your API key.");
    }
    
    throw new Error("Failed to generate audio. Please try again.");
  }
}