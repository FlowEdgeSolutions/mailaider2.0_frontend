// src/services/outlookService.ts

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
  onItemChanged(callback: (email: OutlookEmailData) => void): void;
  isOfficeInitialized(): boolean;
  isComposeMode(): boolean;

  // 🆕 Methode zum Einfügen von Text im Compose-Modus
  insertComposeText(text: string): Promise<void>;
}

class OutlookServiceImpl implements OutlookService {
  private isInitialized = false;
  private composeMode = false;
  private itemChangedCallback: ((email: OutlookEmailData) => void) | null = null;

  /** Initialisiert Office.js und registriert ItemChanged-Handler */
  async initializeOffice(): Promise<void> {
    if (this.isInitialized) return;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject("Office.js Init Timeout"), 10000);

      Office.onReady((info) => {
        clearTimeout(timeout);

        if (info.host !== Office.HostType.Outlook) {
          return reject("Kein Outlook-Host");
        }

        this.isInitialized = true;

        const item = Office.context.mailbox.item!;
        console.log("📬 Mailbox item:", item); // ✅ Debug-Ausgabe

        // 🧪 Compose-Modus zuverlässig erkennen
        this.composeMode =
          item.itemType === Office.MailboxEnums.ItemType.Message &&
          typeof item.body?.setAsync === "function";

        // 📬 Event-Handler für Item-Wechsel registrieren
        Office.context.mailbox.addHandlerAsync(
          Office.EventType.ItemChanged,
          async () => {
            const email = await this.getCurrentEmailData();
            this.itemChangedCallback?.(email);
          },
          {},
          () => {}
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

  onItemChanged(callback: (email: OutlookEmailData) => void): void {
    this.itemChangedCallback = callback;
  }

  /** Liest Daten aus der aktuell geöffneten E-Mail */
  async getCurrentEmailData(): Promise<OutlookEmailData> {
    if (!this.isInitialized) await this.initializeOffice();

    const item = Office.context.mailbox.item!;
    return new Promise((resolve, reject) => {
      item.body.getAsync(Office.CoercionType.Text, (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve({
            subject: item.subject || "",
            sender: item.sender?.emailAddress || "",
            content: result.value || "",
            itemId: item.itemId || "",
            conversationId: item.conversationId || "",
            messageClass: item.itemClass || "",
          });
        } else {
          reject("Mail lesen fehlgeschlagen");
        }
      });
    });
  }

  /** Fügt Text in das Compose-Feld (neue E-Mail) ein */
  async insertComposeText(text: string): Promise<void> {
    if (!this.isInitialized) await this.initializeOffice();

    if (typeof Office === "undefined") {
      console.log("🛠️ DEV: Compose-Text würde eingefügt:", text);
      return;
    }

    const item = Office.context.mailbox.item!;
    return new Promise((resolve, reject) => {
      item.body.setAsync(
        `<div>${text.replace(/\n/g, "<br>")}</div>`,
        { coercionType: Office.CoercionType.Html },
        (result) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve();
          } else {
            reject(new Error("Fehler beim Einfügen in Compose-Feld"));
          }
        }
      );
    });
  }
}

// Export der Singleton-Instanz
export const outlookService: OutlookService = new OutlookServiceImpl();
