import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Header } from './Header';
import { EmailViewer } from './EmailViewer';
import { ActionButtons } from './ActionButtons';
import { ChatInterface } from './ChatInterface';
import { SettingsModal } from './SettingsModal';
import { StatusPopup } from './StatusPopup';
import { Tutorial } from './Tutorial';
import { ApiKeyInput } from './ApiKeyInput';
import { outlookService, type OutlookEmailData } from '@/services/outlookService';
import { aiService, type AIServiceConfig } from '@/services/aiService';

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
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
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

    // Check if API key is configured
    const savedApiKey = localStorage.getItem('mailaider-api-key');
    if (savedApiKey) {
      aiService.setConfig({ apiKey: savedApiKey });
    } else {
      setShowApiKeyInput(true);
    }

    // Initialize Office.js and load email data
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Office.js
        await outlookService.initializeOffice();
        
        // Load current email data
        const currentEmail = await outlookService.getCurrentEmailData();
        setEmailData({
          subject: currentEmail.subject,
          sender: currentEmail.sender,
          content: currentEmail.content,
          summary: 'Klicken Sie auf "Zusammenfassung anzeigen" um eine KI-Zusammenfassung zu erhalten'
        });
        
        setIsConnected(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        // Fallback für Development
        setEmailData({
          subject: 'Projektbesprechung für nächste Woche',
          sender: 'maria.mueller@example.com',
          content: 'Hallo James,\n\nIch hoffe, es geht dir gut. Ich wollte mich bezüglich der Projektbesprechung für nächste Woche bei dir melden. Könnten wir einen Termin für Dienstag oder Mittwoch vereinbaren?\n\nEs wäre wichtig, dass wir die aktuellen Fortschritte besprechen und die nächsten Schritte planen. Bitte lass mich wissen, welcher Tag dir besser passt.\n\nVielen Dank und beste Grüße,\nMaria',
          summary: 'Development Modus - echte Daten verfügbar nach Outlook Integration'
        });
        setIsConnected(true);
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

  const handleApiKeySubmit = (apiKey: string) => {
    localStorage.setItem('mailaider-api-key', apiKey);
    aiService.setConfig({ apiKey });
    setShowApiKeyInput(false);
    setStatusMessage('API Key erfolgreich konfiguriert!');
    setShowStatusPopup(true);
  };

  const handleSettingsSubmit = async (userPrompt: string, recipientName?: string) => {
    setIsSettingsOpen(false);
    setIsLoading(true);
    setChatOutput('Verarbeitung läuft...');
    
    if (!aiService.isConfigured()) {
      setChatOutput('❌ API Key nicht konfiguriert. Bitte fügen Sie Ihren API Key hinzu.');
      setIsLoading(false);
      setShowApiKeyInput(true);
      return;
    }

    try {
      let actionType: 'summarize' | 'reply' | 'translate' | 'custom';
      
      switch (currentAction) {
        case 'zusammenfassen':
          actionType = 'summarize';
          break;
        case 'antworten':
          actionType = 'reply';
          break;
        case 'übersetzen':
          actionType = 'translate';
          break;
        case 'freierModus':
          actionType = 'custom';
          break;
        default:
          actionType = 'custom';
      }

      const result = await aiService.processEmail({
        action: actionType,
        emailContent: emailData.content,
        settings,
        customPrompt: userPrompt,
        recipientName
      });

      if (result.success) {
        setChatOutput(result.result);
      } else {
        setChatOutput(`❌ Fehler: ${result.error}`);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error during processing:', error);
      setChatOutput('❌ Fehler bei der Verarbeitung. Bitte versuchen Sie es erneut.');
      setIsLoading(false);
    }
  };

  const handleSummaryToggle = async () => {
    if (!showSummary && !emailData.summary.includes('•')) {
      // Generate summary if not yet generated
      setIsLoading(true);
      
      try {
        const result = await aiService.processEmail({
          action: 'summarize',
          emailContent: emailData.content,
          settings
        });

        if (result.success) {
          setEmailData(prev => ({ ...prev, summary: result.result }));
        }
      } catch (error) {
        console.error('Summary generation error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    setShowSummary(!showSummary);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chatOutput);
    setStatusMessage('Text wurde in die Zwischenablage kopiert');
    setShowStatusPopup(true);
  };

  const insertReply = async () => {
    try {
      await outlookService.insertReplyText(chatOutput);
      setStatusMessage('Antwort wurde in das Antwortformular eingefügt');
      setShowStatusPopup(true);
    } catch (error) {
      console.error('Insert reply error:', error);
      setStatusMessage('Fehler beim Einfügen der Antwort');
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
          onToggleSummary={handleSummaryToggle}
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

        <ApiKeyInput
          isVisible={showApiKeyInput}
          onSubmit={handleApiKeySubmit}
          onSkip={() => setShowApiKeyInput(false)}
        />

        <Toaster />
      </div>
    </div>
  );
}