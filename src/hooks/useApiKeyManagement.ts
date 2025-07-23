import { useEffect } from 'react';
import { aiService } from '@/services/aiService';

export function useApiKeyManagement() {
  useEffect(() => {
    const savedApiKey = localStorage.getItem('mailaider-api-key');
    if (savedApiKey) {
      aiService.setConfig({ apiKey: savedApiKey });
    } else {
      // Fallback: Standard-Key aus aiService.ts bleibt aktiv
      // Kein explizites Setzen nötig, da Konstruktor bereits Standard-Key setzt
      console.warn('Kein API Key gefunden. Es wird der im Code hinterlegte Standard-Key verwendet. GPT wird ggf. eingeschränkt funktionieren.');
    }
  }, []);
}
