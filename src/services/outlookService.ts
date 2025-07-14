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

  /** Registriert einen Callback für Mail-Wechsel */
  public onItemChanged(callback: () => void) {
    this.itemChangedCallback = callback;
  }

  /** Initialisiert Office.js und registriert den ItemChanged-Handler */
  async initializeOffice(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔄 Initialisiere Office.js…');
    await new Promise<void>((resolve, reject) => {
      if (typeof Office === 'undefined') {
        console.warn('⚠️ Office.js nicht verfügbar – Simuliere Umgebung');
        this.isInitialized = true;
        this.composeMode = new URLSearchParams(window.location.search).get('compose') === 'true';
        resolve();
        return;
      }

      const timeout = setTimeout(() => reject(new Error('Office.js Initialisierung Timeout')), 10000);

      Office.onReady((info) => {
        clearTimeout(timeout);
        if (info.host !== Office.HostType.Outlook) {
          reject(new Error('Add-in läuft nicht in Outlook'));
          return;
        }

        console.log('✅ Office.js initialisiert:', info);
        this.isInitialized = true;
        const item = Office.context.mailbox.item!;
        this.composeMode =
          item.itemType === Office.MailboxEnums.ItemType.Message &&
          !item.itemId;
        console.log('📧 Compose-Modus:', this.composeMode);

        // ItemChanged-Handler registrieren
        Office.context.mailbox.addHandlerAsync(
          Office.EventType.ItemChanged,
          () => {
            console.log('🔄 Outlook Event: ItemChanged');
            this.itemChangedCallback?.();
          },
          {}, // AsyncContextOptions
          (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
              console.error('❌ ItemChanged-Handler Registration failed', asyncResult.error);
            }
          }
        );

        resolve();
      });
    });
  }

  isOfficeInitialized(): boolean {
    return this.isInitialized;
  }

  isComposeMode(): boolean {
    return this.composeMode;
  }

  /** Stellt vor jedem API-Aufruf sicher, dass Office.js initialisiert ist */
  private async ensureInit() {
    if (!this.isInitialized) {
      await this.initializeOffice();
    }
  }

  async getCurrentEmailData(): Promise<OutlookEmailData> {
    await this.ensureInit();

    if (typeof Office === 'undefined') {
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
      item.body.getAsync(Office.CoercionType.Text, (result) => {
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
      });
    });
  }

  async getComposeData(): Promise<OutlookComposeData> {
    await this.ensureInit();

    if (typeof Office === 'undefined') {
      return { to: [], cc: [], subject: '', body: '' };
    }

    const item = Office.context.mailbox.item!;
    return {
      to: item.to?.map(r => r.emailAddress) || [],
      cc: item.cc?.map(r => r.emailAddress) || [],
      subject: item.subject || '',
      body: '' // Body separat holen, wenn gewünscht
    };
  }

  async insertComposeText(text: string, insertLocation: 'body' | 'signature' = 'body'): Promise<void> {
    await this.ensureInit();

    if (typeof Office === 'undefined') {
      console.log('DEV: würde Text einfügen', insertLocation, text);
      return;
    }

    const item = Office.context.mailbox.item!;
    if (insertLocation === 'body') {
      await new Promise<void>((resolve, reject) => {
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
    }
  }

  async insertReplyText(text: string): Promise<void> {
    await this.ensureInit();

    if (typeof Office === 'undefined') {
      console.log('DEV: würde Reply-Text einfügen', text);
      return;
    }

    Office.context.mailbox.item!.displayReplyAllForm({
      htmlBody: `<div>${text.replace(/\n/g, '<br>')}</div>`
    });
  }
}

export const outlookService = new OutlookServiceImpl();
