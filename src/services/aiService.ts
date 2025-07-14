// aiService.ts – KI-Service für Azure OpenAI

export interface AIRequest {
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

export interface AIResponse {
  result: string;
  success: boolean;
  error?: string;
}

export class AIServiceImpl {
  private apiKey: string;
  private endpointBase: string;
  private deploymentName: string;
  private apiVersion: string;

  constructor() {
    const {
      VITE_API_KEY,
      VITE_ENDPOINT,
      VITE_DEPLOYMENT_NAME,
      VITE_API_VERSION,
    } = import.meta.env;

    if (!VITE_API_KEY || !VITE_ENDPOINT || !VITE_DEPLOYMENT_NAME) {
      throw new Error(
        'Bitte .env.local prüfen: VITE_API_KEY, VITE_ENDPOINT und VITE_DEPLOYMENT_NAME müssen gesetzt sein.'
      );
    }

    this.apiKey = VITE_API_KEY;
    this.endpointBase = VITE_ENDPOINT;
    this.deploymentName = VITE_DEPLOYMENT_NAME;
    this.apiVersion = VITE_API_VERSION || '2023-05-15';
  }

  public setConfig(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
    console.log('API Key via setConfig gesetzt:', this.apiKey);
  }

  public async processEmail(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        result: '',
        error: 'API Key nicht konfiguriert. Bitte fügen Sie Ihren Azure OpenAI API Key hinzu.',
      };
    }

    try {
      const prompt = this.buildPrompt(request);
      const url =
        [
          this.endpointBase,
          'openai',
          'deployments',
          this.deploymentName,
          'chat/completions',
        ].join('/') +
        `?api-version=${this.apiVersion}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'Du bist ein E-Mail-Assistent. Verwende immer die Schweizer Rechtschreibung. Nutze den bereitgestellten E-Mail-Inhalt als Grundlage, sofern kein separater Benutzertext gegeben ist.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.6,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`OpenAI API Error ${response.status}:`, errBody);
        throw new Error(`OpenAI API returned ${response.status}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten';

      return {
        success: true,
        result: result.trim(),
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        result: '',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      };
    }
  }

  private buildPrompt(request: AIRequest): string {
    const { action, emailContent, settings, customPrompt, recipientName } =
      request;

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
        return `Fasse den Inhalt der folgenden E-Mail in Stichpunkten zusammen. Nutze anstatt Striche - Punkte ● für prägnante Stichpunkte. Die Zusammenfassung darf etwas ausführlicher sein, soll aber dennoch klar und strukturiert bleiben. Ziel ist es, dem Nutzer einen schnellen, aber umfassenden Überblick zu geben: Worum geht es? Welche Themen oder Anliegen werden genannt? Was sind wichtige Informationen oder nächste Schritte? 

${baseContext}`;

      case 'reply': {
        const name =
          recipientName || '[Name des Absenders der ursprünglichen E-Mail]';
        return `Formuliere eine Antwort auf die folgende E-Mail im ${settings.tone} Ton mit ${settings.greeting} Anrede (${settings.length}) Sprachstil: Verwende durchgängig die Schweizer Rechtschreibung.
Inhaltliche Grundlage: Nutze den bereitgestellten E-Mail-Inhalt als Ausgangspunkt, ausser es wird ein separater Benutzertext angegeben, dann hat dieser Vorrang.
Begrüssung: Beginne die Antwort mit: „Hallo ${name}". Wenn der Name des Absenders nicht erkannt werden kann, schreibe nur: „Hallo,".
Grussformel: Lasse die Grussformel beim Beantworten von E-Mails aus.
Tonalität: Parameter wie formell/informell sowie Sie/Du werden vom Benutzer angegeben. Richte Formulierung, Ansprache und Stil konsequent nach diesen Angaben aus.
Formatierung: Lasse Betreff immer aus und bringe es nicht in die Antwort ein. Verzichte am Ende auf eine Grussformel.

${baseContext}
${customPrompt || ''}`;
      }

      case 'translate':
        return `Übersetze den folgenden E-Mail-Inhalt vollständig und ausschließlich ins ${settings.language}:
${baseContext}
${customPrompt || ''}`;

      case 'compose': {
        const recipients =
          request.composeContext?.to.join(', ') || 'den Empfänger';
        const subject = request.composeContext?.subject || 'das angegebene Thema';
        const purpose =
          request.composeContext?.purpose || customPrompt || 'eine professionelle E-Mail';
        return `
Empfänger: ${recipients}
Betreff: ${subject}
Zweck: ${purpose}

Schreibe eine vollständige neue E-Mail im gewünschten Stil und Ton. 
Achte auf eine passende Begrüßung und einen sauberen Abschluss. Nutze die angegebenen Einstellungen:

${baseContext}`;
      }

      case 'custom':
        return `${baseContext}
${customPrompt || ''}`;

      default:
        return `${baseContext}
Aufgabe: Analysiere diese E-Mail und gib hilfreiche Hinweise.`;
    }
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const aiService = new AIServiceImpl();
