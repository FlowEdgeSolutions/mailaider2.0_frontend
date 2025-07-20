// src/components/MailAiderApp.tsx
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// 🧠 Einheitlicher Typ für alle Email-Daten
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

interface MailAiderAppProps {
  emailData?: EmailData;
  forceComposeMode?: boolean;
}

function InlineSettings({ settings, onSettingsChange, disabled, onExecute }: { settings: SettingsData; onSettingsChange: (s: SettingsData) => void; disabled?: boolean; onExecute?: (prompt: string) => void }) {
  const [userPrompt, setUserPrompt] = React.useState("");
  return (
    <div className="card-modern p-4 space-y-5 animate-slide-up bg-white dark:bg-zinc-900 shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-100 text-blue-600 rounded-full p-2">
          <Settings2 className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-foreground">E-Mail-Einstellungen</span>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="mb-1 block">Tonfall:</Label>
          <Select value={settings.tone} onValueChange={v => onSettingsChange({ ...settings, tone: v })} disabled={disabled}>
            <SelectTrigger className="bg-white dark:bg-zinc-900">
              <SelectValue placeholder="Tonfall wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formell">Formell</SelectItem>
              <SelectItem value="informell">Informell</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block">Anrede:</Label>
          <Select value={settings.greeting} onValueChange={v => onSettingsChange({ ...settings, greeting: v })} disabled={disabled}>
            <SelectTrigger className="bg-white dark:bg-zinc-900">
              <SelectValue placeholder="Anrede wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="informell">Du (informell)</SelectItem>
              <SelectItem value="formell">Sie (formell)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block">Länge:</Label>
          <Select value={settings.length} onValueChange={v => onSettingsChange({ ...settings, length: v })} disabled={disabled}>
            <SelectTrigger className="bg-white dark:bg-zinc-900">
              <SelectValue placeholder="Länge wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kurz">Kurz</SelectItem>
              <SelectItem value="mittel">Mittel</SelectItem>
              <SelectItem value="lang">Lang</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block">Sprache:</Label>
          <Select value={settings.language} onValueChange={v => onSettingsChange({ ...settings, language: v })} disabled={disabled}>
            <SelectTrigger className="bg-white dark:bg-zinc-900">
              <SelectValue placeholder="Sprache wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deutsch">Deutsch</SelectItem>
              <SelectItem value="englisch">Englisch</SelectItem>
              <SelectItem value="französisch">Französisch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <label className="text-sm font-ui text-foreground">Zusätzliche Anweisungen (optional):</label>
        <Textarea
          value={userPrompt}
          onChange={e => setUserPrompt(e.target.value)}
          placeholder="Spezielle Wünsche oder Anpassungen..."
          className="input-modern min-h-[100px] resize-none dark:border-border dark:bg-card dark:text-foreground"
        />
        <div className="flex gap-3 mt-2">
          <Button
            onClick={() => setUserPrompt("")}
            variant="outline"
            className="flex-1"
            type="button"
          >
            Abbrechen
          </Button>
          <Button
            onClick={() => onExecute && onExecute(userPrompt)}
            className="flex-1 btn-primary"
            type="button"
            disabled={disabled}
          >
            Ausführen
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MailAiderApp({ emailData: emailDataProp, forceComposeMode }: MailAiderAppProps) {
  const devMode = false;            // Prod-Modus
  const devComposeMode = false;

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
    emailData: rawEmailData,
    composeData,
    setEmailData: setRawEmailData,
    setComposeData,
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

  const effectiveConnected = devMode ? true : isConnected;
  const effectiveComposeMode = forceComposeMode !== undefined ? forceComposeMode : (devMode ? devComposeMode : isComposeMode);

  // Setze currentAction auf 'verfassen', wenn Compose-Modus aktiv ist
  React.useEffect(() => {
    if (effectiveComposeMode && currentAction !== "verfassen") {
      setCurrentAction("verfassen");
    }
  }, [effectiveComposeMode, currentAction]);

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

  const handleSettingsSubmit = async (userPrompt: string, recipientName?: string) => {
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

  // 📦 Sichere Zusammenführung mit Fallback für summary
  const emailData: EmailData = {
    ...(emailDataProp || rawEmailData),
    summary: (emailDataProp?.summary ?? rawEmailData.summary) ?? "",
  };

  const setEmailData = (data: EmailData) => {
    setRawEmailData(data);
  };

  return (
    <div className={`min-h-screen bg-background-secondary transition-all duration-500 ${isDarkMode ? "dark" : ""}`}>
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
            <p>Die Verbindung zu Outlook konnte nicht hergestellt werden. Einige Funktionen sind möglicherweise eingeschränkt.</p>
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
              isLoading={isLoading}
              onComposeDataChange={update => setComposeData({ ...composeData, ...update })}
            />
            <InlineSettings settings={settings} onSettingsChange={setSettings} disabled={isLoading} onExecute={prompt => handleSettingsSubmit(prompt)} />
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
          </>
        ) : (
          <>
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
              onCopy={handleCopyToClipboard}
              onInsertReply={handleInsertReply}
            />
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
          </>
        )}

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
