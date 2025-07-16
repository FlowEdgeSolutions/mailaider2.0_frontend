// src/services/aiService.ts

/**
 * Interface für AI-Anfragen
 * @property action - Gewünschte Aktion (Zusammenfassen, Antworten, etc.)
 * @property emailContent - Optionaler E-Mail-Inhalt zur Verarbeitung
 * @property settings - Konfiguration für die AI-Generierung
 * @property customPrompt - Benutzerdefinierte Prompt-Anweisung
 * @property composeContext - Kontext für neue E-Mails
 */
export interface AIRequest {
  action: "summarize" | "reply" | "translate" | "custom" | "compose";
  emailContent?: string;
  settings: {
    tone: string;
    greeting: string;
    length: string;
    language: string;
  };
  customPrompt?: string;
  recipientName?: string;
  composeContext?: {
    to: string[];
    subject: string;
    purpose: string;
  };
}

/**
 * Interface für AI-Antworten
 * @property success - Erfolgsstatus
 * @property result - Generierter Text
 * @property raw - Rohdaten der API-Antwort
 * @property error - Fehlermeldung (falls vorhanden)
 */
export interface AIResponse {
  success: boolean;
  result: string;
  raw?: unknown;
  error?: string;
}

/**
 * Implementierung des AI-Services mit Timeout und verbesserter Fehlerbehandlung
 */
export class AIServiceImpl {
  // Konfiguration (sollte in Produktion aus Umgebungsvariablen oder Office-Einstellungen kommen)
  private apiKey: string;
  private endpoint: string;
  private deployment: string;
  private version: string;
  private defaultTimeout: number = 15000; // 15 Sekunden Timeout

  constructor(
    apiKey: string = "9psvVslPXfp4xbJ9SzRXpfx9E9lP8TLiFcC3IZgf43RLNQA9RiV4JQQJ99BFACI8hq2XJ3w3AAABACOGHQcr",
    endpoint: string = "https://openaiaddinapi.openai.azure.com",
    deployment: string = "gpt-4o_MailAiderAi_OutlookAddIn",
    version: string = "2025-01-01-preview"
  ) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.deployment = deployment;
    this.version = version;
  }

  /**
   * Prüft ob der Service konfiguriert ist
   * @returns boolean - True wenn API-Key vorhanden
   */
  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim());
  }

  /**
   * Verarbeitet eine E-Mail-Anfrage mit Timeout-Schutz
   * @param request - AIRequest Objekt mit Anfragedaten
   * @returns Promise<AIResponse> - Antwort des AI-Services
   */
  async processEmail(request: AIRequest): Promise<AIResponse> {
    // Erstelle AbortController für Timeout-Steuerung
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      const prompt = this.buildPrompt(request);
      const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.version}`;

      // API-Request mit Timeout-Signal
      const res = await fetch(url, {
        method: "POST",
        signal: controller.signal, // Verbindung mit Timeout verknüpfen
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Du bist ein E-Mail-Assistent. Verwende immer die Schweizer Rechtschreibung. Nutze den bereitgestellten E-Mail-Inhalt als Grundlage, sofern kein separater Benutzertext gegeben ist.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 1000,
        }),
      });

      // Clear timeout da Anfrage erfolgreich gestartet
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("🔎 OpenAI Response", data);

      return {
        success: true,
        result: data.choices?.[0]?.message?.content?.trim() ?? "",
        raw: data,
      };
    } catch (error: unknown) {
      // Timeout oder anderer Fehler
      clearTimeout(timeoutId); // Sicherheitshalber clearen
      
      const errorMessage = error instanceof Error 
        ? error.name === "AbortError"
          ? "Anfragezeitüberschreitung: Die Verbindung war zu langsam."
          : error.message
        : "Unbekannter Fehler";

      console.error("AI Service Error:", error);
      return { 
        success: false, 
        result: "", 
        error: errorMessage 
      };
    }
  }

  /**
   * Erstellt den Prompt für die AI-Anfrage
   * @param req - AIRequest Objekt
   * @returns string - Formattierter Prompt
   */
  private buildPrompt(req: AIRequest): string {
    if (req.action === "compose" && req.composeContext) {
      const { to, subject, purpose } = req.composeContext;
      return `Verfasse eine neue E-Mail an ${to.join(", ")} mit Betreff "${subject}". Zweck: ${purpose}`;
    }

    const base = `E-Mail-Inhalt:\n${req.emailContent ?? ""}\n` +
                 `Einstellungen: Ton=${req.settings.tone}, ` +
                 `Länge=${req.settings.length}, ` +
                 `Sprache=${req.settings.language}\n`;

    switch (req.action) {
      case "summarize": return `Fasse diese E-Mail zusammen:\n${base}`;
      case "reply": return `Schreibe eine Antwort:\n${base}`;
      case "translate": return `Übersetze ins ${req.settings.language}:\n${base}`;
      default: return `${base}${req.customPrompt || ""}`;
    }
  }
}

// Singleton-Instanz
export const aiService = new AIServiceImpl();