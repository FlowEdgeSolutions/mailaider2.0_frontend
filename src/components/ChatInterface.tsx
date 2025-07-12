import React from 'react';
import { Copy, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  output: string;
  isLoading: boolean;
  currentAction: string;
  onCopy: () => void;
  onInsertReply: () => void;
}

export function ChatInterface({ output, isLoading, currentAction, onCopy, onInsertReply }: ChatInterfaceProps) {
  return (
    <div className="card-modern p-6 space-y-4 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
          <span className="text-sm font-bold text-white">AI</span>
        </div>
        <h3 className="font-semibold text-foreground">KI-Assistent</h3>
        {isLoading && (
          <div className="ml-auto">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="bg-accent/30 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">KI verarbeitet Ihre Anfrage...</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {output}
          </div>
        )}
      </div>

      {!isLoading && output !== 'Warte auf Ausgabe...' && (
        <div className="flex gap-2">
          <Button
            onClick={onCopy}
            variant="outline"
            size="sm"
            className="flex-1 transition-all duration-300 hover:scale-105"
          >
            <Copy className="w-4 h-4 mr-2" />
            Kopieren
          </Button>
          
          {currentAction === 'antworten' && (
            <Button
              onClick={onInsertReply}
              size="sm"
              className="flex-1 btn-primary transition-all duration-300 hover:scale-105"
            >
              <Send className="w-4 h-4 mr-2" />
              Einfügen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}