import { useState, useEffect } from 'react';
import { outlookService, type OutlookEmailData, type OutlookComposeData } from '@/services/outlookService';

interface EmailData {
  subject: string;
  sender: string;
  content: string;
  summary: string;
}

interface ComposeData {
  to: string[];
  cc: string[];
  subject: string;
  purpose: string;
}

export function useOfficeInitialization() {
  const [isConnected, setIsConnected] = useState(false);
  const [isComposeMode, setIsComposeMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [emailData, setEmailData] = useState<EmailData>({
    subject: 'Lade Betreff...',
    sender: 'Lade Absender...',
    content: '',
    summary: 'Lade Zusammenfassung...'
  });

  const [composeData, setComposeData] = useState<ComposeData>({
    to: [],
    cc: [],
    subject: '',
    purpose: ''
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Office.js
        await outlookService.initializeOffice();
        
        // Check if we're in compose mode
        const composeMode = outlookService.isComposeMode();
        setIsComposeMode(composeMode);
        
        if (composeMode) {
          // Load compose data
          const currentCompose = await outlookService.getComposeData();
          setComposeData({
            to: currentCompose.to,
            cc: currentCompose.cc,
            subject: currentCompose.subject,
            purpose: 'Neue E-Mail verfassen'
          });
        } else {
          // Load current email data (read mode)
          const currentEmail = await outlookService.getCurrentEmailData();
          setEmailData({
            subject: currentEmail.subject,
            sender: currentEmail.sender,
            content: currentEmail.content,
            summary: 'Klicken Sie auf "Zusammenfassung anzeigen" um eine KI-Zusammenfassung zu erhalten'
          });
        }
        
        setIsConnected(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        // Fallback für Development - simuliere compose mode basierend auf URL oder anderen Faktoren
        const simulateCompose = window.location.search.includes('compose=true');
        setIsComposeMode(simulateCompose);
        
        if (simulateCompose) {
          setComposeData({
            to: ['beispiel@domain.com'],
            cc: [],
            subject: 'Neues Projekt',
            purpose: 'Projektplanung besprechen'
          });
        } else {
          setEmailData({
            subject: 'Projektbesprechung für nächste Woche',
            sender: 'maria.mueller@example.com',
            content: 'Hallo James,\n\nIch hoffe, es geht dir gut. Ich wollte mich bezüglich der Projektbesprechung für nächste Woche bei dir melden. Könnten wir einen Termin für Dienstag oder Mittwoch vereinbaren?\n\nEs wäre wichtig, dass wir die aktuellen Fortschritte besprechen und die nächsten Schritte planen. Bitte lass mich wissen, welcher Tag dir besser passt.\n\nVielen Dank und beste Grüße,\nMaria',
            summary: 'Development Modus - echte Daten verfügbar nach Outlook Integration'
          });
        }
        setIsConnected(true);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  return {
    isConnected,
    isComposeMode,
    isLoading,
    emailData,
    composeData,
    setEmailData,
    setComposeData
  };
}