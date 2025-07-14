// Outlook Office.js Service

interface OutlookEmailData {
  subject: string;
  sender: string;
  content: string;
  itemId: string;
  conversationId: string;
  messageClass: string;
}

interface OutlookComposeData {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
}

interface OutlookService {
  initializeOffice(): Promise<void>;
  getCurrentEmailData(): Promise<OutlookEmailData>;
  getComposeData(): Promise<OutlookComposeData>;
  insertComposeText(text: string, insertLocation?: 'body' | 'signature'): Promise<void>;
  insertReplyText(text: string): Promise<void>;
  isOfficeInitialized(): boolean;
  isComposeMode(): boolean;
  onItemChanged(callback: () => void): void;
}

class OutlookServiceImpl implements OutlookService {
  private isInitialized = false;
  private composeMode = false;
  private itemChangedCallback: (() => void) | null = null;

  /** 
   * Registriert einen Callback, der bei jedem Mail-Wechsel ausgeführt wird.
   */
  public onItemChanged(callback: () => void) {
    this.itemChangedCallback = callback;
  }

  async initializeOffice(): Promise<void> {
    console.log('🔄 Initialisiere Office.js...');

    return new Promise((resolve, reject) => {
      if (typeof Office === 'undefined') {
        console.warn('⚠️ Office.js nicht verfügbar - Entwicklungsmodus aktiv');
        this.isInitialized = true;
        const params = new URLSearchParams(window.location.search);
        this.composeMode = params.get('compose') === 'true';
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Office initialization timeout'));
      }, 10000);

      Office.onReady((info) => {
        clearTimeout(timeout);

        if (info.host !== Office.HostType.Outlook) {
          reject(new Error('Not running in Outlook'));
          return;
        }

        console.log('✅ Office.js erfolgreich initialisiert:', {
          host: info.host,
          platform: info.platform,
          version: Office.context.diagnostics?.version
        });

        this.isInitialized = true;
        // Compose-Modus erkennen: in Read gibt es eine itemId, in Compose nicht
        const item = Office.context.mailbox.item!;
        this.composeMode = !!(
          item.itemType === Office.MailboxEnums.ItemType.Message &&
          !item.itemId
        );
        console.log('📧 Compose-Modus erkannt:', this.composeMode);

        // ItemChanged-Handler registrieren
        Office.context.mailbox.addHandlerAsync(
          Office.EventType.ItemChanged,
          () => {
            console.log('🔄 Outlook Event: ItemChanged');
            if (this.itemChangedCallback) {
              this.itemChangedCallback();
            }
          },
          (asyncResult) => {
            if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
              console.error('❌ Konnte ItemChanged-Handler nicht registrieren', asyncResult.error);
            }
          }
        );

        resolve();
      });
    });
  }

  async getCurrentEmailData(): Promise<OutlookEmailData> {
    if (!this.isInitialized) {
      throw new Error('Office.js not initialized');
    }

    if (typeof Office === 'undefined') {
      // Development Fallback
      return {
        subject: 'Projektbesprechung für nächste Woche',
        sender: 'maria.mueller@example.com',
        content: 'Hallo James,\n\nIch hoffe, es geht dir gut. …',
        itemId: 'dev-item-id',
        conversationId: 'dev-conversation-id',
        messageClass: 'IPM.Note'
      };
    }

    const item = Office.context.mailbox.item!;
    return new Promise((resolve, reject) => {
      item.body.getAsync(
        Office.CoercionType.Text,
        (result) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve({
              subject: item.subject || '',
              sender: item.sender?.emailAddress || '',
              content: result.value || '',
              itemId: item.itemId || '',
              conversationId: item.conversationId || '',
              messageClass: item.itemClass || ''
            });
          } else {
            reject(new Error('Failed to read email content'));
          }
        }
      );
    });
  }

  async getComposeData(): Promise<OutlookComposeData> {
    if (!this.isInitialized) {
      throw new Error('Office.js not initialized');
    }

    if (typeof Office === 'undefined') {
      return { to: [], cc: [], subject: '', body: '' };
    }

    const item = Office.context.mailbox.item!;
    return {
      to: item.to?.map(r => r.emailAddress) || [],
      cc: item.cc?.map(r => r.emailAddress) || [],
      subject: item.subject || '',
      body: ''  // bei Bedarf separat holen
    };
  }

  async insertComposeText(text: string, insertLocation: 'body' | 'signature' = 'body'): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Office.js not initialized');
    }

    if (typeof Office === 'undefined') {
      console.log('Would insert compose text at', insertLocation, ':', text);
      return;
    }

    const item = Office.context.mailbox.item!;
    if (insertLocation === 'body') {
      return new Promise((resolve, reject) => {
        item.body.setAsync(
          `<div>${text.replace(/\n/g, '<br>')}</div>`,
          { coercionType: Office.CoercionType.Html },
          (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
              resolve();
            } else {
              reject(new Error('Failed to insert text into compose body'));
            }
          }
        );
      });
    } else {
      // Signature-Logik hier ergänzen
      return Promise.resolve();
    }
  }

  async insertReplyText(text: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Office.js not initialized');
    }

    if (typeof Office === 'undefined') {
      console.log('Would insert reply text:', text);
      return;
    }

    Office.context.mailbox.item!.displayReplyAllForm({
      htmlBody: `<div>${text.replace(/\n/g, '<br>')}</div>`
    });
  }

  isOfficeInitialized(): boolean {
    return this.isInitialized;
  }

  isComposeMode(): boolean {
    return this.composeMode;
  }
}

export const outlookService = new OutlookServiceImpl();
export type { OutlookEmailData, OutlookComposeData, OutlookService };
