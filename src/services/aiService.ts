// aiService.ts – KI-Service für Azure OpenAI

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

  // Übernommene Prompts aus dem alten Code, jetzt im neuen System:
  private buildPrompt(request: AIRequest): string {
    const { action, emailContent, settings, customPrompt, recipientName } = request;

    // Kontext für KI zusammenbauen
    const baseContext = `
E-Mail Inhalt:
"${emailContent || ''}"

Einstellungen:
- Ton: ${settings.tone}
- Begrüßung: ${settings.greeting}
- Länge: ${settings.length}
- Sprache: ${settings.language}
`;

    switch (action) {
      case 'summarize':
        // Prompt aus altem Code (Stichpunkte, Fokus auf Klarheit/Struktur)
        return `Fasse den Inhalt der folgenden E-Mail in Stichpunkten zusammen. Nutze anstatt Striche - Punkte ● für prägnante Stichpunkte. Die Zusammenfassung darf etwas ausführlicher sein, soll aber dennoch klar und strukturiert bleiben. Ziel ist es, dem Nutzer einen schnellen, aber umfassenden Überblick zu geben: Worum geht es? Welche Themen oder Anliegen werden genannt? Was sind wichtige Informationen oder nächste Schritte? 
      
${baseContext}`;

      case 'reply': {
        // Prompt aus altem Code (Antwort mit Vorgaben)
        const name = recipientName || "[Name des Absenders der ursprünglichen E-Mail]";
        return `Formuliere eine Antwort auf die folgende E-Mail im ${settings.tone} Ton mit ${settings.greeting} Anrede (${settings.length}) Sprachstil: Verwende durchgängig die Schweizer Rechtschreibung. 
Inhaltliche Grundlage: Nutze den bereitgestellten E-Mail-Inhalt als Ausgangspunkt, ausser es wird ein separater Benutzertext angegeben, dann hat dieser Vorrang. 
Begrüssung: Beginne die Antwort mit: „Hallo ${name}". Wenn der Name des Absenders nicht erkannt werden kann, schreibe nur: „Hallo,". 
Grussformel: Lasse die Grussformel beim Beantworten von E-Mails aus. 
Tonalität: Parameter wie formell/informell sowie Sie/Du werden vom Benutzer angegeben. Richte Formulierung, Ansprache und Stil konsequent nach diesen Angaben aus. 
Formatierung: Lasse Betreff immer aus und bringe es nicht in die Antwort ein. Verzichte am Ende auf eine Grussformel.

${baseContext}
${customPrompt || ''}
`;
      }

      case 'translate':
        // Prompt aus altem Code (Ziel-Sprache ist settings.language)
        return `Übersetze den folgenden E-Mail-Inhalt vollständig und ausschließlich ins ${settings.language}:
${baseContext}
${customPrompt || ''}
`;

      case 'compose': {
        // Compose-Prompt (falls nötig anpassbar!)
        const recipients = request.composeContext?.to?.join(', ') || 'den Empfänger';
        const subject = request.composeContext?.subject || 'das angegebene Thema';
        const purpose = request.composeContext?.purpose || customPrompt || 'eine professionelle E-Mail';
        return `
Empfänger: ${recipients}
Betreff: ${subject}
Zweck: ${purpose}

Schreibe eine vollständige neue E-Mail im gewünschten Stil und Ton. 
Achte auf eine passende Begrüßung und einen sauberen Abschluss. Nutze die angegebenen Einstellungen:

${baseContext}
`;
      }

      case 'custom': {
        // Prompt aus Freier Modus
        return `${baseContext}
${customPrompt || ''}
`;
      }

      default:
        // Fallback-Analyse
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
