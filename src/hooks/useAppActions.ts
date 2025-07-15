import { useState } from "react";
import { outlookService } from "@/services/outlookService";

export function useAppActions() {
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  /* -------------------------------------------------- */
  /**
   * Kopiert Text in die Zwischenablage.
   * – Verwendet zuerst `navigator.clipboard.writeText()` (Chrome, Edge, Outlook‑WebView2).
   * – Fällt bei Fehler oder unsicherem Kontext auf `execCommand('copy')` zurück.
   */
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback – funktioniert in älteren Outlook‑Hosts
        const ta = document.createElement("textarea");
        ta.value = text;
        // Verstecken außerhalb des Viewports
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setStatusMessage("Text wurde in die Zwischenablage kopiert");
    } catch (err) {
      console.error("Clipboard error", err);
      setStatusMessage("❌ Kopieren fehlgeschlagen – bitte manuell markieren");
    } finally {
      setShowStatusPopup(true);
    }
  };

  /* -------------------------------------------------- */
  const insertReply = async (chatOutput: string, isComposeMode: boolean) => {
    try {
      if (isComposeMode) {
        await outlookService.insertComposeText(chatOutput);
        setStatusMessage("Text wurde in die E-Mail eingefügt");
      } else {
        await outlookService.insertReplyText?.(chatOutput);
        setStatusMessage("Antwort wurde in das Antwortformular eingefügt");
      }
    } catch (error) {
      console.error("Insert text error:", error);
      setStatusMessage("Fehler beim Einfügen des Textes");
    } finally {
      setShowStatusPopup(true);
    }
  };

  /* -------------------------------------------------- */
  const showDsgvoInfo = () => {
    setStatusMessage(`**DSGVO-sichere KI-Verarbeitung**\n\n• Verschlüsselte Übertragung\n• Keine Datenspeicherung nach Verarbeitung\n• Konform mit Schweizer Datenschutzgesetzen\n• Keine Verwendung für Training`);
    setShowStatusPopup(true);
  };

  return {
    showStatusPopup,
    setShowStatusPopup,
    statusMessage,
    copyToClipboard,
    insertReply,
    showDsgvoInfo,
  };
}
