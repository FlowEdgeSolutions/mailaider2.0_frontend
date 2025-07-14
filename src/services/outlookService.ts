// src/services/outlookService.ts

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

export interface OutlookService {
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
        console.warn('⚠️ Office.js nicht verfügbar – Simuliere Umgebung');
        this.isInitialized = true;
        const params = new URLSearchParams(window.location.search);
        this.composeMode = params.get('compose') === 'true';
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Office.js Initialisierung Timeout'));
      }, 10000);

      Office.onReady((info) => {
        clearTimeout(timeout);

        if (info.host !== Office.HostType.Outlook) {
          reject(new Error('Add-in läuft nicht in Outlook'));
          return;
        }

        console.log('✅ Office.js initialisiert:', {
          host: info.host,
          platform: info.platform,
          version: Office.context.diagnostics?.version
        });

        this.isInitialized = true;
        const item = Office.context.mailbox.item!;
        // Compose-Modus: keine itemId im Compose-Fenster
        this.composeMode =
          item.itemType === Office.MailboxEnums.ItemType.Message &&
          !item.itemId;
        console.log('📧 Compose-Modus:', this.composeMode);

        // ItemChanged-Handler registrieren (mit leerem Optionen-Objekt)
        Office.context.mailbox.addHandlerAsync(
          Office.EventType.ItemChanged,
          () => {
            console.log('🔄 Outlook Event: ItemChanged');
            if (this.itemChangedCallback) {
              this.itemChangedCallback();
            }
          },
          {}, // AsyncContextOptions
          (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
              console.error(
                '❌ ItemChanged-Handler Registrierung fehlgeschlagen',
                asyncResult.error
              );
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
      // Entwicklungs-Fallback
      return {
        subject: 'Beispiel-Betreff',
        sender: 'max.mustermann@example.com',
        content: 'Dies ist ein simuliertes E-Mail-Inhaltsbeispiel.',
        itemId: 'dev-item',
        conversationId: 'dev-conv',
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
      body: '' // Bei Bedarf separat holen
    };
  }

  async insertComposeText(
    text: string,
    insertLocation: 'body' | 'signature' = 'body'
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Office.js not initialized');
    }

    if (typeof Office === 'undefined') {
      console.log('DEV: würde Text einfügen', insertLocation, text);
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
      console.log('DEV: würde Reply-Text einfügen', text);
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
