// aiServices.ts – KI-Service für Azure OpenAI

interface AIServiceConfig {
  apiKey: string;
  baseUrl?: string; // Optional, falls du flexibel mehrere Deployments nutzen möchtest
}

interface AIRequest {
  action: 'summarize' | 'reply' | 'translate' | 'custom' | 'compose';
  emailContent?: string;
  composeContext?: {
    to: string[];
    subject: string;
    purpose?: string;
  };
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
        error: 'API Key nicht konfiguriert. Bitte fügen Sie Ihren Azure OpenAI API Key hinzu.'
      };
    }

    try {
      const prompt = this.buildPrompt(request);

      // Setze hier deinen Azure-Endpunkt als Default, falls keiner per Config übergeben wird
      const endpoint =
        this.config.baseUrl ||
        "https://openaiaddinapi.openai.azure.com/openai/deployments/gpt-4o_MailAiderAi_OutlookAddIn/chat/completions?api-version=2025-01-01-preview";

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'Du bist ein E-Mail-Assistent. Verwende immer die Schweizer Rechtschreibung. Nutze den bereitgestellten E-Mail-Inhalt als Grundlage, sofern kein separater Benutzertext gegeben ist.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.6,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      // Azure OpenAI response structure:
      // { choices: [{ message: { content: "..." } }] }
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

      case 'reply': {
        const greeting = recipientName ? `Hallo ${recipientName}` : 'Hallo';
        return `${baseContext}
${recipientName ? `Empfänger Name: ${recipientName}` : ''}

Aufgabe: Schreibe eine professionelle Antwort auf diese E-Mail. Beginne mit "${greeting}" und berücksichtige die angegebenen Einstellungen.`;
      }

      case 'translate':
        return `${baseContext}

Aufgabe: Übersetze diese E-Mail ins Englische und behalte dabei den ursprünglichen Ton und die Formatierung bei.`;

      case 'compose': {
        const recipients = request.composeContext?.to?.join(', ') || 'den Empfänger';
        const subject = request.composeContext?.subject || 'das angegebene Thema';
        const purpose = request.customPrompt || 'eine professionelle E-Mail';
        return `${baseContext}

Empfänger: ${recipients}
Betreff: ${subject}
Zweck: ${purpose}

Aufgabe: Verfasse eine vollständige E-Mail mit angemessener Begrüßung und Schlussformel für die angegebenen Empfänger.`;
      }

      case 'custom': {
        return `${baseContext}

Spezielle Anfrage: ${customPrompt}

Aufgabe: Bearbeite die E-Mail basierend auf der speziellen Anfrage und berücksichtige dabei die Einstellungen.`;
      }

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
