// src/services/aiService.ts

export interface AIRequest {
  action: 'summarize' | 'reply' | 'translate' | 'custom';
  emailContent: string;  // Textinhalt der E-Mail
  settings: {
    tone: string;        // Tonfall der Ausgabe
    greeting: string;    // Anrede-Format
    length: string;      // gewünschte Länge
    language: string;    // Zielsprache
  };
  customPrompt?: string;
  recipientName?: string;
}

export interface AIResponse {
  success: boolean;
  result: string;      // Antworttext oder Zusammenfassung
  error?: string;      // Fehlermeldung falls vorhanden
}

export class AIServiceImpl {
  private apiKey = "OwbXLLXDxVMK2ZyyrSMcVctpBct8wvAC6681PtuvZeL5U9ubTHeJQQJ99B6ACPV0roXJ3v3AAAAA6C06zz1X";  // Azure OpenAI API-Key
  private endpoint = 'https://your-openai-endpoint.openai.azure.com';
  private deployment = 'gpt-4o';
  private version = '2025-01-01-preview';

  /**
   * Führt die API-Anfrage aus und gibt das Ergebnis zurück.
   */
  async processEmail(request: AIRequest): Promise<AIResponse> {
    try {
      const prompt = this.buildPrompt(request);
      const url =
        `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.version}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Du bist ein E-Mail-Assistent…' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.6,
          max_tokens: 1000
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API ${res.status}: ${txt}`);
      }
      const data = await res.json();
      return {
        success: true,
        result: data.choices[0].message.content.trim()
      };
    } catch (e: unknown) {
      // Fehler-Objekt validieren und auf Error einschränken
      const err = e instanceof Error ? e : new Error(String(e));
      return { success: false, result: '', error: err.message };
    }
  }

  /** Baut den Prompt basierend auf Aktion und Einstellungen zusammen */
  private buildPrompt(req: AIRequest): string {
    const base = `E-Mail-Inhalt:\n${req.emailContent}\n` +
                 `Einstellungen: Ton=${req.settings.tone}, Länge=${req.settings.length}, Sprache=${req.settings.language}\n`;
    switch (req.action) {
      case 'summarize':
        return `Fasse diese E-Mail zusammen:\n${base}`;
      case 'reply':
        return `Schreibe eine Antwort auf die folgende E-Mail:\n${base}`;
      case 'translate':
        return `Übersetze den folgenden Inhalt ins ${req.settings.language}:\n${base}`;
      default:
        return `${base}${req.customPrompt || ''}`;
    }
  }
}

export const aiService = new AIServiceImpl();
