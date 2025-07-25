// src/services/aiService.ts
//test
import { PROMPTS } from "../services/prompts";

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
  settings: SettingsData;
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
 * Typdefinition für SettingsData erweitern
 */
export interface SettingsData {
  tone: string;
  greeting: string;
  length: string;
  language: string;
  region?: string;
}

/**
 * Implementierung des AI-Services mit Timeout und verbesserter Fehlerbehandlung
 */
export class AIServiceImpl {
  /**
   * Prüft ob der Service konfiguriert ist
   * @returns boolean - True wenn Backend-URL vorhanden
   */
  public isConfigured(): boolean {
    // Das Frontend benötigt keine API-Key-Prüfung mehr, sondern nur die Backend-URL
    return true; // Immer true, solange das Backend erreichbar ist
  }

  /**
   * Verarbeitet eine E-Mail-Anfrage über das eigene Backend
   * @param request - AIRequest Objekt mit Anfragedaten
   * @returns Promise<AIResponse> - Antwort des Backends
   */
  async processEmail(request: AIRequest): Promise<AIResponse> {
    try {
      // Prompt im Frontend bauen (optional: kann auch ins Backend verlagert werden)
      const prompt = this.buildPrompt(request);
      // Anfrage an das eigene Backend schicken
      const res = await fetch("http://localhost:4000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          result: '',
          error: `Fehler vom Backend (${res.status}): ${errorText}`,
        };
      }
      const data = await res.json();
      return {
        success: true,
        result: data.result ?? '',
        raw: data,
      };
    } catch (error: unknown) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unbekannter Fehler bei der Backend-Anfrage.';
      }
      return {
        success: false,
        result: '',
        error: errorMessage,
      };
    }
  }

  /**
   * Erstellt den Prompt für die AI-Anfrage
   * @param req - AIRequest Objekt
   * @returns string - Formattierter Prompt
   */
  private buildPrompt(req: AIRequest): string {
    const base = `E-Mail-Inhalt:\n${req.emailContent ?? ""}\n` +
                 `Einstellungen: Ton=${req.settings.tone}, ` +
                 `Länge=${req.settings.length}, ` +
                 `Sprache=${req.settings.language}\n`;

    switch (req.action) {
      case "summarize":
        return PROMPTS.summarize.replace("{base}", base);
      case "reply":
        return PROMPTS.reply
          .replace("{base}", base)
          .replace("{tone}", req.settings.tone);
      case "translate":
        return PROMPTS.translate
          .replace("{language}", req.settings.language)
          .replace("{base}", base);
      case "compose":
        if (req.composeContext) {
          return PROMPTS.compose
            .replace("{to}", req.composeContext.to.join(", "))
            .replace("{subject}", req.composeContext.subject)
            .replace("{purpose}", req.composeContext.purpose)
            .replace("{tone}", req.settings.tone);
        }
        break;
      default:
        return `${base}${req.customPrompt || ""}`;
    }
  }
}

// Singleton-Instanz
export const aiService = new AIServiceImpl();