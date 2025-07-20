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
  const [showOutput, setShowOutput] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Cycle through loading stages when processing
  useEffect(() => {
    if (!isLoading) {
      // When loading stops, trigger elegant transition
      if (output && output !== 'Warte auf Ausgabe...') {
        setIsTransitioning(true);
        setTimeout(() => {
          setShowOutput(true);
          setIsTransitioning(false);
        }, 300);
      }
      return;
    }

    setShowOutput(false);
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
  }, [isLoading, output]);
  return (
    <div className="card-modern p-4 space-y-3 animate-slide-up" data-tutorial="chat-interface">
      {isLoading && (
        <div className="flex justify-end">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}

      <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-4 min-h-[180px] max-h-[280px] border border-accent/20 relative">
        {isLoading || isTransitioning ? (
          <div className={`transition-all duration-500 ${isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <ModernLoading 
              stage={loadingStage} 
              message={loadingMessage}
            />
          </div>
        ) : (
          <div className={`transition-all duration-700 ease-out ${
            showOutput 
              ? 'opacity-100 transform translate-y-0 scale-100' 
              : 'opacity-0 transform translate-y-4 scale-95'
          }`}>
            <div className="text-sm font-body text-foreground leading-relaxed whitespace-pre-line max-h-[220px] overflow-y-auto pr-2 animate-fade-in custom-scrollbar">
              {output && output !== 'Warte auf Ausgabe...'
                ? output
                : !isLoading && !isTransitioning && (
                    <span className="text-muted-foreground">Hier erscheint deine generierte E-Mail.</span>
                  )}
            </div>
          </div>
        )}
      </div>

      {!isLoading && !isTransitioning && showOutput && output !== 'Warte auf Ausgabe...' && (
        <div className="flex gap-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
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