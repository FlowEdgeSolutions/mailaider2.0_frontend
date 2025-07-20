import React from 'react';
import { Mail, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ComposeData {
  to: string[];
  cc: string[];
  subject: string;
  purpose: string;
}

interface ComposeViewerProps {
  composeData: ComposeData;
  isLoading: boolean;
  onComposeDataChange?: (data: Partial<ComposeData>) => void;
}

export function ComposeViewer({ composeData, isLoading, onComposeDataChange }: ComposeViewerProps) {
  return (
    <div className="card-modern p-4 space-y-3 animate-slide-up" data-tutorial="compose-viewer">
      <div className="space-y-2">
        <h2 className="text-base font-ui text-foreground flex items-center gap-2">
          <Mail className="w-4 h-4" />
          E-Mail verfassen
        </h2>
        {/* Empfänger Input */}
        <Input
          type="text"
          placeholder="Empfänger (z.B. max@beispiel.de)"
          value={composeData.to.join(', ')}
          onChange={e => onComposeDataChange && onComposeDataChange({ to: e.target.value.split(',').map(s => s.trim()) })}
          className="input-modern"
          disabled={isLoading}
        />
        {/* Betreff Input */}
        <Input
          type="text"
          placeholder="Betreff eingeben..."
          value={typeof composeData.subject === 'string' ? composeData.subject : ''}
          onChange={e => onComposeDataChange && onComposeDataChange({ subject: e.target.value })}
          className="input-modern"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}