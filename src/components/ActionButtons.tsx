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
    <div className="card-modern p-4 animate-bounce-in">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = currentAction === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              disabled={!isConnected}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300 group
                ${isActive 
                  ? 'bg-gradient-primary border-primary text-white shadow-purple' 
                  : 'bg-surface border-border hover:border-primary/30 hover:bg-accent'
                }
                ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              `}
              title={action.tooltip}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-primary'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-foreground'}`}>
                  {action.label}
                </span>
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