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
import { Settings, X, Wand2, HelpCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

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
    <div className="card-modern p-4 space-y-5 animate-slide-up bg-white dark:bg-[#0a1736] shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-100 text-blue-600 rounded-full p-2">
          <Settings className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-foreground dark:text-white">E-Mail-Einstellungen</span>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="mb-1 block dark:text-white">Tonfall:</Label>
          <Select value={settings.tone} onValueChange={v => onSettingsChange({ ...settings, tone: v })} disabled={disabled}>
            <SelectTrigger className="bg-white dark:bg-card">
              <SelectValue placeholder="Tonfall wählen..." className="dark:text-white/80" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-card">
              <SelectItem value="formell">Formell</SelectItem>
              <SelectItem value="informell">Informell</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block dark:text-white">Anrede:</Label>
          <Select value={settings.greeting} onValueChange={v => onSettingsChange({ ...settings, greeting: v })} disabled={disabled}>
            <SelectTrigger className="bg-white dark:bg-card">
              <SelectValue placeholder="Anrede wählen..." className="dark:text-white/80" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-card">
              <SelectItem value="informell">Du (informell)</SelectItem>
              <SelectItem value="formell">Sie (formell)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block dark:text-white">Länge:</Label>
          <Select value={settings.length} onValueChange={v => onSettingsChange({ ...settings, length: v })} disabled={disabled}>
            <SelectTrigger className="bg-white dark:bg-card">
              <SelectValue placeholder="Länge wählen..." className="dark:text-white/80" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-card">
              <SelectItem value="kurz">Kurz</SelectItem>
              <SelectItem value="mittel">Mittel</SelectItem>
              <SelectItem value="lang">Lang</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block dark:text-white">Sprache:</Label>
          <Select value={settings.language} onValueChange={v => onSettingsChange({ ...settings, language: v })} disabled={disabled}>
            <SelectTrigger className="bg-white dark:bg-card">
              <SelectValue placeholder="Sprache wählen..." className="dark:text-white/80" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-card">
              <SelectItem value="deutsch">Deutsch</SelectItem>
              <SelectItem value="englisch">Englisch</SelectItem>
              <SelectItem value="französisch">Französisch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <label className="text-sm font-ui text-foreground dark:text-white">Zusätzliche Anweisungen (optional):</label>
        <Textarea
          value={userPrompt}
          onChange={e => setUserPrompt(e.target.value)}
          placeholder="Spezielle Wünsche oder Anpassungen..."
          className="input-modern min-h-[100px] resize-none dark:border-zinc-700 dark:bg-[#0a1736] dark:text-white"
        />
        <div className="flex gap-3 mt-2">
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

function CorrectionPanel({ open, onClose, onExecute, disabled }: { open: boolean; onClose: () => void; onExecute: (mode: string, custom: string) => void; disabled?: boolean }) {
  const [mode, setMode] = React.useState("stilistisch");
  const [custom, setCustom] = React.useState("");
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${open ? 'opacity-100 backdrop-blur-sm bg-black/50' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${open ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-display text-foreground">Mail korrigieren</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-all duration-150 hover:scale-105"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-ui text-foreground">Korrekturart:</label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="input-modern bg-white dark:bg-card border-2 border-border hover:border-primary/50 focus:border-primary dark:border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-card border-2 border-border shadow-lg dark:border-border">
                <SelectItem value="stilistisch" className="hover:bg-accent focus:bg-accent text-foreground">Stilistisch & sprachlich</SelectItem>
                <SelectItem value="rechtschreibung" className="hover:bg-accent focus:bg-accent text-foreground">Nur Rechtschreibung</SelectItem>
                <SelectItem value="umformulieren" className="hover:bg-accent focus:bg-accent text-foreground">Höflich umformulieren</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-ui text-foreground">Zusätzliche Wünsche (optional):</label>
            <Textarea
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="z.B. besonders höflich, kurz halten, ..."
              className="input-modern min-h-[80px] resize-none dark:border-border dark:bg-card dark:text-foreground"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => onExecute(mode, custom)}
              className="flex-1 btn-primary"
              disabled={disabled}
            >
              Ausführen
            </Button>
          </div>
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
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [correctionOutput, setCorrectionOutput] = useState("");
  const emailBodyRef = useRef<string>("");

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

  // Tutorial-Flags manuell setzen
  const [forceShowReadTutorial, setForceShowReadTutorial] = useState(false);
  const [forceShowComposeTutorial, setForceShowComposeTutorial] = useState(false);

  const { showTutorial: showReadTutorial, handleTutorialComplete: handleReadTutorialComplete, handleTutorialSkip: handleReadTutorialSkip } = useTutorial('read');
  const { showTutorial: showComposeTutorial, handleTutorialComplete: handleComposeTutorialComplete, handleTutorialSkip: handleComposeTutorialSkip } = useTutorial('compose');

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
    insertReply(chatOutput, effectiveComposeMode, composeData);
  };

  // Funktion, um aktuellen E-Mail-Text aus Outlook zu holen
  const fetchComposeBody = async () => {
    if (window.Office?.context?.mailbox?.item?.body?.getAsync) {
      return new Promise<string>(resolve => {
        window.Office.context.mailbox.item.body.getAsync("text", res => {
          resolve(res?.value || "");
        });
      });
    }
    return "";
  };

  // Korrektur ausführen
  const handleCorrection = async (mode: string, custom: string) => {
    setCorrectionLoading(true);
    const body = await fetchComposeBody();
    emailBodyRef.current = body;
    let prompt = "";
    if (mode === "stilistisch") prompt = "Korrigiere den Text stilistisch und grammatikalisch.";
    if (mode === "rechtschreibung") prompt = "Korrigiere nur die Rechtschreibung.";
    if (mode === "umformulieren") prompt = "Formuliere den Text höflich um.";
    if (custom && custom.trim() !== "") prompt += " " + custom;
    await processEmailWithAI(
      "freierModus",
      prompt,
      undefined,
      settings,
      true,
      { subject: "", sender: "", content: body, summary: "" },
      composeData
    );
    setCorrectionOutput(chatOutput);
    setCorrectionLoading(false);
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
        {/* Tutorial-Button oben rechts */}
        <div className="flex justify-end mb-2">
          {effectiveComposeMode ? (
            <button
              onClick={() => setForceShowComposeTutorial(true)}
              className="w-9 h-9 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-all duration-300 hover:scale-105"
              title="Tutorial starten"
            >
              <HelpCircle className="w-5 h-5 text-primary" />
            </button>
          ) : (
            <button
              onClick={() => setForceShowReadTutorial(true)}
              className="w-9 h-9 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-all duration-300 hover:scale-105"
              title="Tutorial starten"
            >
              <HelpCircle className="w-5 h-5 text-primary" />
            </button>
          )}
        </div>
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
            <CorrectionPanel
              open={showCorrection}
              onClose={() => setShowCorrection(false)}
              onExecute={handleCorrection}
              disabled={correctionLoading}
            />
            {correctionOutput && (
              <div className="card-modern p-4 mt-4 bg-white dark:bg-[#0a1736] shadow-md">
                <div className="mb-2 font-semibold text-foreground dark:text-white">Korrigierte Version:</div>
                <div className="whitespace-pre-line text-foreground dark:text-white">{correctionOutput}</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(correctionOutput)}>Kopieren</Button>
                  <Button size="sm" onClick={async () => {
                    if (window.Office?.context?.mailbox?.item?.body?.setAsync) {
                      window.Office.context.mailbox.item.body.setAsync(correctionOutput, { coercionType: "text" });
                    }
                  }}>Einfügen</Button>
                </div>
              </div>
            )}
            <ChatInterface
              output={chatOutput}
              isLoading={isLoading}
              currentAction={currentAction}
              onCopy={handleCopyToClipboard}
              onInsertReply={handleInsertReply}
              onCorrectionClick={() => setShowCorrection(true)}
            />
            <ActionButtons
              currentAction={currentAction}
              onActionSelect={handleActionSelect}
              isConnected={effectiveConnected}
              isComposeMode={effectiveComposeMode}
              onCorrectionClick={() => setShowCorrection(true)}
            />
            <SettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              currentAction={currentAction}
              settings={settings}
              onSettingsChange={setSettings}
              onSubmit={handleSettingsSubmit}
            />
            <Tutorial
              isVisible={showComposeTutorial || forceShowComposeTutorial}
              onComplete={() => { setForceShowComposeTutorial(false); handleComposeTutorialComplete(); }}
              onSkip={() => { setForceShowComposeTutorial(false); handleComposeTutorialSkip(); }}
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
            <Tutorial
              isVisible={showReadTutorial || forceShowReadTutorial}
              onComplete={() => { setForceShowReadTutorial(false); handleReadTutorialComplete(); }}
              onSkip={() => { setForceShowReadTutorial(false); handleReadTutorialSkip(); }}
            />
          </>
        )}

        <StatusPopup
          isOpen={showStatusPopup}
          message={statusMessage}
          onClose={() => setShowStatusPopup(false)}
        />

        <Toaster />
      </div>
    </div>
  );
}
