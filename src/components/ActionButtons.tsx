import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare, FileText, Languages, Wand2, PenTool } from 'lucide-react';

interface ActionButtonsProps {
  currentAction: string;
  onActionSelect: (action: string) => void;
  isConnected: boolean;
  isComposeMode?: boolean;
  onCorrectionClick?: () => void;
}

export function ActionButtons({ currentAction, onActionSelect, isConnected, isComposeMode = false, onCorrectionClick }: ActionButtonsProps) {
  const readModeActions = [
    {
      id: 'antworten',
      label: 'Antworten',
      icon: MessageSquare,
      description: 'Intelligente Antwort generieren'
    },
    {
      id: 'zusammenfassen',
      label: 'Zusammenfassen',
      icon: FileText,
      description: 'E-Mail Zusammenfassung erstellen'
    },
    {
      id: 'übersetzen',
      label: 'Übersetzen',
      icon: Languages,
      description: 'E-Mail übersetzen'
    },
    {
      id: 'freierModus',
      label: 'Freier Modus',
      icon: Wand2,
      description: 'Individuelle Bearbeitung'
    }
  ];

  const composeModeActions = [
    {
      id: 'verfassen',
      label: 'E-Mail verfassen',
      icon: PenTool,
      description: 'Neue E-Mail schreiben'
    },
    {
      id: 'freierModus',
      label: 'Freier Modus',
      icon: Wand2,
      description: 'Individuelle Bearbeitung'
    }
  ];

  const actions = isComposeMode ? composeModeActions : readModeActions;

  return (
    <div className="card-modern p-4 animate-bounce-in" data-tutorial="action-buttons">
      <div className="flex gap-2 justify-between">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = currentAction === action.id;

          return (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onActionSelect(action.id)}
                  disabled={!isConnected}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`
                    flex-1 p-3 h-auto flex-col gap-1 relative transition-all duration-150
                    ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {/* KEIN sichtbarer Text mehr! */}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {action.label}
                <div className="text-xs mt-1 text-muted-foreground">{action.description}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {isComposeMode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onCorrectionClick}
                disabled={!isConnected}
                variant="outline"
                size="sm"
                className="flex-1 p-3 h-auto flex-col gap-1 relative transition-all duration-150 hover:scale-105 active:scale-95"
              >
                <Wand2 className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Mail korrigieren
              <div className="text-xs mt-1 text-muted-foreground">E-Mail stilistisch, sprachlich oder orthografisch korrigieren</div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
