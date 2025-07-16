// src/services/outlookService.ts

// ------------------------------------------------------------------
// Externe Funktionen für Einfügen von Text ins Body und Ribbon-Handler
// ------------------------------------------------------------------

/**
 * Fügt Text in den Body einer Outlook-Nachricht ein (je nach Modus unterschiedlich)
 * @param text Der einzufügende Text (als HTML)
 * @param isComposeMode Gibt an, ob sich die Nachricht im Bearbeitungsmodus befindet
 * @returns Promise, das erfolgreich ist, wenn der Text eingefügt wurde
 */
export async function insertTextIntoBody(text: string, isComposeMode: boolean): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // Holt das aktuelle Mail-Item aus dem Outlook-Kontext
    const item = Office.context.mailbox.item as
      | Office.MessageRead
      | Office.MessageCompose;
      
    // Im Bearbeitungsmodus: Text an aktueller Cursorposition einfügen
    if (isComposeMode && (item as Office.MessageCompose).body?.setSelectedDataAsync) {
      item.body.setSelectedDataAsync(
        text,
        { coercionType: Office.CoercionType.Html }, // Gibt an, dass der Text HTML ist
        result => result.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(result.error)
      );
    } 
    // Im Lesemodus: Text am Anfang der Nachricht einfügen
    else if (!isComposeMode && (item as Office.MessageRead).body?.prependAsync) {
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

/**
 * Handler für den Ribbon-Button "Reply with MailAider"
 * Wird aufgerufen, wenn der Benutzer den Button im Outlook-Ribbon klickt
 */
Office.actions.associate("onReplyWithMailAider", async event => {
  try {
    // Prüft, ob wir uns im Bearbeitungsmodus befinden
    const isCompose = outlookService.isComposeMode();
    // Fügt vordefinierten Text in die Nachricht ein
    await insertTextIntoBody("<p>Antwort von MailAider …</p>", isCompose);
  } catch (err) {
    console.error(err);
  } finally {
    // Wichtig: Muss immer aufgerufen werden, um dem Office-System mitzuteilen,
    // dass die Aktion abgeschlossen ist
    event.completed();
  }
});

// ------------------------------------------------------------------
// OutlookService Interface & Implementierung
// ------------------------------------------------------------------

/**
 * Interface für die Daten einer Outlook-Email
 */
interface OutlookEmailData {
  subject: string;         // Betreff der Nachricht
  sender: string;          // Absender (Name oder Email)
  content: string;         // Inhalt der Nachricht
  itemId: string;          // Eindeutige ID der Nachricht
  conversationId: string;  // ID der Konversation
  messageClass: string;    // Nachrichtenklasse (z.B. IPM.Note)
}

/**
 * Interface für den OutlookService
 * Definiert die öffentliche API für die Interaktion mit Outlook
 */
export interface OutlookService {
  initializeOffice(): Promise<void>;                   // Initialisiert die Office-API
  getCurrentEmailData(): Promise<OutlookEmailData>;    // Holt Daten der aktuellen Email
  onItemChanged(cb: (email: OutlookEmailData) => void): void; // Callback bei Email-Wechsel
  isOfficeInitialized(): boolean;                     // Prüft Initialisierung
  isComposeMode(): boolean;                           // Prüft Bearbeitungsmodus
  insertComposeText(text: string): Promise<void>;      // Fügt Text im Bearbeitungsmodus ein
  insertReplyText(text: string): Promise<void>;        // Fügt Text im Antwortmodus ein
}

// Promise für Office-Initialisierung
let officeResolve: () => void;
let officeReject: (err: unknown) => void;
const officeReady = new Promise<void>((resolve, reject) => {
  officeResolve = resolve;
  officeReject = reject;
});

// Initialisiert die Office-API, wenn sie verfügbar ist
if (typeof Office !== "undefined") {
  Office.initialize = () => {
    Office.onReady(info => {
      // Prüft, ob wir in Outlook sind
      if (info.host === Office.HostType.Outlook) {
        officeResolve();
      } else {
        officeReject(new Error("Unsupported host: " + info.host));
      }
    });
  };
}

/**
 * Implementierung des OutlookService
 */
class OutlookServiceImpl implements OutlookService {
  private initialized = false;          // Speichert den Initialisierungsstatus
  private composeMode = false;          // Gibt an, ob wir im Bearbeitungsmodus sind
  private itemChangedCb: ((email: OutlookEmailData) => void) | null = null; // Callback für Email-Wechsel

  /**
   * Initialisiert die Office-API
   */
  async initializeOffice(): Promise<void> {
    if (this.initialized) return;
    await officeReady; // Wartet auf die Office-Initialisierung

    const item = Office.context.mailbox.item as
      | Office.MessageRead
      | Office.MessageCompose
      | undefined;

    // Prüft, ob wir im Bearbeitungsmodus sind
    this.composeMode = !!item && !!(item as Office.MessageCompose).body?.setAsync;

    // Registriert einen Handler für Email-Wechsel
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

  /**
   * Setzt einen Callback, der bei Email-Wechsel aufgerufen wird
   * @param cb Callback-Funktion
   */
  onItemChanged(cb: (email: OutlookEmailData) => void): void {
    this.itemChangedCb = cb;
  }

  /**
   * Holt die Daten der aktuell angezeigten Email
   */
  async getCurrentEmailData(): Promise<OutlookEmailData> {
    await this.initializeOffice();

    const item = Office.context.mailbox.item as Office.MessageRead;
    if (!item) throw new Error("Kein Mail-Item verfügbar");

    return new Promise((resolve, reject) => {
      // Holt den Nachrichteninhalt als Text
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

  /**
   * Fügt Text in eine neue Nachricht ein (Bearbeitungsmodus)
   * @param text Der einzufügende Text
   */
  async insertComposeText(text: string): Promise<void> {
    await this.initializeOffice();
    if (!this.composeMode) throw new Error("Nicht im Compose-Modus");

    const item = Office.context.mailbox.item as Office.MessageCompose;
    return new Promise((resolve, reject) => {
      // Ersetzt Zeilenumbrüche durch <br> und setzt den gesamten Text
      item.body.setAsync(
        `<div>${text.replace(/\n/g, "<br>")}</div>`,
        { coercionType: Office.CoercionType.Html },
        res => (res.status === Office.AsyncResultStatus.Succeeded ? resolve() : reject(res.error))
      );
    });
  }

  /**
   * Fügt Text in eine Antwort ein (Antwortmodus)
   * @param text Der einzufügende Text
   */
  async insertReplyText(text: string): Promise<void> {
    await this.initializeOffice();
    if (this.composeMode) throw new Error("Nicht im Read-Reply-Modus");

    const item = Office.context.mailbox.item as Office.MessageRead;
    return new Promise((resolve, reject) => {
      try {
        // Zeigt das Antwortformular mit dem vorgegebenen Text an
        item.displayReplyForm(text);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

// Exportiert eine Singleton-Instanz des OutlookService
export const outlookService: OutlookService = new OutlookServiceImpl();