// src/services/outlookService.ts
// Vereinheitlichte, robuste Office-Initialisierung + E-Mail-Zugriff
// ---------------------------------------------------------------------
// Dieses Modul exportiert eine Singleton-Instanz (outlookService) mit
//  - initializeOffice()  -> Promise, erfüllt sich genau EIN Mal
//  - getCurrentEmailData() -> Betreff, Sender, Body (Text)
//  - onItemChanged(cb)  -> löst aus, wenn der User die Mail wechselt
//  - insertComposeText() -> Text / HTML in neue Mail einsetzen (Compose-Modus)

/* ------------------------------------------------------------------ */
// Typdefinitionen
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
  insertComposeText(text: string): Promise<void>; // Compose-Modus-Helper
}

/* ------------------------------------------------------------------ */
// Zentraler Promise – wird beim ersten Laden des Moduls angelegt
let resolveReady: (() => void) | null = null;
let rejectReady: ((err: unknown) => void) | null = null;
const officeReadyPromise: Promise<void> = new Promise<void>((resolve, reject) => {
  resolveReady = resolve;
  rejectReady = reject;
});

// Globales Office.initialize muss gesetzt sein, bevor Outlook die Runtime lädt.
if (typeof Office !== "undefined") {
  Office.initialize = () => {
    Office.onReady((info) => {
      if (info.host === Office.HostType.Outlook) {
        console.log("[Office] ready - Host Outlook");
        if (resolveReady) resolveReady();
      } else {
        if (rejectReady) rejectReady(new Error("Unsupported host: " + info.host));
      }
    });
  };
}

/* ------------------------------------------------------------------ */
class OutlookServiceImpl implements OutlookService {
  private composeMode = false;
  private itemChangedCb: ((email: OutlookEmailData) => void) | null = null;
  private initialized = false;

  async initializeOffice(): Promise<void> {
    if (this.initialized) return;

    await officeReadyPromise;

    // Compose-Modus bestimmen, wenn ein Item existiert
    const item = Office.context.mailbox?.item as
      | Office.MessageRead
      | Office.MessageCompose
      | undefined;

    if (item) {
      this.composeMode =
        (item as Office.MessageCompose).body?.setAsync !== undefined;
    }

    // Ereignis registrieren (nur einmal)
    Office.context.mailbox?.addHandlerAsync(
      Office.EventType.ItemChanged,
      async () => {
        const email = await this.getCurrentEmailData();
        if (this.itemChangedCb) {
          this.itemChangedCb(email);
        }
      },
      {},
      () => undefined
    );

    this.initialized = true;
  }

  /* -------------------------------------------------- */
  isOfficeInitialized(): boolean {
    return this.initialized;
  }

  isComposeMode(): boolean {
    return this.composeMode;
  }

  onItemChanged(cb: (email: OutlookEmailData) => void): void {
    this.itemChangedCb = cb;
  }

  /* -------------------------------------------------- */
  async getCurrentEmailData(): Promise<OutlookEmailData> {
    await this.initializeOffice();

    const item = Office.context.mailbox?.item as Office.MessageRead | undefined;
    if (!item) throw new Error("Kein Mail-Item verfügbar (Home-Pane?)");

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
          reject(new Error("Mail lesen fehlgeschlagen: " + res.error.message));
        }
      });
    });
  }

  /* -------------------------------------------------- */
  async insertComposeText(text: string): Promise<void> {
    await this.initializeOffice();

    if (!this.composeMode) throw new Error("Nicht im Compose-Modus");

    const item = Office.context.mailbox.item as Office.MessageCompose;
    return new Promise((resolve, reject) => {
      item.body.setAsync(
        `<div>${text.replace(/\n/g, "<br>")}</div>`,
        { coercionType: Office.CoercionType.Html },
        (res) => {
          if (res.status === Office.AsyncResultStatus.Succeeded) {
            resolve();
          } else {
            reject(res.error);
          }
        }
      );
    });
  }
}

/* ------------------------------------------------------------------ */
export const outlookService: OutlookService = new OutlookServiceImpl();