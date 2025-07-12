import React from 'react';
import { Mail, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailData {
  subject: string;
  sender: string;
  content: string;
  summary: string;
}

interface EmailViewerProps {
  emailData: EmailData;
  showSummary: boolean;
  onToggleSummary: () => void;
  isLoading: boolean;
}

export function EmailViewer({ emailData, showSummary, onToggleSummary, isLoading }: EmailViewerProps) {
  return (
    <div className="card-modern p-4 space-y-3 animate-slide-up" data-tutorial="email-viewer">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-ui text-foreground mb-1 truncate">{emailData.subject}</h2>
          <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{emailData.sender}</span>
          </div>
        </div>
      </div>

      {showSummary && (
        <div className="bg-accent rounded-xl p-3 border-l-4 border-primary animate-fade-in">
          <h3 className="font-ui text-accent-foreground mb-2">Zusammenfassung:</h3>
          <div className="text-sm font-body text-accent-foreground/80 whitespace-pre-line">
            {emailData.summary}
          </div>
        </div>
      )}

      <Button
        onClick={onToggleSummary}
        variant="outline"
        size="sm"
        className="w-full transition-all duration-300 hover:scale-105"
        disabled={isLoading}
      >
        {showSummary ? (
          <>
            <ChevronUp className="w-4 h-4 mr-2" />
            Zusammenfassung verbergen
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-2" />
            Zusammenfassung anzeigen
          </>
        )}
      </Button>
    </div>
  );
}