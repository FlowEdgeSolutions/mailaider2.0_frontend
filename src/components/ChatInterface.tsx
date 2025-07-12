import React, { useState, useEffect } from 'react';
import { Copy, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernLoading } from './ModernLoading';

interface ChatInterfaceProps {
  output: string;
  isLoading: boolean;
  currentAction: string;
  onCopy: () => void;
  onInsertReply: () => void;
}

export function ChatInterface({ output, isLoading, currentAction, onCopy, onInsertReply }: ChatInterfaceProps) {
  const [loadingStage, setLoadingStage] = useState<'thinking' | 'processing' | 'generating'>('thinking');
  const [loadingMessage, setLoadingMessage] = useState('');

  // Cycle through loading stages when processing
  useEffect(() => {
    if (!isLoading) return;

    const stages = [
      { stage: 'thinking' as const, duration: 1000, message: 'KI analysiert Ihre Anfrage...' },
      { stage: 'processing' as const, duration: 1500, message: 'Optimale Lösung wird erstellt...' },
      { stage: 'generating' as const, duration: 1000, message: 'Antwort wird formuliert...' }
    ];

    let currentStageIndex = 0;
    setLoadingStage(stages[0].stage);
    setLoadingMessage(stages[0].message);

    const interval = setInterval(() => {
      currentStageIndex = (currentStageIndex + 1) % stages.length;
      setLoadingStage(stages[currentStageIndex].stage);
      setLoadingMessage(stages[currentStageIndex].message);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);
  return (
    <div className="card-modern p-4 space-y-3 animate-slide-up">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #007AFF 0%, #00C851 100%)'
        }}>
          <span className="text-sm font-bold text-white">AI</span>
        </div>
        <h3 className="font-ui text-foreground">KI-Assistent</h3>
        {isLoading && (
          <div className="ml-auto">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-4 min-h-[180px] max-h-[280px] overflow-y-auto border border-accent/20">
        {isLoading ? (
          <ModernLoading 
            stage={loadingStage} 
            message={loadingMessage}
          />
        ) : (
          <div className="text-sm font-body text-foreground leading-relaxed whitespace-pre-line">
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