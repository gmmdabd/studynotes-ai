import axios from 'axios';
import { NoteFormData } from '@/components/NoteGenerationForm';
import { PracticeFormData } from '@/components/PracticePageForm';

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function generateNote(formData: NoteFormData, apiKey: string): Promise<string> {
  const model = determineModelBySubscription(apiKey);
  
  const { prompt, subject, topic, detail } = formData;
  
  const detailLevel = {
    basic: 'Create a brief overview with key points',
    detailed: 'Create detailed notes with examples and explanations',
    comprehensive: 'Create comprehensive notes with in-depth explanations, examples, and additional resources',
  };
  
  const promptText = `
    Generate educational notes on the subject of ${subject}, focusing on the topic of ${topic}.
    ${detailLevel[detail]}.
    ${prompt ? `Additional instructions: ${prompt}` : ''}
    
    Format the notes in markdown with proper headings, bullet points, and sections.
    Include a brief summary at the beginning.
  `;
  
  try {
    const response = await axios.post<OpenRouterResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator who specializes in creating high-quality, informative notes for students. You format your responses in clear, organized markdown.',
          },
          {
            role: 'user',
            content: promptText,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating notes:', error);
    throw new Error('Failed to generate notes. Please try again later.');
  }
}

export async function generatePracticePaper(formData: PracticeFormData, apiKey: string): Promise<string> {
  const model = determineModelBySubscription(apiKey);
  
  const { prompt, subject, topic, difficulty, questionCount, includeAnswers } = formData;
  
  const difficultyPrompt = {
    easy: 'Create basic questions suitable for beginners',
    medium: 'Create moderately challenging questions requiring good understanding',
    hard: 'Create advanced questions that challenge deep understanding and application',
  };
  
  const promptText = `
    Generate a practice paper on the subject of ${subject}, focusing on the topic of ${topic}.
    ${difficultyPrompt[difficulty]}.
    Include exactly ${questionCount} questions.
    ${includeAnswers ? 'Include an answer key at the end.' : 'Do not include answers.'}
    ${prompt ? `Additional instructions: ${prompt}` : ''}
    
    Format the practice paper in markdown with proper numbering, sections, and clear instructions.
  `;
  
  try {
    const response = await axios.post<OpenRouterResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator who specializes in creating high-quality practice papers and examinations. You format your responses in clear, organized markdown.',
          },
          {
            role: 'user',
            content: promptText,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating practice paper:', error);
    throw new Error('Failed to generate practice paper. Please try again later.');
  }
}

// Helper function to determine which model to use based on subscription
function determineModelBySubscription(apiKey: string): string {
  // If it's the default API key (free tier), use a more affordable model
  if (apiKey === process.env.OPENROUTER_API_KEY) {
    return 'mistralai/mistral-7b-instruct'; // More affordable model for free users
  }
  
  // For premium users, use a more powerful model
  return 'anthropic/claude-3-opus-20240229'; // More powerful model for premium users
} 