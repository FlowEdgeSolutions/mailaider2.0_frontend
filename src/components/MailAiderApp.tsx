import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Header } from './Header';
import { EmailViewer } from './EmailViewer';
import { ActionButtons } from './ActionButtons';
import { ChatInterface } from './ChatInterface';
import { SettingsModal } from './SettingsModal';
import { StatusPopup } from './StatusPopup';
import { Tutorial } from './Tutorial';

interface EmailData {
  subject: string;
  sender: string;
  content: string;
  summary: string;
}

interface SettingsData {
  tone: string;
  greeting: string;
  length: string;
  language: string;
}

export function MailAiderApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emailData, setEmailData] = useState<EmailData>({
    subject: 'Lade Betreff...',
    sender: 'Lade Absender...',
    content: '',
    summary: 'Lade Zusammenfassung...'
  });
  
  const [currentAction, setCurrentAction] = useState('antworten');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [chatOutput, setChatOutput] = useState('Warte auf Ausgabe...');
  const [showSummary, setShowSummary] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [settings, setSettings] = useState<SettingsData>({
    tone: 'formell',
    greeting: 'informell',
    length: 'kurz',
    language: 'deutsch'
  });

  useEffect(() => {
    // Check if user is visiting for the first time
    const hasSeenTutorial = localStorage.getItem('mailaider-tutorial-completed');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    // Simulate Office.js initialization
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Simulate email data loading
        setTimeout(() => {
          setEmailData({
            subject: 'Projektbesprechung für nächste Woche',
            sender: 'maria.mueller@example.com',
            content: 'Hallo James,\n\nIch hoffe, es geht dir gut. Ich wollte mich bezüglich der Projektbesprechung für nächste Woche bei dir melden. Könnten wir einen Termin für Dienstag oder Mittwoch vereinbaren?\n\nEs wäre wichtig, dass wir die aktuellen Fortschritte besprechen und die nächsten Schritte planen. Bitte lass mich wissen, welcher Tag dir besser passt.\n\nVielen Dank und beste Grüße,\nMaria',
            summary: '• Anfrage für Projektbesprechung nächste Woche\n• Terminvorschläge: Dienstag oder Mittwoch\n• Ziel: Fortschritte besprechen und nächste Schritte planen\n• Absender wartet auf Terminbestätigung'
          });
          setIsConnected(true);
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('mailaider-tutorial-completed', 'true');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('mailaider-tutorial-completed', 'true');
    setShowTutorial(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleActionSelect = (action: string) => {
    setCurrentAction(action);
    if (isConnected) {
      // Immediate response for fluid UX
      requestAnimationFrame(() => {
        setIsSettingsOpen(true);
      });
    }
  };

  const handleSettingsSubmit = async (userPrompt: string, recipientName?: string) => {
    setIsSettingsOpen(false);
    setIsLoading(true);
    setChatOutput('');
    
    // Simulate realistic AI processing with stages
    try {
      // Stage 1: Thinking (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stage 2: Processing (3 seconds)  
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Stage 3: Generating (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let response = '';
      
      switch (currentAction) {
        case 'zusammenfassen':{
          response = `📋 **Zusammenfassung der E-Mail:**

• **Hauptthema:** Projektbesprechung für die kommende Woche
• **Terminvorschläge:** Dienstag oder Mittwoch  
• **Zweck:** Aktuellen Projektfortschritt besprechen und weitere Schritte planen
• **Status:** Wartet auf Terminbestätigung von dir
• **Priorität:** Wichtig - zeitnahe Antwort erforderlich

**Empfohlene Aktion:** Terminkalender prüfen und verfügbaren Termin mitteilen.`;
          break;
          }

        case 'antworten': {
          const greeting = recipientName ? `Hallo ${recipientName}` : 'Hallo';
          response = `${greeting},

vielen Dank für deine Nachricht bezüglich der Projektbesprechung.

Gerne können wir uns nächste Woche treffen. Dienstag würde mir sehr gut passen - wie wäre es mit 14:00 Uhr? Falls das nicht passt, bin ich auch am Mittwoch um 10:00 Uhr verfügbar.

Ich freue mich darauf, die aktuellen Fortschritte zu besprechen und die nächsten Schritte gemeinsam zu planen.

Beste Grüße
James`;
          break;
          }

        case 'übersetzen': {
          response = `**English Translation:**

Hello James,

I hope you are doing well. I wanted to get in touch with you regarding the project meeting for next week. Could we schedule an appointment for Tuesday or Wednesday?

It would be important for us to discuss the current progress and plan the next steps. Please let me know which day suits you better.

Thank you very much and best regards,
Maria`;
          break;
          }
          
          
        case 'freierModus':{
          response = userPrompt ? `**Bearbeitung basierend auf Ihrer Anfrage:**

${userPrompt}

**Kontext der E-Mail berücksichtigt:**
${emailData.content}

**Vorschlag:** Basierend auf Ihrer Anfrage und dem E-Mail-Inhalt empfehle ich, zeitnah zu antworten und einen konkreten Terminvorschlag zu machen.` : 'Bitte geben Sie eine spezifische Anfrage für den freien Modus ein.';
          break;
          }
        default:
          response = 'Unbekannte Aktion ausgewählt.';
      }
      
      setChatOutput(response);
      setIsLoading(false);
    } catch (error) {
      console.error('Error during processing:', error);
      setChatOutput('❌ Fehler bei der Verarbeitung. Bitte versuchen Sie es erneut.');
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chatOutput);
    setStatusMessage('Text wurde in die Zwischenablage kopiert');
    setShowStatusPopup(true);
  };

  const insertReply = () => {
    // Simulate inserting reply into email
    setStatusMessage('Antwort wurde in das Antwortformular eingefügt');
    setShowStatusPopup(true);
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

  return (
    <div className={`min-h-screen bg-background-secondary transition-all duration-500 ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-md mx-auto p-3 space-y-3">
        <Header 
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          isConnected={isConnected}
          onStatusClick={showDsgvoInfo}
        />

        <EmailViewer 
          emailData={emailData}
          showSummary={showSummary}
          onToggleSummary={() => setShowSummary(!showSummary)}
          isLoading={isLoading}
        />

        <ChatInterface
          output={chatOutput}
          isLoading={isLoading}
          currentAction={currentAction}
          onCopy={copyToClipboard}
          onInsertReply={insertReply}
        />

        <ActionButtons 
          currentAction={currentAction}
          onActionSelect={handleActionSelect}
          isConnected={isConnected}
        />

        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentAction={currentAction}
          settings={settings}
          onSettingsChange={setSettings}
          onSubmit={handleSettingsSubmit}
        />

        <StatusPopup 
          isOpen={showStatusPopup}
          message={statusMessage}
          onClose={() => setShowStatusPopup(false)}
        />

        <Tutorial
          isVisible={showTutorial}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />

        <Toaster />
      </div>
    </div>
  );
}