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
    <div className="card-modern p-6 space-y-4 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground mb-1 truncate">{emailData.subject}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{emailData.sender}</span>
          </div>
        </div>
      </div>

      {showSummary && (
        <div className="bg-accent rounded-xl p-4 border-l-4 border-primary animate-fade-in">
          <h3 className="font-medium text-accent-foreground mb-2">Zusammenfassung:</h3>
          <div className="text-sm text-accent-foreground/80 whitespace-pre-line">
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