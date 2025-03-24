import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText as aiGenerateText } from 'ai';

type GenerateTextOptions = {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
};

/**
 * Generates text using the OpenRouter API
 * @param options The options for text generation
 * @returns The generated text
 */
export async function generateText(options: GenerateTextOptions) {
  const { model, prompt, temperature = 0.7, maxTokens = 4000 } = options;
  
  // Check if we have an API key
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('No OpenRouter API key provided, returning demo content');
    return {
      text: `This is demo content generated without an API key.
      
Your prompt was: "${prompt}"
      
In a real environment with a valid API key, this would contain AI-generated content based on your request.`
    };
  }
  
  try {
    // Use the openrouter function to create a valid language model
    const modelProvider = openrouter("deepseek/deepseek-r1:free");
    
    return aiGenerateText({
      model: modelProvider,
      prompt,
      temperature,
      maxTokens,
    });
  } catch (error) {
    console.error('Error generating text with OpenRouter:', error);
    throw error;
  }
} 