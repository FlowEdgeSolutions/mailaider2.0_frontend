  import { useState, useEffect } from 'react';
  import { aiService } from '@/services/aiService';

  export function useApiKeyManagement() {
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);

    useEffect(() => {
      // Check if API key is configured
      const savedApiKey = localStorage.getItem('mailaider-api-key');
      if (savedApiKey) {
        aiService.setConfig({ apiKey: savedApiKey });
      } else {
        setShowApiKeyInput(true);
      }
    }, []);

    const handleApiKeySubmit = (apiKey: string) => {
      localStorage.setItem('mailaider-api-key', apiKey);
      aiService.setConfig({ apiKey });
      setShowApiKeyInput(false);
      return 'API Key erfolgreich konfiguriert!';
    };

    return {
      showApiKeyInput,
      setShowApiKeyInput,
      handleApiKeySubmit
    };
  }