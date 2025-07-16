// src/services/outlookService.ts

// --------------------------------------------------
// 🔁 Text in Outlook-E-Mail einfügen (HTML)
// --------------------------------------------------

export async function insertTextIntoBody(text: string, isComposeMode: boolean): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const item = Office.context.mailbox.item as Office.MessageRead | Office.MessageCompose;

    if (isComposeMode && (item as Office.MessageCompose).body?.setSelectedDataAsync) {
      item.body.setSelectedDataAsync(
        text,
        { coercionType: Office.CoercionType.Html },
        (result) => result.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(result.error)
      );
    } else if (!isComposeMode && (item as Office.MessageRead).body?.prependAsync) {
      (item as Office.MessageRead).body.prependAsync(
        text,
        { coercionType: Office.CoercionType.Html },
        (result) => result.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(result.error)
      );
    } else {
      reject(new Error("Required Body API not available"));
    }
  });
}

// --------------------------------------------------
// 📨 Ribbon-Button-Handler (z.B. „Antworten mit MailAider“)
// --------------------------------------------------

Office.actions.associate("onReplyWithMailAider", async (event) => {
  try {
    const isCompose = outlookService.isComposeMode();
    await insertTextIntoBody("<p>Reply from MailAider ...</p>", isCompose);
  } catch (err) {
    console.error("Fehler beim Antworten:", err);
  } finally {
    event.completed();
  }
});

// --------------------------------------------------
// 📬 OutlookService-Interface & Typen
// --------------------------------------------------

export interface OutlookEmailData {
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

// --------------------------------------------------
// 🚀 Initialisierung: Office.js bereitstellen
// --------------------------------------------------

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
        officeReject(new Error(`Unsupported host: ${info.host}`));
      }
    });
  };
}

// --------------------------------------------------
// 🧠 OutlookService-Implementierung
// --------------------------------------------------

class OutlookServiceImpl implements OutlookService {
  private initialized = false;
  private composeMode = false;
  private itemChangedCb: ((email: OutlookEmailData) => void) | null = null;

  async initializeOffice(): Promise<void> {
    if (this.initialized) return;

    await officeReady;
    const item = Office.context.mailbox.item;
    this.composeMode = !!item && !!(item as Office.MessageCompose).body?.setAsync;

    Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, async () => {
      if (this.itemChangedCb) {
        this.itemChangedCb(await this.getCurrentEmailData());
      }
    });

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

  // --------------------------------------------------
  // 📥 Hauptfunktion: Betreff, Absender, Inhalt extrahieren
  // --------------------------------------------------

  async getCurrentEmailData(): Promise<OutlookEmailData> {
    await this.initializeOffice();
    const item = Office.context.mailbox.item;
    if (!item) throw new Error("Kein E-Mail-Element verfügbar");

    const content = await new Promise<string>((resolve) => {
      try {
        item.body.getAsync(Office.CoercionType.Text, (res) => {
          if (res.status === Office.AsyncResultStatus.Succeeded) {
            resolve(res.value || "");
          } else {
            console.warn("Body konnte nicht gelesen werden:", res.error?.message);
            resolve(""); // Fallback: leerer Inhalt
          }
        });
      } catch (err) {
        console.error("Fehler bei getAsync:", err);
        resolve("");
      }
    });

    return {
      subject: this.getSafeSubject(item),
      sender: this.getSenderInfo(item),
      content: this.cleanEmailContent(content),
      itemId: this.getSafeItemId(item),
      conversationId: this.getSafeConversationId(item),
      messageClass: this.getSafeMessageClass(item),
    };
  }

  // --------------------------------------------------
  // 🧹 Inhalt bereinigen (Signaturen, Weiterleitungen etc.)
  // --------------------------------------------------

  private cleanEmailContent(content: string): string {
    const withoutSignature = content.split(
      /(--\s*$|Mit freundlichen Grüßen|Best regards|Kind regards|Cordialement|Saludos)/i
    )[0];

    const withoutQuotes = withoutSignature
      .replace(/^>.*$/gm, '')
      .replace(/^-+.*Forwarded.*-+$/gim, '')
      .replace(/^From:.*$/gim, '');

    return withoutQuotes.replace(/\n\s*\n/g, '\n\n').trim();
  }

  // --------------------------------------------------
  // 🧾 Hilfsfunktionen: Felder sicher auslesen
  // --------------------------------------------------

  private getSafeSubject(item: Office.Item): string {
    return "subject" in item && typeof item.subject === "string" ? item.subject : "";
  }

  private getSafeItemId(item: Office.Item): string {
    return "itemId" in item && typeof item.itemId === "string" ? item.itemId : "";
  }

  private getSafeConversationId(item: Office.Item): string {
    return "conversationId" in item && typeof item.conversationId === "string" ? item.conversationId : "";
  }

  private getSafeMessageClass(item: Office.Item): string {
    return "itemClass" in item && typeof item.itemClass === "string" ? item.itemClass : "";
  }

  private getSenderInfo(item: Office.Item): string {
    if (!("from" in item)) return "Unbekannter Absender";

    const messageRead = item as Office.MessageRead;
    const displayName = messageRead.from?.displayName?.trim();
    const emailAddress = messageRead.from?.emailAddress?.trim();

    return emailAddress
      ? displayName
        ? `${displayName} <${emailAddress}>`
        : emailAddress
      : "Unbekannter Absender";
  }

  // --------------------------------------------------
  // ✍️ Text in Compose oder Reply einfügen
  // --------------------------------------------------

  async insertComposeText(text: string): Promise<void> {
    await this.initializeOffice();
    if (!this.composeMode) throw new Error("Nicht im Compose-Modus");

    const item = Office.context.mailbox.item as Office.MessageCompose;
    return new Promise((resolve, reject) => {
      item.body.setAsync(
        `<div>${text.replace(/\n/g, "<br>")}</div>`,
        { coercionType: Office.CoercionType.Html },
        (res) => res.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(res.error)
      );
    });
  }

  async insertReplyText(text: string): Promise<void> {
    await this.initializeOffice();
    if (this.composeMode) throw new Error("Nicht im Lese-Modus");

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

// Exportiere die Instanz als Singleton
export const outlookService: OutlookService = new OutlookServiceImpl();
