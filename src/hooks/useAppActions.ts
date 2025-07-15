// src/hooks/useAppActions.ts
import { useState } from "react";
import { outlookService } from "@/services/outlookService";
import { copyText } from "@/utils/clipboard";      // ⬅️ neuer Helper

export function useAppActions() {
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  /* ---------- Kopieren -------------------------------------- */
  const copyToClipboard = async (text: string) => {
    const ok = await copyText(text);
    setStatusMessage(
      ok
        ? "Text wurde in die Zwischenablage kopiert"
        : "❌ Kopieren fehlgeschlagen – bitte manuell markieren"
    );
    setShowStatusPopup(true);
  };

  /* ---------- Einfügen -------------------------------------- */
  const insertReply = async (chatOutput: string, isComposeMode: boolean) => {
    try {
      if (isComposeMode) {
        await outlookService.insertComposeText(chatOutput);
        setStatusMessage("Text wurde in die E-Mail eingefügt");
      } else {
        await outlookService.insertReplyText(chatOutput);   // ohne ?.
        setStatusMessage("Antwort wurde in das Antwortformular eingefügt");
      }
    } catch (error) {
      console.error("Insert text error:", error);
      setStatusMessage("Fehler beim Einfügen des Textes");
    } finally {
      setShowStatusPopup(true);
    }
  };

  /* ---------- DSGVO‑Info ------------------------------------ */
  const showDsgvoInfo = () => {
    setStatusMessage(
      "**DSGVO-sichere KI-Verarbeitung**\n\n" +
        "• Verschlüsselte Übertragung\n" +
        "• Keine Datenspeicherung nach Verarbeitung\n" +
        "• Konform mit Schweizer Datenschutzgesetzen\n" +
        "• Keine Verwendung für Training"
    );
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
