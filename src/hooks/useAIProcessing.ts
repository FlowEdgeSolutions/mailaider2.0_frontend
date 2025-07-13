import { useState } from 'react';
import { aiService } from '@/services/aiService';

interface SettingsData {
  tone: string;
  greeting: string;
  length: string;
  language: string;
}

interface EmailData {
  subject: string;
  sender: string;
  content: string;
  summary: string;
}

interface ComposeData {
  to: string[];
  cc: string[];
  subject: string;
  purpose: string;
}

export function useAIProcessing() {
  const [isLoading, setIsLoading] = useState(false);
  const [chatOutput, setChatOutput] = useState('Warte auf Ausgabe...');

  const processEmailWithAI = async (
    currentAction: string,
    userPrompt: string,
    recipientName: string | undefined,
    settings: SettingsData,
    isComposeMode: boolean,
    emailData: EmailData,
    composeData: ComposeData,
    setShowApiKeyInput: (show: boolean) => void
  ) => {
    setIsLoading(true);
    setChatOutput('Verarbeitung läuft...');
    
    if (!aiService.isConfigured()) {
      setChatOutput('❌ API Key nicht konfiguriert. Bitte fügen Sie Ihren API Key hinzu.');
      setIsLoading(false);
      setShowApiKeyInput(true);
      return;
    }

    try {
      let actionType: 'summarize' | 'reply' | 'translate' | 'custom' | 'compose';
      
      switch (currentAction) {
        case 'zusammenfassen':
          actionType = 'summarize';
          break;
        case 'antworten':
          actionType = 'reply';
          break;
        case 'übersetzen':
          actionType = 'translate';
          break;
        case 'verfassen':
          actionType = 'compose';
          break;
        case 'freierModus':
          actionType = 'custom';
          break;
        default:
          actionType = 'custom';
      }

      const requestData: any = {
        action: actionType,
        settings,
        customPrompt: userPrompt,
        recipientName
      };

      if (isComposeMode) {
        requestData.composeContext = {
          to: composeData.to,
          subject: composeData.subject,
          purpose: userPrompt || composeData.purpose
        };
      } else {
        requestData.emailContent = emailData.content;
      }

      const result = await aiService.processEmail(requestData);

      if (result.success) {
        setChatOutput(result.result);
      } else {
        setChatOutput(`❌ Fehler: ${result.error}`);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error during processing:', error);
      setChatOutput('❌ Fehler bei der Verarbeitung. Bitte versuchen Sie es erneut.');
      setIsLoading(false);
    }
  };

  const generateSummary = async (emailContent: string, settings: SettingsData, setEmailData: (data: any) => void) => {
    setIsLoading(true);
    
    try {
      const result = await aiService.processEmail({
        action: 'summarize',
        emailContent,
        settings
      });

      if (result.success) {
        setEmailData((prev: EmailData) => ({ ...prev, summary: result.result }));
      }
    } catch (error) {
      console.error('Summary generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    chatOutput,
    setChatOutput,
    processEmailWithAI,
    generateSummary
  };
}