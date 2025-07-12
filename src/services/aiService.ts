// AI Service für E-Mail-Verarbeitung
interface AIServiceConfig {
  apiKey: string;
  baseUrl?: string;
}

interface AIRequest {
  action: 'summarize' | 'reply' | 'translate' | 'custom';
  emailContent: string;
  settings: {
    tone: string;
    greeting: string;
    length: string;
    language: string;
  };
  customPrompt?: string;
  recipientName?: string;
}

interface AIResponse {
  result: string;
  success: boolean;
  error?: string;
}

class AIServiceImpl {
  private config: AIServiceConfig | null = null;

  setConfig(config: AIServiceConfig) {
    this.config = config;
  }

  async processEmail(request: AIRequest): Promise<AIResponse> {
    if (!this.config?.apiKey) {
      return {
        success: false,
        result: '',
        error: 'API Key nicht konfiguriert. Bitte fügen Sie Ihren API Key hinzu.'
      };
    }

    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein professioneller E-Mail-Assistent. Antworte präzise und hilfsbereit auf Deutsch.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 1000,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten';

      return {
        success: true,
        result: result.trim()
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        result: '',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  private buildPrompt(request: AIRequest): string {
    const { action, emailContent, settings, customPrompt, recipientName } = request;

    const baseContext = `
E-Mail Inhalt:
"${emailContent}"

Einstellungen:
- Ton: ${settings.tone}
- Begrüßung: ${settings.greeting}
- Länge: ${settings.length}
- Sprache: ${settings.language}
`;

    switch (action) {
      case 'summarize':
        return `${baseContext}

Aufgabe: Erstelle eine prägnante Zusammenfassung dieser E-Mail mit den wichtigsten Punkten und empfohlenen Aktionen.`;

      case 'reply':
        const greeting = recipientName ? `Hallo ${recipientName}` : 'Hallo';
        return `${baseContext}
${recipientName ? `Empfänger Name: ${recipientName}` : ''}

Aufgabe: Schreibe eine professionelle Antwort auf diese E-Mail. Beginne mit "${greeting}" und berücksichtige die angegebenen Einstellungen.`;

      case 'translate':
        return `${baseContext}

Aufgabe: Übersetze diese E-Mail ins Englische und behalte dabei den ursprünglichen Ton und die Formatierung bei.`;

      case 'custom':
        return `${baseContext}

Spezielle Anfrage: ${customPrompt}

Aufgabe: Bearbeite die E-Mail basierend auf der speziellen Anfrage und berücksichtige dabei die Einstellungen.`;

      default:
        return `${baseContext}

Aufgabe: Analysiere diese E-Mail und gib hilfreiche Hinweise.`;
    }
  }

  isConfigured(): boolean {
    return !!this.config?.apiKey;
  }
}

export const aiService = new AIServiceImpl();
export type { AIServiceConfig, AIRequest, AIResponse };