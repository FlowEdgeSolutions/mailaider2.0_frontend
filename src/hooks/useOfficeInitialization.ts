import { useState, useEffect } from 'react';

// Minimal type declarations for Office.js
declare global {
  interface Window {
    Office: {
      onReady: (callback: () => void) => void;
      context: {
        mailbox: {
          item: {
            itemType: string;
            subject: string;
            sender: {
              emailAddress: string;
              displayName?: string;
            };
            body: {
              getAsync: (coercionType: string, options?: unknown) => Promise<{
                value: string;
                status: string;
              }>;
            };
          };
        };
      };
    };
  }
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

export function useOfficeInitialization() {
  const [isComposeMode, setIsComposeMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const [emailData, setEmailData] = useState<EmailData>({
    subject: '',
    sender: '',
    content: '',
    summary: ''
  });

  const [composeData, setComposeData] = useState<ComposeData>({
    to: [],
    cc: [],
    subject: '',
    purpose: ''
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        // Wait for Office.js to load
        await new Promise<void>((resolve) => {
          if (window.Office?.context) {
            resolve();
          } else {
            window.Office?.onReady?.(() => resolve());
          }
        });

        if (window.Office.context.mailbox?.item) {
          const item = window.Office.context.mailbox.item;
          
          // Use string literals directly for type checks
          const composeMode = (
            item.itemType === 'newMail' ||
            item.itemType === 'reply' ||
            item.itemType === 'forward'
          );

          setIsComposeMode(composeMode);
          setIsConnected(true);

          if (!composeMode) {
            // Read mode: Load actual email data
            const subject = item.subject || '';
            const sender = item.sender?.emailAddress || '';
            const contentResult = await item.body.getAsync('text');
            const content = contentResult.value || '';

            setEmailData({
              subject,
              sender,
              content,
              summary: ''
            });
          } else {
            // Compose mode: Initialize with default values
            setComposeData(prev => ({
              ...prev,
              subject: item.subject || '',
              purpose: 'Neue E-Mail verfassen'
            }));
          }
        }
      } catch (error) {
        console.error('Office initialization failed:', error);
        // Fallback for development outside Outlook
        if (process.env.NODE_ENV === 'development') {
          setIsComposeMode(false);
          setIsConnected(true);
          setEmailData({
            subject: 'Test Email Subject',
            sender: 'test@example.com',
            content: 'This is a test email content for development purposes.',
            summary: ''
          });
          console.warn('Using development fallback data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return {
    isConnected,
    isComposeMode,
    isLoading,
    emailData,
    composeData,
    setEmailData,
    setComposeData
  };
}