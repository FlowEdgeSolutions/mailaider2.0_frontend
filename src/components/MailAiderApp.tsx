import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./Header";
import { EmailViewer } from "./EmailViewer";
import { ComposeViewer } from "./ComposeViewer";
import { ActionButtons } from "./ActionButtons";
import { ChatInterface } from "./ChatInterface";
import { SettingsModal } from "./SettingsModal";
import { StatusPopup } from "./StatusPopup";
import { Tutorial } from "./Tutorial";
import { DebugInfo } from "./DebugInfo";
import { useOfficeInitialization } from "@/hooks/useOfficeInitialization";
import { useApiKeyManagement } from "@/hooks/useApiKeyManagement";
import { useAIProcessing } from "@/hooks/useAIProcessing";
import { useTutorial } from "@/hooks/useTutorial";
import { useAppActions } from "@/hooks/useAppActions";
import ComposeEditor from "./ComposeEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsData {
  tone: string;
  greeting: string;
  length: string;
  language: string;
}

export function MailAiderApp() {
  const devMode = true;              // 🛠 Dev-Modus aktivieren
  const devComposeMode = false;     // true = Compose, false = Antwort/Lese

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentAction, setCurrentAction] = useState("antworten");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showComposeDetails, setShowComposeDetails] = useState(false);

  const [settings, setSettings] = useState<SettingsData>({
    tone: "formell",
    greeting: "informell",
    length: "kurz",
    language: "deutsch",
  });

  const {
    isConnected,
    isComposeMode,
    isLoading: officeLoading,
    emailData,
    composeData,
    setEmailData,
  } = useOfficeInitialization();

  useApiKeyManagement();

  const {
    isLoading: aiLoading,
    chatOutput,
    setChatOutput,
    processEmailWithAI,
    generateSummary,
  } = useAIProcessing();

  const { showTutorial, handleTutorialComplete, handleTutorialSkip } = useTutorial();

  const {
    showStatusPopup,
    setShowStatusPopup,
    statusMessage,
    copyToClipboard,
    insertReply,
    showDsgvoInfo,
  } = useAppActions();

  const isLoading = officeLoading || aiLoading;

  // 🔁 Effektive Werte (echte oder simulierte)
  const effectiveConnected = devMode ? true : isConnected;
  const effectiveComposeMode = devMode ? devComposeMode : isComposeMode;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleActionSelect = (action: string) => {
    setCurrentAction(action);
    if (action !== "verfassen") {
      requestAnimationFrame(() => {
        setIsSettingsOpen(true);
      });
    }
  };

  const handleSettingsSubmit = async (
    userPrompt: string,
    recipientName?: string
  ) => {
    setIsSettingsOpen(false);
    await processEmailWithAI(
      currentAction,
      userPrompt,
      recipientName,
      settings,
      effectiveComposeMode,
      emailData,
      composeData
    );
  };

  const handleSummaryToggle = async () => {
    if (!showSummary && !emailData.summary.includes("•")) {
      await generateSummary(emailData.content, settings, setEmailData);
    }
    setShowSummary(!showSummary);
  };

  const handleCopyToClipboard = () => {
    copyToClipboard(chatOutput);
  };

  const handleInsertReply = () => {
    insertReply(chatOutput, effectiveComposeMode);
  };

  return (
    <div
      className={`min-h-screen bg-background-secondary transition-all duration-500 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <div className="max-w-md mx-auto p-3 space-y-3">
        <Header
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          isConnected={effectiveConnected}
          onStatusClick={showDsgvoInfo}
        />

        {!effectiveConnected && (
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-bold">Warnung</h3>
            <p>Die Verbindung zu Outlook konnte nicht hergestellt werden. 
            Einige Funktionen sind möglicherweise eingeschränkt.</p>
          </div>
        )}

        <DebugInfo
          isConnected={effectiveConnected}
          isComposeMode={effectiveComposeMode}
          isLoading={isLoading}
        />

        {effectiveComposeMode ? (
          <>
            <ComposeViewer
              composeData={composeData}
              showDetails={showComposeDetails}
              onToggleDetails={() => setShowComposeDetails(!showComposeDetails)}
              isLoading={isLoading}
            />
            {currentAction === "verfassen" && (
              <Card>
                <CardHeader>
                  <CardTitle>✍️ Freier Modus – E-Mail verfassen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComposeEditor />
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <EmailViewer
            emailData={emailData}
            showSummary={showSummary}
            onToggleSummary={handleSummaryToggle}
            isLoading={isLoading}
          />
        )}

        {currentAction !== "verfassen" && (
          <ChatInterface
            output={chatOutput}
            isLoading={isLoading}
            currentAction={currentAction}
            onCopy={handleCopyToClipboard}
            onInsertReply={handleInsertReply}
          />
        )}

        <ActionButtons
          currentAction={currentAction}
          onActionSelect={handleActionSelect}
          isConnected={effectiveConnected}
          isComposeMode={effectiveComposeMode}
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