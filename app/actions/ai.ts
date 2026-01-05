'use server';

import { DEFAULT_AI_MODEL } from '@/lib/ai-models';

export async function generateAIResponse(prompt: string, model: string = DEFAULT_AI_MODEL) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const siteName = 'Guitar CRM';

  if (!apiKey) {
    return { error: 'OpenRouter API key is not configured.' };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant for the Guitar CRM admin dashboard. Keep your answers concise and relevant to managing a music school.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API Error:', errorData);
      return { error: `API Error: ${response.statusText}` };
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  } catch (error) {
    console.error('Failed to fetch AI response:', error);
    return { error: 'Failed to connect to AI service.' };
  }
}
