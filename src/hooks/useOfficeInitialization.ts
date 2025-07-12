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
        console.log('🚀 Starte MailAider Initialisierung...');
        
        // Initialize Office.js
        await outlookService.initializeOffice();
        
        // Check if we're in compose mode
        const composeMode = outlookService.isComposeMode();
        const isConnected = outlookService.isOfficeInitialized();
        
        setIsComposeMode(composeMode);
        setIsConnected(isConnected);
        
        console.log('📊 Status:', { isConnected, composeMode });
        
        if (composeMode) {
          console.log('📝 Lade Compose-Daten...');
          // Load compose data
          const currentCompose = await outlookService.getComposeData();
          setComposeData({
            to: currentCompose.to,
            cc: currentCompose.cc,
            subject: currentCompose.subject,
            purpose: 'Neue E-Mail verfassen'
          });
          console.log('✅ Compose-Daten geladen:', currentCompose);
        } else {
          console.log('📧 Lade E-Mail-Daten...');
          // Load current email data (read mode)
          const currentEmail = await outlookService.getCurrentEmailData();
          setEmailData({
            subject: currentEmail.subject,
            sender: currentEmail.sender,
            content: currentEmail.content,
            summary: 'Klicken Sie auf "Zusammenfassung anzeigen" um eine KI-Zusammenfassung zu erhalten'
          });
          console.log('✅ E-Mail-Daten geladen:', currentEmail);
        }
        
        console.log('🎉 MailAider erfolgreich initialisiert!');
        setIsLoading(false);
      } catch (error) {
        console.error('❌ MailAider Initialisierung fehlgeschlagen:', error);
        
        // Enhanced fallback for development
        const simulateCompose = window.location.search.includes('compose=true');
        setIsComposeMode(simulateCompose);
        setIsConnected(true); // Set to true so UI shows
        
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
        
        console.log('🔧 Fallback-Daten geladen für Entwicklung');
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