import { useEffect } from 'react';
import { aiService } from '@/services/aiService';

export function useApiKeyManagement() {
  useEffect(() => {
    const savedApiKey = localStorage.getItem('mailaider-api-key');
    // Entfernt: aiService.setConfig({ apiKey: savedApiKey });
    // Kein API-Key-Handling mehr im Frontend nötig
  }, []);
}
