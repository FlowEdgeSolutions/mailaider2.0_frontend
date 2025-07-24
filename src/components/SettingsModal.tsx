import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsData {
  tone: string;
  greeting: string;
  length: string;
  language: string;
  region?: string; // Optional: Region für System-Prompt
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAction: string;
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
  onSubmit: (userPrompt: string, recipientName?: string) => void;
}

const ALL_LANGUAGES = [
  'Deutsch', 'Englisch', 'Französisch', 'Italienisch', 'Spanisch', 'Portugiesisch', 'Niederländisch', 'Polnisch', 'Russisch', 'Türkisch', 'Arabisch', 'Chinesisch', 'Japanisch', 'Koreanisch', 'Hindi', 'Schwedisch', 'Norwegisch', 'Dänisch', 'Finnisch', 'Tschechisch', 'Ungarisch', 'Griechisch', 'Rumänisch', 'Bulgarisch', 'Kroatisch', 'Serbisch', 'Slowakisch', 'Slowenisch', 'Ukrainisch', 'Hebräisch', 'Vietnamesisch', 'Thailändisch', 'Indonesisch', 'Malaiisch', 'Filipino', 'Estnisch', 'Lettisch', 'Litauisch', 'Isländisch', 'Georgisch', 'Armenisch', 'Kasachisch', 'Aserbaidschanisch', 'Usbekisch', 'Albanisch', 'Mazedonisch', 'Bosnisch', 'Montenegrinisch', 'Weißrussisch', 'Luxemburgisch', 'Afrikaans', 'Swahili', 'Zulu', 'Xhosa', 'Somali', 'Paschtu', 'Persisch', 'Urdu', 'Bengalisch', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 'Kannada', 'Malayalam', 'Singhalesisch', 'Nepali', 'Laotisch', 'Khmer', 'Birmanisch', 'Mongolisch', 'Tibetisch', 'Maori', 'Samoanisch', 'Tonganisch', 'Fidschianisch', 'Haitianisch', 'Kreolisch', 'Esperanto', 'Latein', 'Walisisch', 'Irisch', 'Schottisch-Gälisch', 'Korsisch', 'Baskisch', 'Katalanisch', 'Galicisch', 'Okzitanisch', 'Bretonisch', 'Friesisch', 'Sardisch', 'Maltesisch', 'Luxemburgisch', 'Färöisch', 'Grönländisch', 'Inuktitut', 'Hawaiianisch', 'Quechua', 'Aymara', 'Guarani', 'Nahuatl', 'Mapudungun', 'Rapanui', 'Tahitianisch', 'Samoanisch', 'Tonganisch', 'Fidschianisch', 'Haitianisch', 'Kreolisch', 'Esperanto', 'Latein', 'Walisisch', 'Irisch', 'Schottisch-Gälisch', 'Korsisch', 'Baskisch', 'Katalanisch', 'Galicisch', 'Okzitanisch', 'Bretonisch', 'Friesisch', 'Sardisch', 'Maltesisch', 'Luxemburgisch', 'Färöisch', 'Grönländisch', 'Inuktitut', 'Hawaiianisch', 'Quechua', 'Aymara', 'Guarani', 'Nahuatl', 'Mapudungun', 'Rapanui', 'Tahitianisch'
];

export function SettingsModal({ isOpen, onClose, currentAction, settings, onSettingsChange, onSubmit }: SettingsModalProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  // API-Key State
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('mailaider-api-key') || '';
    setApiKey(savedKey);
    setApiKeySaved(!!savedKey);
  }, [isOpen]);

  const handleApiKeySave = () => {
    if (apiKey.trim().length < 20) {
      setApiKeyError('API-Key scheint zu kurz oder ungültig.');
      setApiKeySaved(false);
      return;
    }
    localStorage.setItem('mailaider-api-key', apiKey.trim());
    setApiKeySaved(true);
    setApiKeyError('');
  };
  const handleApiKeyDelete = () => {
    localStorage.removeItem('mailaider-api-key');
    setApiKey('');
    setApiKeySaved(false);
    setApiKeyError('');
  };

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

  // Sprachen sortieren: Deutsch immer oben, Rest alphabetisch
  const filteredLanguages = [
    'Deutsch',
    ...ALL_LANGUAGES.filter(l => l !== 'Deutsch' && l.toLowerCase().includes(languageSearch.toLowerCase())).sort((a, b) => a.localeCompare(b))
  ];

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
                  <SelectTrigger className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary dark:border-border dark:bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-2 border-border shadow-lg dark:bg-card dark:border-border">
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
                  <SelectTrigger className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary dark:border-border dark:bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-2 border-border shadow-lg dark:bg-card dark:border-border">
                    <SelectItem value="informell" className="hover:bg-accent focus:bg-accent text-foreground">Du (informell)</SelectItem>
                    <SelectItem value="formell" className="hover:bg-accent focus:bg-accent text-foreground">Sie (formell)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-ui text-foreground">Länge:</label>
                <Select value={settings.length} onValueChange={(value) => updateSetting('length', value)}>
                  <SelectTrigger className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary dark:border-border dark:bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-2 border-border shadow-lg dark:bg-card dark:border-border">
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
                  className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary w-full dark:border-border dark:bg-card dark:text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-ui text-foreground">Region (optional):</label>
                <Select value={settings.region || "Schweiz"} onValueChange={value => updateSetting('region', value)}>
                  <SelectTrigger className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary dark:border-border dark:bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-2 border-border shadow-lg dark:bg-card dark:border-border">
                    <SelectItem value="Schweiz" className="hover:bg-accent focus:bg-accent text-foreground">Schweiz</SelectItem>
                    <SelectItem value="Deutschland" className="hover:bg-accent focus:bg-accent text-foreground">Deutschland</SelectItem>
                    <SelectItem value="Österreich" className="hover:bg-accent focus:bg-accent text-foreground">Österreich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentAction === 'übersetzen' && (
            <div className="space-y-2">
              <label className="text-sm font-ui text-foreground">Zielsprache:</label>
              <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                <SelectTrigger className="input-modern bg-surface border-2 border-border hover:border-primary/50 focus:border-primary dark:border-border dark:bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-2 border-border shadow-lg dark:bg-card dark:border-border max-h-64 overflow-y-auto">
                 <div className="sticky top-0 z-10 bg-surface p-2">
                   <input
                     type="text"
                     value={languageSearch}
                     onChange={e => setLanguageSearch(e.target.value)}
                     placeholder="Sprache suchen..."
                     className="w-full px-2 py-1 rounded border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                   />
                 </div>
                  {filteredLanguages.map(lang => (
                    <SelectItem key={lang} value={lang.toLowerCase()} className="hover:bg-accent focus:bg-accent text-foreground">
                      {lang}
                    </SelectItem>
                  ))}
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
              className="input-modern min-h-[100px] resize-none dark:border-border dark:bg-card dark:text-foreground"
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