import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  {
    id: 1,
    title: "Willkommen bei MailAider AI! 👋",
    content: "Ihr intelligenter E-Mail-Assistent hilft Ihnen beim Bearbeiten und Beantworten von E-Mails. Lassen Sie uns eine kurze Tour machen!",
    target: null,
    position: "center"
  },
  {
    id: 2,
    title: "Verbindungsstatus",
    content: "Hier sehen Sie den Status der KI-Verbindung. Grün bedeutet bereit, gelb bedeutet Verbindung wird hergestellt.",
    target: "[data-tutorial='status']",
    position: "bottom"
  },
  {
    id: 3,
    title: "E-Mail Übersicht",
    content: "Hier wird der Betreff und Absender der aktuellen E-Mail angezeigt. Sie können auch eine Zusammenfassung anzeigen lassen.",
    target: "[data-tutorial='email-viewer']",
    position: "bottom"
  },
  {
    id: 4,
    title: "KI-Chat Bereich",
    content: "Hier erscheinen die generierten Antworten, Übersetzungen oder Zusammenfassungen. Der Text ist scrollbar und kopierbar.",
    target: "[data-tutorial='chat-interface']",
    position: "top"
  },
  {
    id: 5,
    title: "Aktions-Buttons",
    content: "Diese 4 Buttons sind das Herzstück: Zusammenfassen, Antworten, Übersetzen und Freier Modus. Einfach klicken und loslegen!",
    target: "[data-tutorial='action-buttons']",
    position: "top"
  },
  {
    id: 6,
    title: "Fertig! 🎉",
    content: "Sie sind bereit! Wählen Sie eine Aktion und lassen Sie die KI für Sie arbeiten. Dieses Tutorial wird nicht mehr angezeigt.",
    target: null,
    position: "center"
  }
];

export function Tutorial({ isVisible, onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [spotlightRect, setSpotlightRect] = useState<{left: number, top: number, width: number, height: number} | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const step = tutorialSteps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target);
      setHighlightedElement(element);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect({
          left: rect.left - 8,
          top: rect.top - 8,
          width: rect.width + 16,
          height: rect.height + 16
        });
      } else {
        setSpotlightRect(null);
      }
    } else {
      setHighlightedElement(null);
      setSpotlightRect(null);
    }
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const currentTutorialStep = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const nextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!highlightedElement || currentTutorialStep.position === "center") {
      return "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    }

    const rect = highlightedElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let top = rect.bottom + 20;

    // Position adjustments
    if (currentTutorialStep.position === "top") {
      top = rect.top - tooltipHeight - 20;
    }

    // Keep tooltip in viewport
    if (left < 20) left = 20;
    if (left + tooltipWidth > window.innerWidth - 20) {
      left = window.innerWidth - tooltipWidth - 20;
    }
    if (top < 20) top = rect.bottom + 20;

    return `fixed`;
  };

  const getTooltipStyle = () => {
    if (!highlightedElement || currentTutorialStep.position === "center") {
      return {};
    }

    const rect = highlightedElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let top = rect.bottom + 20;

    if (currentTutorialStep.position === "top") {
      top = rect.top - tooltipHeight - 20;
    }

    // Keep tooltip in viewport
    if (left < 20) left = 20;
    if (left + tooltipWidth > window.innerWidth - 20) {
      left = window.innerWidth - tooltipWidth - 20;
    }
    if (top < 20) top = rect.bottom + 20;

    return { left, top };
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* SVG Spotlight Overlay */}
      {spotlightRect ? (
        <svg className="absolute inset-0 w-full h-full pointer-events-auto" style={{zIndex: 1}}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="18" ry="18"
                fill="black"
              />
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="black" fillOpacity="0.6" mask="url(#spotlight-mask)" />
        </svg>
      ) : (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" style={{zIndex: 1}} />
      )}
      {/* Highlight spotlight (Rahmen) */}
      {spotlightRect && (
        <div
          className="absolute border-2 border-primary/50 rounded-xl pointer-events-none animate-pulse-glow"
          style={{
            left: spotlightRect.left,
            top: spotlightRect.top,
            width: spotlightRect.width,
            height: spotlightRect.height,
            zIndex: 2
          }}
        />
      )}
      {/* Tutorial tooltip */}
      <div
        className={`absolute w-80 pointer-events-auto ${getTooltipPosition()}`}
        style={{...getTooltipStyle(), zIndex: 3}}
      >
        <div className="bg-card rounded-2xl shadow-2xl border border-border p-6 animate-bounce-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {currentStep + 1}
                </span>
              </div>
              <span className="text-xs font-ui text-muted-foreground">
                {currentStep + 1} von {tutorialSteps.length}
              </span>
            </div>
            <button
              onClick={onSkip}
              className="w-8 h-8 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-all duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-display text-foreground mb-2">
              {currentTutorialStep.title}
            </h3>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              {currentTutorialStep.content}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={prevStep}
              variant="outline"
              size="sm"
              disabled={isFirstStep}
              className="transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            <Button
              onClick={nextStep}
              size="sm"
              className="btn-primary transition-all duration-150"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tutorial beenden
                </>
              ) : (
                <>
                  Weiter
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip option */}
          {!isLastStep && (
            <div className="mt-3 text-center">
              <button
                onClick={onSkip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                Tutorial überspringen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
