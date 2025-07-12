import { useState } from 'react';

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
  // Check URL for compose mode
  const urlParams = new URLSearchParams(window.location.search);
  const isComposeMode = urlParams.get('compose') === 'true';
  
  const [emailData, setEmailData] = useState<EmailData>({
    subject: 'Projektbesprechung für nächste Woche',
    sender: 'maria.mueller@example.com',
    content: 'Hallo James,\n\nIch hoffe, es geht dir gut. Ich wollte mich bezüglich der Projektbesprechung für nächste Woche bei dir melden. Könnten wir einen Termin für Dienstag oder Mittwoch vereinbaren?\n\nEs wäre wichtig, dass wir die aktuellen Fortschritte besprechen und die nächsten Schritte planen. Bitte lass mich wissen, welcher Tag dir besser passt.\n\nVielen Dank und beste Grüße,\nMaria',
    summary: ''
  });

  const [composeData, setComposeData] = useState<ComposeData>({
    to: [],
    cc: [],
    subject: '',
    purpose: isComposeMode ? 'Neue E-Mail verfassen' : ''
  });

  return {
    isConnected: true, // Immer verbunden für Entwicklung
    isComposeMode,
    isLoading: false,
    emailData,
    composeData,
    setEmailData,
    setComposeData
  };
}