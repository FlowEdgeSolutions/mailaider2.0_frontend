import React from 'react';
import { Moon, Sun, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isConnected: boolean;
  onStatusClick: () => void;
}

export function Header({ isDarkMode, onToggleDarkMode, isConnected, onStatusClick }: HeaderProps) {
  return (
    <div className="card-modern p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-blue" style={{
            background: 'linear-gradient(135deg, #007AFF 0%, #00C851 100%)'
          }}>
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-primary">MailAider AI</h1>
            <p className="text-sm text-muted-foreground">Intelligent Email Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onStatusClick}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isConnected 
                ? 'bg-success/10 text-success hover:bg-success/20' 
                : 'bg-warning/10 text-warning hover:bg-warning/20'
            }`}
            title={isConnected ? 'AI ist verbunden - DSGVO sicher' : 'Verbindung wird hergestellt...'}
          >
            {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onToggleDarkMode}
            className="w-10 h-10 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-all duration-300 hover:scale-105"
            title="Dark Mode umschalten"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}