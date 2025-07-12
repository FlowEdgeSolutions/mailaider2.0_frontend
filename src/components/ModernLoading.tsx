import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface ModernLoadingProps {
  stage: 'thinking' | 'processing' | 'generating';
  message?: string;
}

export function ModernLoading({ stage, message }: ModernLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  const getStageConfig = () => {
    switch (stage) {
      case 'thinking':
        return {
          animationUrl: 'https://lottie.host/b7b9f37c-9c34-4be0-8b87-e5d7f3c0d8a4/Lw2OgEqS3t.json',
          title: 'KI denkt nach...',
          subtitle: 'Analysiere Ihre Anfrage',
          color: 'from-blue-500 to-purple-600'
        };
      case 'processing':
        return {
          animationUrl: 'https://lottie.host/embed/b31b5da5-c5c1-4c5d-a1ed-8c3a8f5c9b2e/UjQQq8l0kl.json',
          title: 'Verarbeitung läuft...',
          subtitle: 'Erstelle optimierte Lösung',
          color: 'from-green-500 to-emerald-600'
        };
      case 'generating':
        return {
          animationUrl: 'https://lottie.host/embed/d4e5f6c7-b8a9-0b1c-2d3e-4f5a6b7c8d9e/XyZaBcDeFg.json',
          title: 'Antwort wird generiert...',
          subtitle: 'Formuliere perfekte Antwort',
          color: 'from-primary to-secondary'
        };
      default:
        return {
          animationUrl: 'https://lottie.host/b7b9f37c-9c34-4be0-8b87-e5d7f3c0d8a4/Lw2OgEqS3t.json',
          title: 'Lädt...',
          subtitle: 'Einen Moment bitte',
          color: 'from-primary to-primary-light'
        };
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      // Clear previous animation
      if (animationRef.current) {
        animationRef.current.destroy();
      }

      const config = getStageConfig();
      
      // Create simple CSS animation instead of Lottie for fallback
      const animationElement = containerRef.current;
      animationElement.innerHTML = `
        <div class="relative w-16 h-16 mx-auto mb-4">
          <div class="absolute inset-0 rounded-full bg-gradient-to-r ${config.color} opacity-20 animate-ping"></div>
          <div class="absolute inset-2 rounded-full bg-gradient-to-r ${config.color} opacity-40 animate-pulse"></div>
          <div class="absolute inset-4 rounded-full bg-gradient-to-r ${config.color} animate-spin"></div>
        </div>
      `;
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [stage]);

  const config = getStageConfig();

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Animation Container */}
      <div ref={containerRef} className="mb-4"></div>
      
      {/* Text Content */}
      <div className="text-center space-y-2">
        <h3 className={`text-lg font-display bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
          {message || config.title}
        </h3>
        <p className="text-sm font-body text-muted-foreground animate-pulse">
          {config.subtitle}
        </p>
      </div>
      
      {/* Progress Dots */}
      <div className="flex space-x-1 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.color} opacity-60`}
            style={{
              animation: `pulse 1.5s ease-in-out infinite ${i * 0.3}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}