import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Key, Info, Eye, EyeOff } from 'lucide-react';

interface ApiKeyInputProps {
  isVisible: boolean;
  onSubmit: (apiKey: string) => void;
  onSkip: () => void;
}

export function ApiKeyInput({ isVisible, onSubmit, onSkip }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
      setApiKey('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 space-y-4 animate-slide-up">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-ui text-foreground">API Key konfigurieren</h2>
          <p className="text-sm font-body text-muted-foreground">
            Für die KI-Funktionen wird ein Perplexity API Key benötigt
          </p>
        </div>

        <div className="bg-accent/50 rounded-lg p-3 flex gap-3">
          <Info className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm font-body text-accent-foreground/80">
            <p className="font-medium mb-1">Sicherheit:</p>
            <p>Der API Key wird nur lokal gespeichert und direkt an Perplexity übertragen. Keine Speicherung auf unseren Servern.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="Perplexity API Key eingeben..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              className="flex-1"
            >
              Später
            </Button>
            <Button
              type="submit"
              disabled={!apiKey.trim()}
              className="flex-1"
            >
              Speichern
            </Button>
          </div>
        </form>

        <div className="text-xs font-body text-muted-foreground text-center">
          <p>API Key erhalten Sie bei{' '}
            <a 
              href="https://www.perplexity.ai/settings/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Perplexity AI
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}