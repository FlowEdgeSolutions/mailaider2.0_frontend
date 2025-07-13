import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText, Languages, Wand2, PenTool } from 'lucide-react';

interface ActionButtonsProps {
  currentAction: string;
  onActionSelect: (action: string) => void;
  isConnected: boolean;
  isComposeMode?: boolean;
}

export function ActionButtons({ currentAction, onActionSelect, isConnected, isComposeMode = false }: ActionButtonsProps) {
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
            <Button
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              disabled={!isConnected}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`
                flex-1 p-3 h-auto flex-col gap-1 relative group transition-all duration-150
                ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{action.label}</span>
              
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                {action.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}