import React from 'react';
import { MessageSquare, PenTool, Languages, Zap } from 'lucide-react';

interface ActionButtonsProps {
  currentAction: string;
  onActionSelect: (action: string) => void;
  isConnected: boolean;
}

const actions = [
  {
    id: 'zusammenfassen',
    label: 'Zusammenfassen',
    icon: MessageSquare,
    tooltip: 'E-Mail zusammenfassen'
  },
  {
    id: 'antworten',
    label: 'Antworten',
    icon: PenTool,
    tooltip: 'Antwort formulieren'
  },
  {
    id: 'übersetzen',
    label: 'Übersetzen',
    icon: Languages,
    tooltip: 'E-Mail übersetzen'
  },
  {
    id: 'freierModus',
    label: 'Freier Modus',
    icon: Zap,
    tooltip: 'Freie Bearbeitung'
  }
];

export function ActionButtons({ currentAction, onActionSelect, isConnected }: ActionButtonsProps) {
  return (
    <div className="card-modern p-4 animate-bounce-in" data-tutorial="action-buttons">
      <div className="flex gap-2 justify-between">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = currentAction === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              disabled={!isConnected}
              className={`
                relative p-3 rounded-xl border-2 transition-all duration-150 group flex-1 max-w-[60px]
                ${isActive 
                  ? 'bg-gradient-primary border-primary text-white shadow-blue' 
                  : 'bg-surface border-border hover:border-primary/30 hover:bg-accent'
                }
                ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 transform-gpu'}
              `}
            >
              <div className="flex justify-center">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary'}`} />
              </div>
              
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                {action.tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
              </div>
              
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-20 animate-pulse-glow" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}