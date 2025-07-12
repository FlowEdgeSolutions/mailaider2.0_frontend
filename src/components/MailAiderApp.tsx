import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Header } from './Header';
import { EmailViewer } from './EmailViewer';
import { ComposeViewer } from './ComposeViewer';
import { ActionButtons } from './ActionButtons';
import { ChatInterface } from './ChatInterface';
import { SettingsModal } from './SettingsModal';
import { StatusPopup } from './StatusPopup';
import { Tutorial } from './Tutorial';
import { ApiKeyInput } from './ApiKeyInput';
import { useOfficeInitialization } from '@/hooks/useOfficeInitialization';
import { useApiKeyManagement } from '@/hooks/useApiKeyManagement';
import { useAIProcessing } from '@/hooks/useAIProcessing';
import { useTutorial } from '@/hooks/useTutorial';
import { useAppActions } from '@/hooks/useAppActions';

interface SettingsData {
  tone: string;
  greeting: string;
  length: string;
  language: string;
}

export function MailAiderApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentAction, setCurrentAction] = useState('antworten');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showComposeDetails, setShowComposeDetails] = useState(false);
  
  const [settings, setSettings] = useState<SettingsData>({
    tone: 'formell',
    greeting: 'informell',
    length: 'kurz',
    language: 'deutsch'
  });

  // Custom hooks
  const {
    isConnected,
    isComposeMode,
    isLoading: officeLoading,
    emailData,
    composeData,
    setEmailData
  } = useOfficeInitialization();

  const {
    showApiKeyInput,
    setShowApiKeyInput,
    handleApiKeySubmit
  } = useApiKeyManagement();

  const {
    isLoading: aiLoading,
    chatOutput,
    setChatOutput,
    processEmailWithAI,
    generateSummary
  } = useAIProcessing();

  const {
    showTutorial,
    handleTutorialComplete,
    handleTutorialSkip
  } = useTutorial();

  const {
    showStatusPopup,
    setShowStatusPopup,
    statusMessage,
    copyToClipboard,
    insertReply,
    showDsgvoInfo
  } = useAppActions();

  // Derived state
  const isLoading = officeLoading || aiLoading;

  // Update current action based on mode
  React.useEffect(() => {
    if (isComposeMode && currentAction === 'antworten') {
      setCurrentAction('verfassen');
      setChatOutput('Bereit zum Verfassen einer neuen E-Mail...');
    }
  }, [isComposeMode, currentAction, setChatOutput]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleActionSelect = (action: string) => {
    setCurrentAction(action);
    if (isConnected) {
      requestAnimationFrame(() => {
        setIsSettingsOpen(true);
      });
    }
  };

  const handleApiKeySubmitWithStatus = (apiKey: string) => {
    const message = handleApiKeySubmit(apiKey);
    setShowStatusPopup(true);
  };

  const handleSettingsSubmit = async (userPrompt: string, recipientName?: string) => {
    setIsSettingsOpen(false);
    await processEmailWithAI(
      currentAction,
      userPrompt,
      recipientName,
      settings,
      isComposeMode,
      emailData,
      composeData,
      setShowApiKeyInput
    );
  };

  const handleSummaryToggle = async () => {
    if (!showSummary && !emailData.summary.includes('•')) {
      await generateSummary(emailData.content, settings, setEmailData);
    }
    setShowSummary(!showSummary);
  };

  const handleCopyToClipboard = () => {
    copyToClipboard(chatOutput);
  };

  const handleInsertReply = () => {
    insertReply(chatOutput, isComposeMode);
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

        {isComposeMode ? (
          <ComposeViewer 
            composeData={composeData}
            showDetails={showComposeDetails}
            onToggleDetails={() => setShowComposeDetails(!showComposeDetails)}
            isLoading={isLoading}
          />
        ) : (
          <EmailViewer 
            emailData={emailData}
            showSummary={showSummary}
            onToggleSummary={handleSummaryToggle}
            isLoading={isLoading}
          />
        )}

        <ChatInterface
          output={chatOutput}
          isLoading={isLoading}
          currentAction={currentAction}
          onCopy={handleCopyToClipboard}
          onInsertReply={handleInsertReply}
        />

        <ActionButtons 
          currentAction={currentAction}
          onActionSelect={handleActionSelect}
          isConnected={isConnected}
          isComposeMode={isComposeMode}
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
          onSubmit={handleApiKeySubmitWithStatus}
          onSkip={() => setShowApiKeyInput(false)}
        />

        <Toaster />
      </div>
    </div>
  );
}