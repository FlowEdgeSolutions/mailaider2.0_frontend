import { useState } from 'react';
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

export function EmailViewer({ 
  emailData, 
  showSummary, 
  onToggleSummary, 
  isLoading 
}: EmailViewerProps) {
  const [error, setError] = useState<string | null>(null);

  // Fallback für leere Inhalte
  if (!emailData.content && !isLoading) {
    return (
      <div className="card-modern p-4 text-center">
        <Mail className="w-8 h-8 mx-auto text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Kein E-Mail-Inhalt gefunden oder E-Mail nicht unterstützt
        </p>
      </div>
    );
  }

  return (
    <div className="card-modern p-4 space-y-3 animate-slide-up" data-tutorial="email-viewer">
      {error && (
        <div className="bg-destructive/10 p-3 rounded-lg border border-destructive">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-base font-ui text-foreground truncate">{emailData.subject}</h2>
        <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{emailData.sender}</span>
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