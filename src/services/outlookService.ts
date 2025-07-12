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
}

class OutlookServiceImpl implements OutlookService {
  private isInitialized = false;
  private composeMode = false;

  async initializeOffice(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Office === 'undefined') {
        // Fallback für Development ohne Office
        console.warn('Office.js not available - running in development mode');
        this.isInitialized = true;
        resolve();
        return;
      }

      Office.onReady((info) => {
        if (info.host === Office.HostType.Outlook) {
          this.isInitialized = true;
          // Detect if we're in compose mode
          this.composeMode = Office.context.mailbox.item?.itemType === Office.MailboxEnums.ItemType.Message && 
                            Office.context.mailbox.item?.itemClass === 'IPM.Note' &&
                            !Office.context.mailbox.item?.itemId; // No itemId means compose mode
          
          console.log('Office.js initialized successfully. Compose mode:', this.composeMode);
          resolve();
        } else {
          reject(new Error('Not running in Outlook'));
        }
      });
    });
  }

  async getCurrentEmailData(): Promise<OutlookEmailData> {
    if (!this.isInitialized) {
      throw new Error('Office.js not initialized');
    }

    return new Promise((resolve, reject) => {
      if (typeof Office === 'undefined') {
        // Development Fallback
        resolve({
          subject: 'Projektbesprechung für nächste Woche',
          sender: 'maria.mueller@example.com',
          content: 'Hallo James,\n\nIch hoffe, es geht dir gut. Ich wollte mich bezüglich der Projektbesprechung für nächste Woche bei dir melden. Könnten wir einen Termin für Dienstag oder Mittwoch vereinbaren?\n\nEs wäre wichtig, dass wir die aktuellen Fortschritte besprechen und die nächsten Schritte planen. Bitte lass mich wissen, welcher Tag dir besser passt.\n\nVielen Dank und beste Grüße,\nMaria',
          itemId: 'dev-item-id',
          conversationId: 'dev-conversation-id',
          messageClass: 'IPM.Note'
        });
        return;
      }

      Office.context.mailbox.item?.body.getAsync(
        Office.CoercionType.Text,
        (result) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            const emailData: OutlookEmailData = {
              subject: Office.context.mailbox.item?.subject || '',
              sender: Office.context.mailbox.item?.sender?.emailAddress || '',
              content: result.value || '',
              itemId: Office.context.mailbox.item?.itemId || '',
              conversationId: Office.context.mailbox.item?.conversationId || '',
              messageClass: Office.context.mailbox.item?.itemClass || ''
            };
            resolve(emailData);
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

    return new Promise((resolve) => {
      if (typeof Office === 'undefined') {
        // Development Fallback
        resolve({
          to: [],
          cc: [],
          subject: '',
          body: ''
        });
        return;
      }

      const item = Office.context.mailbox.item;
      if (item) {
        resolve({
          to: item.to?.map(recipient => recipient.emailAddress) || [],
          cc: item.cc?.map(recipient => recipient.emailAddress) || [],
          subject: item.subject || '',
          body: '' // Body wird separat geholt wenn nötig
        });
      } else {
        resolve({
          to: [],
          cc: [],
          subject: '',
          body: ''
        });
      }
    });
  }

  async insertComposeText(text: string, insertLocation: 'body' | 'signature' = 'body'): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Office.js not initialized');
    }

    return new Promise((resolve, reject) => {
      if (typeof Office === 'undefined') {
        // Development Fallback
        console.log('Would insert compose text at', insertLocation, ':', text);
        resolve();
        return;
      }

      const item = Office.context.mailbox.item;
      if (!item) {
        reject(new Error('No compose item available'));
        return;
      }

      if (insertLocation === 'body') {
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
      } else {
        // Signature insertion logic would go here
        resolve();
      }
    });
  }
  async insertReplyText(text: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Office.js not initialized');
    }

    return new Promise((resolve, reject) => {
      if (typeof Office === 'undefined') {
        // Development Fallback
        console.log('Would insert reply text:', text);
        resolve();
        return;
      }

      // Öffne das Antwort-Formular und füge Text ein
      Office.context.mailbox.item?.displayReplyAllForm({
        htmlBody: `<div>${text.replace(/\n/g, '<br>')}</div>`
      });
      
      resolve();
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
export type { OutlookEmailData, OutlookComposeData };