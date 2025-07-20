import React from 'react';
import { Moon, Sun, Wifi, WifiOff, HelpCircle } from 'lucide-react';
import mailAiderLogo from '../assets/mailaider-logo.png';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isConnected: boolean;
  onStatusClick: () => void;
  onTutorialClick?: () => void;
}

export function Header({ isDarkMode, onToggleDarkMode, isConnected, onStatusClick, onTutorialClick }: HeaderProps) {
  return (
    <div className="card-modern p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={mailAiderLogo} alt="MailAider Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-display text-gradient-primary">MailAider AI</h1>
            <p className="text-xs font-body text-muted-foreground">Intelligenter E-Mail-Assistent</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onStatusClick}
            data-tutorial="status"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isConnected 
                ? 'bg-success/10 text-success hover:bg-success/20' 
                : 'bg-warning/10 text-warning hover:bg-warning/20'
            }`}
            title={isConnected ? 'AI ist verbunden - DSGVO sicher' : 'Verbindung wird hergestellt...'}
          >
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleDarkMode}
            className="w-9 h-9 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-all duration-300 hover:scale-105"
            title="Dark Mode umschalten"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {onTutorialClick && (
            <button
              onClick={onTutorialClick}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-primary/10 focus:outline-none"
              title="Tutorial starten"
              style={{marginLeft: 2}}
            >
              <HelpCircle className="w-5 h-5 text-primary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}