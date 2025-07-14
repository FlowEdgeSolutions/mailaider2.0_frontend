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
  private readonly apiKey: string;
  private readonly endpointBase: string;
  private readonly deploymentName: string;
  private readonly apiVersion: string;

  constructor() {
    // Hartkodierte Konfigurationswerte (nur für Entwicklung)
    this.apiKey = "OwbXLLXDxVMK2ZyyrSMcVctpBct8wvAC6681PtuvZeL5U9ubTHeJQQJ99B6ACPV0roXJ3v3AAAAA6C06zz1X";
    this.endpointBase = "https://malladerise.openai.azure.com";
    this.deploymentName = "gpt-4o";
    this.apiVersion = "2025-01-01-preview";

    console.log('Azure OpenAI Service initialisiert mit festen Werten');
  }

  public async processEmail(request: AIRequest): Promise<AIResponse> {
    try {
      const prompt = this.buildPrompt(request);

      const url =
        [
          this.endpointBase,
          'openai',
          'deployments',
          this.deploymentName,
          'chat/completions',
        ].join('/') + `?api-version=${this.apiVersion}`;

      const body = {
        messages: [
          {
            role: 'system',
            content:
              'Du bist ein E-Mail-Assistent. Verwende immer die Schweizer Rechtschreibung. Nutze den bereitgestellten E-Mail-Inhalt als Grundlage, sofern kein separater Benutzertext gegeben ist.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 1000,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`OpenAI API returned ${response.status}: ${errBody}`);
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
    const { action, emailContent, settings, customPrompt, recipientName } = request;

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
        const name = recipientName || '[Name des Absenders der ursprünglichen E-Mail]';
        return `Formuliere eine Antwort auf die folgende E-Mail im ${settings.tone} Ton mit ${settings.greeting} Anrede (${settings.length}) Sprachstil: Verwende durchgängig die Schweizer Rechtschreibung.
Inhaltliche Grundlage: Nutze den bereitgestellten E-Mail-Inhalt als Ausgangspunkt, ausser es wird ein separater Benutzertext angegeben, dann hat dieser Vorrang.
Begrüßung: Beginne die Antwort mit: „Hallo ${name}". Wenn der Name des Absenders nicht erkannt werden kann, schreibe nur: „Hallo,".
Grußformel: Lasse die Grußformel beim Beantworten von E-Mails aus.
Tonalität: Parameter wie formell/informell sowie Sie/Du werden vom Benutzer angegeben. Richte Formulierung, Ansprache und Stil konsequent nach diesen Angaben aus.
Formatierung: Lasse Betreff immer aus und bringe es nicht in die Antwort ein. Verzichte am Ende auf eine Grußformel.

${baseContext}
${customPrompt || ''}`;
      }

      case 'translate':
        return `Übersetze den folgenden E-Mail-Inhalt vollständig und ausschließlich ins ${settings.language}:
${baseContext}
${customPrompt || ''}`;

      case 'compose': {
        const recipients = request.composeContext?.to.join(', ') || 'den Empfänger';
        const subject = request.composeContext?.subject || 'das angegebene Thema';
        const purpose = request.composeContext?.purpose || customPrompt || 'eine professionelle E-Mail';
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
}

export const aiService = new AIServiceImpl();