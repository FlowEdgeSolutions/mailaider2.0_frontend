import { useState } from 'react';
import { outlookService } from '@/services/outlookService';

export function useAppActions() {
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setStatusMessage('Text wurde in die Zwischenablage kopiert');
    setShowStatusPopup(true);
  };

  const insertReply = async (chatOutput: string, isComposeMode: boolean) => {
    try {
      if (isComposeMode) {
        await outlookService.insertComposeText(chatOutput);
        setStatusMessage('Text wurde in die E-Mail eingefügt');
      } else {
        await outlookService.insertReplyText(chatOutput);
        setStatusMessage('Antwort wurde in das Antwortformular eingefügt');
      }
      setShowStatusPopup(true);
    } catch (error) {
      console.error('Insert text error:', error);
      setStatusMessage('Fehler beim Einfügen des Textes');
      setShowStatusPopup(true);
    }
  };

  const showDsgvoInfo = () => {
    setStatusMessage(`**DSGVO-sichere KI-Verarbeitung**

Ihre Daten werden sicher verarbeitet:
• Verschlüsselte Übertragung
• Keine Datenspeicherung nach Verarbeitung  
• Konform mit Schweizer Datenschutzgesetzen
• Keine Verwendung für Training`);
    setShowStatusPopup(true);
  };

  return {
    showStatusPopup,
    setShowStatusPopup,
    statusMessage,
    copyToClipboard,
    insertReply,
    showDsgvoInfo
  };
}