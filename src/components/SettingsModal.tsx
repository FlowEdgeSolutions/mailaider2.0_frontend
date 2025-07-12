import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsData {
  tone: string;
  greeting: string;
  length: string;
  language: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAction: string;
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
  onSubmit: (userPrompt: string, recipientName?: string) => void;
}

export function SettingsModal({ isOpen, onClose, currentAction, settings, onSettingsChange, onSubmit }: SettingsModalProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const handleSubmit = () => {
    onSubmit(userPrompt, recipientName || undefined);
    setUserPrompt('');
    setRecipientName('');
  };

  const updateSetting = (key: keyof SettingsData, value: string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const getActionTitle = () => {
    switch (currentAction) {
      case 'zusammenfassen': return 'E-Mail zusammenfassen';
      case 'antworten': return 'Antwort formulieren';
      case 'übersetzen': return 'E-Mail übersetzen';
      case 'freierModus': return 'Freier Modus';
      default: return 'Einstellungen';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
      isOpen ? 'opacity-100 backdrop-blur-sm bg-black/50' : 'opacity-0 pointer-events-none'
    }`}>
      <div className={`bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
      }`}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-display text-foreground">{getActionTitle()}</h2>
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
          {/* Settings for different actions */}
          {currentAction === 'antworten' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-ui text-foreground">Tonfall:</label>
                <Select value={settings.tone} onValueChange={(value) => updateSetting('tone', value)}>
                  <SelectTrigger className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-2 border-border shadow-lg">
                    <SelectItem value="formell" className="hover:bg-accent focus:bg-accent text-foreground">Formell</SelectItem>
                    <SelectItem value="informell" className="hover:bg-accent focus:bg-accent text-foreground">Informell</SelectItem>
                    <SelectItem value="höflich" className="hover:bg-accent focus:bg-accent text-foreground">Höflich</SelectItem>
                    <SelectItem value="direkt" className="hover:bg-accent focus:bg-accent text-foreground">Direkt & prägnant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-ui text-foreground">Anrede:</label>
                <Select value={settings.greeting} onValueChange={(value) => updateSetting('greeting', value)}>
                  <SelectTrigger className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-2 border-border shadow-lg">
                    <SelectItem value="informell" className="hover:bg-accent focus:bg-accent text-foreground">Du (informell)</SelectItem>
                    <SelectItem value="formell" className="hover:bg-accent focus:bg-accent text-foreground">Sie (formell)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-ui text-foreground">Länge:</label>
                <Select value={settings.length} onValueChange={(value) => updateSetting('length', value)}>
                  <SelectTrigger className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-2 border-border shadow-lg">
                    <SelectItem value="kurz" className="hover:bg-accent focus:bg-accent text-foreground">Kurz</SelectItem>
                    <SelectItem value="mittel" className="hover:bg-accent focus:bg-accent text-foreground">Mittel</SelectItem>
                    <SelectItem value="lang" className="hover:bg-accent focus:bg-accent text-foreground">Lang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-ui text-foreground">Name des Adressaten (optional):</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="z.B. Maria, Herr Schmidt, ..."
                  className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary w-full"
                />
              </div>
            </div>
          )}

          {currentAction === 'übersetzen' && (
            <div className="space-y-2">
              <label className="text-sm font-ui text-foreground">Zielsprache:</label>
              <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                <SelectTrigger className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-2 border-border shadow-lg">
                  <SelectItem value="deutsch" className="hover:bg-accent focus:bg-accent text-foreground">Deutsch</SelectItem>
                  <SelectItem value="englisch" className="hover:bg-accent focus:bg-accent text-foreground">Englisch</SelectItem>
                  <SelectItem value="französisch" className="hover:bg-accent focus:bg-accent text-foreground">Französisch</SelectItem>
                  <SelectItem value="italienisch" className="hover:bg-accent focus:bg-accent text-foreground">Italienisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* User prompt input */}
          <div className="space-y-2">
            <label className="text-sm font-ui text-foreground">
              {currentAction === 'freierModus' ? 'Ihre Anfrage:' : 'Zusätzliche Anweisungen (optional):'}
            </label>
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={
                currentAction === 'freierModus' 
                  ? 'Beschreiben Sie, was Sie mit der E-Mail machen möchten...'
                  : 'Spezielle Wünsche oder Anpassungen...'
              }
              className="input-modern min-h-[100px] resize-none"
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
              onClick={handleSubmit}
              className="flex-1 btn-primary"
            >
              Ausführen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}