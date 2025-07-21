import { useState } from "react";
import { aiService } from "@/services/aiService";

// Typdefinitionen für die Einstellungen
interface SettingsData {
  tone: string;
  greeting: string;
  length: string;
  language: string;
}

// Typdefinitionen für E-Mail-Daten
interface EmailData {
  subject: string;
  sender: string;
  content: string;
  summary: string;
}

// Typdefinitionen für das Verfassen von E-Mails
interface ComposeData {
  to: string[];
  cc: string[];
  subject: string;
  purpose: string;
}

// Aktionstypen für die KI-Verarbeitung
type ActionType = "summarize" | "reply" | "translate" | "custom" | "compose";

// Datenschnittstelle für KI-Anfragen
interface AIRequestData {
  action: ActionType;
  settings: SettingsData;
  customPrompt?: string;
  recipientName?: string;
  emailContent?: string;
  composeContext?: {
    to: string[];
    subject: string;
    purpose: string;
  };
}

export function useAIProcessing() {
  const [isLoading, setIsLoading] = useState(false);
  const [chatOutput, setChatOutput] = useState("Warte auf Ausgabe...");

  /**
   * Validiert den E-Mail-Inhalt auf Vollständigkeit und Lesbarkeit
   * @param content Der zu validierende E-Mail-Inhalt
   * @returns true wenn der Inhalt gültig ist, false wenn nicht
   */
  const validateEmailContent = (content: string): boolean => {
    // Prüft auf zu kurzen oder leeren Inhalt
    if (!content || content.trim().length < 10) {
      setChatOutput("❌ E-Mail-Inhalt zu kurz oder nicht lesbar");
      return false;
    }
    
    // Reguläre Ausdrücke für häufige Fehlermuster
    const errorPatterns = [
      /\[image:.*\]/i,    // Nicht darstellbare Bilder
      /\[cid:.*\]/i,      // Content-ID Probleme
      /undisplayable content/i  // Nicht darstellbarer Inhalt
    ];
    
    // Prüft ob eines der Fehlermuster gefunden wird
    if (errorPatterns.some(pattern => pattern.test(content))) {
      setChatOutput("❌ E-Mail enthält nicht darstellbare Inhalte");
      return false;
    }
    
    return true;
  }

  /**
   * Verarbeitet eine E-Mail mit KI-Unterstützung
   * @param currentAction Die ausgewählte Aktion (zusammenfassen, antworten, etc.)
   * @param userPrompt Benutzerdefinierte Eingabeaufforderung
   * @param recipientName Name des Empfängers
   * @param settings Benutzereinstellungen für Ton, Länge etc.
   * @param isComposeMode Gibt an ob eine neue E-Mail verfasst wird
   * @param emailData Daten der zu verarbeitenden E-Mail
   * @param composeData Daten für das Verfassen einer neuen E-Mail
   */
  const processEmailWithAI = async (
    currentAction: string,
    userPrompt: string,
    recipientName: string | undefined,
    settings: SettingsData,
    isComposeMode: boolean,
    emailData: EmailData,
    composeData: ComposeData
  ) => {
    setIsLoading(true);
    setChatOutput("Verarbeitung läuft...");

    // Prüft ob der AI-Service korrekt konfiguriert ist
    if (!aiService.isConfigured()) {
      setChatOutput("❌ API Key nicht konfiguriert. Bitte fügen Sie Ihren API Key hinzu.");
      setIsLoading(false);
      return;
    }

    // Validiert den E-Mail-Inhalt (nur im Antwortmodus)
    if (!isComposeMode && !validateEmailContent(emailData.content)) {
      setIsLoading(false);
      return;
    }

    try {
      // Wandelt die aktuelle Aktion in den entsprechenden ActionType um
      let actionType: ActionType;

      switch (currentAction) {
        case "zusammenfassen":
          actionType = "summarize";
          break;
        case "antworten":
          actionType = "reply";
          break;
        case "übersetzen":
          actionType = "translate";
          break;
        case "verfassen":
          actionType = "compose";
          break;
        case "freierModus":
          actionType = "custom";
          break;
        default:
          actionType = "custom";
      }

      // Erstellt das Anfrageobjekt für die KI
      const requestData: AIRequestData = {
        action: actionType,
        settings,
        customPrompt: userPrompt,
        recipientName,
      };

      // Fügt kontextspezifische Daten hinzu
      if (isComposeMode) {
        requestData.composeContext = {
          to: composeData.to,
          subject: composeData.subject,
          purpose: userPrompt || composeData.purpose,
        };
      } else {
        requestData.emailContent = emailData.content;
      }

      // Sendet die Anfrage an den AI-Service
      const result = await aiService.processEmail(requestData);

      // Verarbeitet das Ergebnis
      if (result.success) {
        setChatOutput(result.result);
      } else {
        setChatOutput(`❌ Fehler: ${result.error}`);
      }

    } catch (error) {
      console.error("Fehler während der Verarbeitung:", error);
      setChatOutput("❌ Fehler bei der Verarbeitung. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generiert eine Zusammenfassung des E-Mail-Inhalts
   * @param emailContent Der Inhalt der E-Mail
   * @param settings Benutzereinstellungen
   * @param setEmailData Setter-Funktion für die E-Mail-Daten
   */
  const generateSummary = async (
    emailContent: string,
    settings: SettingsData,
    setEmailData: (data: EmailData | ((prev: EmailData) => EmailData)) => void
  ) => {
    setIsLoading(true);

    try {
      // Validiert den Inhalt vor der Zusammenfassung
      if (!validateEmailContent(emailContent)) {
        setIsLoading(false);
        return;
      }

      const result = await aiService.processEmail({
        action: "summarize",
        emailContent,
        settings,
      });

      if (result.success) {
        setEmailData((prev) => ({
          ...prev,
          summary: result.result,
        }));
      }
    } catch (error) {
      console.error("Fehler bei der Zusammenfassung:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generiert eine Zusammenfassung des E-Mail-Inhalts und gibt sie als String zurück
   */
  const generateSummaryString = async (
    emailContent: string,
    settings: SettingsData
  ): Promise<{ success: boolean; result: string; error?: string }> => {
    setIsLoading(true);
    try {
      if (!validateEmailContent(emailContent)) {
        setIsLoading(false);
        return { success: false, result: "", error: "E-Mail-Inhalt ungültig" };
      }
      const result = await aiService.processEmail({
        action: "summarize",
        emailContent,
        settings,
      });
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, result: "", error: "Fehler bei der Zusammenfassung" };
    }
  };

  return {
    isLoading,
    chatOutput,
    setChatOutput,
    processEmailWithAI,
    generateSummary,
    generateSummaryString,
  };
}