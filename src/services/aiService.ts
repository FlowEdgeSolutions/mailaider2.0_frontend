// src/services/aiService.ts
export interface AIRequest {
  action: "summarize" | "reply" | "translate" | "custom";
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

export interface AIResponse {
  success: boolean;
  result: string;
  error?: string;
}

export class AIServiceImpl {
  // ⬇︎ 1.  IDENTISCHE Werte wie im alten HTML
  private apiKey    = "9psvVslPXfp4xbJ9SzRXpfx9E9lP8TLiFcC3IZgf43RLNQA9RiV4JQQJ99BFACI8hq2XJ3w3AAABACOGHQcr";
  private endpoint  = "https://openaiaddinapi.openai.azure.com";
  private deployment = "gpt-4o_MailAiderAi_OutlookAddIn";
  private version    = "2025-01-01-preview";

  /** Führt die API‑Anfrage aus */
  async processEmail(request: AIRequest): Promise<AIResponse> {
    try {
      const prompt = this.buildPrompt(request);

      // ⬇︎ 2.  URL baut jetzt exakt dieselbe Struktur
      const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.version}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Du bist ein E‑Mail‑Assistent. Verwende immer die Schweizer Rechtschreibung. Nutze den bereitgestellten E‑Mail‑Inhalt als Grundlage, sofern kein separater Benutzertext gegeben ist.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 1000,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API ${res.status}: ${txt}`);
      }

      const data = await res.json();
      return {
        success: true,
        result: data.choices[0].message.content.trim(),
      };
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      return { success: false, result: "", error: err.message };
    }
  }

  /** Baut den Prompt basierend auf Aktion und Einstellungen */
  private buildPrompt(req: AIRequest): string {
    const base =
      `E-Mail-Inhalt:\n${req.emailContent}\n` +
      `Einstellungen: Ton=${req.settings.tone}, Länge=${req.settings.length}, Sprache=${req.settings.language}\n`;

    switch (req.action) {
      case "summarize":
        return `Fasse diese E-Mail zusammen:\n${base}`;
      case "reply":
        return `Schreibe eine Antwort auf die folgende E-Mail:\n${base}`;
      case "translate":
        return `Übersetze den folgenden Inhalt ins ${req.settings.language}:\n${base}`;
      default:
        return `${base}${req.customPrompt || ""}`;
    }
  }
}

export const aiService = new AIServiceImpl();
