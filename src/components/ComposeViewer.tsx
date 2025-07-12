import React from 'react';
import { Mail, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComposeData {
  to: string[];
  cc: string[];
  subject: string;
  purpose: string;
}

interface ComposeViewerProps {
  composeData: ComposeData;
  showDetails: boolean;
  onToggleDetails: () => void;
  isLoading: boolean;
}

export function ComposeViewer({ composeData, showDetails, onToggleDetails, isLoading }: ComposeViewerProps) {
  return (
    <div className="card-modern p-4 space-y-3 animate-slide-up" data-tutorial="compose-viewer">
      <div className="space-y-2">
        <h2 className="text-base font-ui text-foreground flex items-center gap-2">
          <Mail className="w-4 h-4" />
          E-Mail verfassen
        </h2>
        
        {composeData.to.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">An: {composeData.to.join(', ')}</span>
          </div>
        )}
        
        {composeData.subject && (
          <div className="text-sm font-body text-foreground">
            Betreff: {composeData.subject}
          </div>
        )}
      </div>

      {showDetails && (
        <div className="bg-accent rounded-xl p-3 border-l-4 border-primary animate-fade-in">
          <h3 className="font-ui text-accent-foreground mb-2">Kontext:</h3>
          <div className="text-sm font-body text-accent-foreground/80 space-y-1">
            {composeData.to.length > 0 && (
              <p><strong>Empfänger:</strong> {composeData.to.join(', ')}</p>
            )}
            {composeData.cc.length > 0 && (
              <p><strong>CC:</strong> {composeData.cc.join(', ')}</p>
            )}
            {composeData.subject && (
              <p><strong>Betreff:</strong> {composeData.subject}</p>
            )}
            {composeData.purpose && (
              <p><strong>Zweck:</strong> {composeData.purpose}</p>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={onToggleDetails}
        variant="outline"
        size="sm"
        className="w-full transition-all duration-300 hover:scale-105"
        disabled={isLoading}
      >
        {showDetails ? (
          <>
            <ChevronUp className="w-4 h-4 mr-2" />
            Details verbergen
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-2" />
            Details anzeigen
          </>
        )}
      </Button>
    </div>
  );
}