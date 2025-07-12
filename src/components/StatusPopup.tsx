import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatusPopupProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export function StatusPopup({ isOpen, message, onClose }: StatusPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md animate-bounce-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {message}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-all duration-200 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onClose}
              className="btn-primary"
            >
              Verstanden
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}