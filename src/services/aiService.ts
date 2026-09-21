export interface ChatAction {
  type: 'navigate' | 'call';
  label: string;
  tab?: string;
  phone?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: ChatAction[];
  isError?: boolean;
}

export interface ChatResponse {
  text: string;
  actions?: ChatAction[];
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<ChatResponse> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        text:
          errData.text ||
          'AI Assistant is temporarily unavailable. Please contact Vidya Vikas EM School at 9441971531.',
        actions: errData.actions || [
          { type: 'call', label: 'Call 9441971531', phone: '9441971531' },
          { type: 'navigate', label: 'Admission Enquiry', tab: 'admissions' },
        ],
      };
    }

    const data: ChatResponse = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to communicate with AI chat endpoint:', error);
    return {
      text: 'AI Assistant is temporarily unavailable. Please contact Vidya Vikas EM School at 9441971531.',
      actions: [
        { type: 'call', label: 'Call 9441971531', phone: '9441971531' },
        { type: 'navigate', label: 'Admission Enquiry', tab: 'admissions' },
        { type: 'navigate', label: 'Contact Details', tab: 'contact' },
      ],
    };
  }
}
