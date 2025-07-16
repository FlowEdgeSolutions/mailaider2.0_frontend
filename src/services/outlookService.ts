// src/services/outlookService.ts

// ------------------------------------------------------------------
// Externe Funktionen für Einfügen von Text ins Body und Ribbon-Handler
// ------------------------------------------------------------------

export async function insertTextIntoBody(text: string, isComposeMode: boolean): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const item = Office.context.mailbox.item as
      | Office.MessageRead
      | Office.MessageCompose;
      
    if (isComposeMode && (item as Office.MessageCompose).body?.setSelectedDataAsync) {
      item.body.setSelectedDataAsync(
        text,
        { coercionType: Office.CoercionType.Html },
        result => result.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(result.error)
      );
    } else if (!isComposeMode && (item as Office.MessageRead).body?.prependAsync) {
      (item as Office.MessageRead).body.prependAsync(
        text,
        { coercionType: Office.CoercionType.Html },
        result => result.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(result.error)
      );
    } else {
      reject(new Error("Body-API nicht verfügbar"));
    }
  });
}

// Ribbon-Button Handler
Office.actions.associate("onReplyWithMailAider", async event => {
  // Hier Ihre Logik: z.B. Text generieren und einfügen
  try {
    const isCompose = outlookService.isComposeMode();
    await insertTextIntoBody("<p>Antwort von MailAider …</p>", isCompose);
  } catch (err) {
    console.error(err);
  } finally {
    event.completed();
  }
});

// ------------------------------------------------------------------
// OutlookService Interface & Implementierung
// ------------------------------------------------------------------

interface OutlookEmailData {
  subject: string;
  sender: string;
  content: string;
  itemId: string;
  conversationId: string;
  messageClass: string;
}

export interface OutlookService {
  initializeOffice(): Promise<void>;
  getCurrentEmailData(): Promise<OutlookEmailData>;
  onItemChanged(cb: (email: OutlookEmailData) => void): void;
  isOfficeInitialized(): boolean;
  isComposeMode(): boolean;
  insertComposeText(text: string): Promise<void>;
  insertReplyText(text: string): Promise<void>;
}

// Promise für Office-Initialisierung
let officeResolve: () => void;
let officeReject: (err: unknown) => void;
const officeReady = new Promise<void>((resolve, reject) => {
  officeResolve = resolve;
  officeReject = reject;
});

if (typeof Office !== "undefined") {
  Office.initialize = () => {
    Office.onReady(info => {
      if (info.host === Office.HostType.Outlook) {
        officeResolve();
      } else {
        officeReject(new Error("Unsupported host: " + info.host));
      }
    });
  };
}

class OutlookServiceImpl implements OutlookService {
  private initialized = false;
  private composeMode = false;
  private itemChangedCb: ((email: OutlookEmailData) => void) | null = null;

  async initializeOffice(): Promise<void> {
    if (this.initialized) return;
    await officeReady;

    const item = Office.context.mailbox.item as
      | Office.MessageRead
      | Office.MessageCompose
      | undefined;

    this.composeMode = !!item && !!(item as Office.MessageCompose).body?.setAsync;

    Office.context.mailbox.addHandlerAsync(
      Office.EventType.ItemChanged,
      async () => {
        if (this.itemChangedCb) {
          this.itemChangedCb(await this.getCurrentEmailData());
        }
      }
    );

    this.initialized = true;
  }

  isOfficeInitialized(): boolean {
    return this.initialized;
  }

  isComposeMode(): boolean {
    return this.composeMode;
  }

  onItemChanged(cb: (email: OutlookEmailData) => void): void {
    this.itemChangedCb = cb;
  }

  async getCurrentEmailData(): Promise<OutlookEmailData> {
    await this.initializeOffice();

    const item = Office.context.mailbox.item as Office.MessageRead;
    if (!item) throw new Error("Kein Mail-Item verfügbar");

    return new Promise((resolve, reject) => {
      item.body.getAsync(
        Office.CoercionType.Text,
        res => {
          if (res.status === Office.AsyncResultStatus.Succeeded) {
            resolve({
              subject: item.subject || "",
              sender: item.from?.displayName || item.from?.emailAddress || "",
              content: res.value || "",
              itemId: item.itemId || "",
              conversationId: item.conversationId || "",
              messageClass: item.itemClass || "",
            });
          } else {
            reject(new Error(res.error.message));
          }
        }
      );
    });
  }

  async insertComposeText(text: string): Promise<void> {
    await this.initializeOffice();
    if (!this.composeMode) throw new Error("Nicht im Compose-Modus");

    const item = Office.context.mailbox.item as Office.MessageCompose;
    return new Promise((resolve, reject) => {
      item.body.setAsync(
        `<div>${text.replace(/\n/g, "<br>")}</div>`,
        { coercionType: Office.CoercionType.Html },
        res => (res.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(res.error))
      );
    });
  }

  async insertReplyText(text: string): Promise<void> {
    await this.initializeOffice();
    if (this.composeMode) throw new Error("Nicht im Read-Reply-Modus");

    const item = Office.context.mailbox.item as Office.MessageRead;
    return new Promise((resolve, reject) => {
      try {
        item.displayReplyForm(text);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const outlookService: OutlookService = new OutlookServiceImpl();
