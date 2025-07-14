import { useEffect } from 'react';
import { aiService } from '@/services/aiService';

export function useApiKeyManagement() {
  useEffect(() => {
    const savedApiKey = localStorage.getItem('mailaider-api-key');
    if (savedApiKey) {
      aiService.setConfig({ apiKey: savedApiKey });
    } else {
      console.warn('Kein API Key gefunden. GPT wird nicht funktionieren.');
    }
  }, []);
}
