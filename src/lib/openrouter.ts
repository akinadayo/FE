// OpenRouter API client for AI chat functionality

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export async function chatWithAI(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'FE Learning App',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite-preview-09-2025',
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || '回答を生成できませんでした。';
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw error;
  }
}
