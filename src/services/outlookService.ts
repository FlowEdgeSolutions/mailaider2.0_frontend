// src/services/outlookService.ts
// Saubere, kompakte Fassung – keine doppelten Zeilen, erfüllt Interface vollständig
// ----------------------------------------------------------------------------
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

/* ------------------------------------------------------------------ */
let officeResolve: () => void;
let officeReject: (err: unknown) => void;
const officeReady = new Promise<void>((resolve, reject) => {
  officeResolve = resolve;
  officeReject = reject;
});

if (typeof Office !== "undefined") {
  Office.initialize = () => {
    Office.onReady((info) => {
      if (info.host === Office.HostType.Outlook) {
        officeResolve();
      } else {
        officeReject(new Error("Unsupported host: " + info.host));
      }
    });
  };
}

/* ------------------------------------------------------------------ */
class OutlookServiceImpl implements OutlookService {
  private initialized = false;
  private composeMode = false;
  private itemChangedCb: ((email: OutlookEmailData) => void) | null = null;

  /* 1. Initialisierung */
  async initializeOffice(): Promise<void> {
    if (this.initialized) return;

    await officeReady; // wartet auf Office

    const item = Office.context.mailbox.item as
      | Office.MessageRead
      | Office.MessageCompose
      | undefined;

    if (item && (item as Office.MessageCompose).body?.setAsync) {
      this.composeMode = true;
    }

    Office.context.mailbox.addHandlerAsync(
      Office.EventType.ItemChanged,
      async () => {
        if (this.itemChangedCb) {
          const email = await this.getCurrentEmailData();
          this.itemChangedCb(email);
        }
      }
    );

    this.initialized = true;
  }

  /* 2. Getter */
  isOfficeInitialized(): boolean {
    return this.initialized;
  }

  isComposeMode(): boolean {
    return this.composeMode;
  }

  onItemChanged(cb: (email: OutlookEmailData) => void) {
    this.itemChangedCb = cb;
  }

  /* 3. Daten aus geöffneter Mail */
  async getCurrentEmailData(): Promise<OutlookEmailData> {
    await this.initializeOffice();

    const item = Office.context.mailbox.item as Office.MessageRead;
    if (!item) throw new Error("Kein Mail-Item verfügbar");

    return new Promise((resolve, reject) => {
      item.body.getAsync(Office.CoercionType.Text, (res) => {
        if (res.status === Office.AsyncResultStatus.Succeeded) {
          resolve({
            subject: item.subject ?? "",
            sender: item.from?.displayName || item.from?.emailAddress || "",
            content: res.value ?? "",
            itemId: item.itemId ?? "",
            conversationId: item.conversationId ?? "",
            messageClass: item.itemClass ?? "",
          });
        } else {
          reject(new Error(res.error.message));
        }
      });
    });
  }

  /* 4. Compose-Modus */
  async insertComposeText(text: string): Promise<void> {
    await this.initializeOffice();
    if (!this.composeMode) throw new Error("Nicht im Compose-Modus");

    const item = Office.context.mailbox.item as Office.MessageCompose;
    return new Promise((resolve, reject) => {
      item.body.setAsync(
        `<div>${text.replace(/\n/g, "<br>")}</div>`,
        { coercionType: Office.CoercionType.Html },
        (res) =>
          res.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(res.error)
      );
    });
  }

  /* 5. Reply-Modus */
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
