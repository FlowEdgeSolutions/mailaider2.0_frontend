// Outlook Office.js Service
interface OutlookEmailData {
  subject: string;
  sender: string;
  content: string;
  itemId: string;
  conversationId: string;
  messageClass: string;
}

interface OutlookService {
  initializeOffice(): Promise<void>;
  getCurrentEmailData(): Promise<OutlookEmailData>;
  insertReplyText(text: string): Promise<void>;
  isOfficeInitialized(): boolean;
}

class OutlookServiceImpl implements OutlookService {
  private isInitialized = false;

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
          console.log('Office.js initialized successfully');
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
}

export const outlookService = new OutlookServiceImpl();
export type { OutlookEmailData };