// src/services/outlookService.ts

// ------------------------------------------------------------------
// External functions for inserting text into body and ribbon handlers
// ------------------------------------------------------------------

/**
 * Inserts formatted text into the body of an Outlook message
 * @param text - The text to insert (as HTML)
 * @param isComposeMode - True if in compose mode, false in read mode
 * @returns Promise that resolves on success or rejects on error
 * 
 * @description
 * Distinguishes between:
 * - Compose mode: Inserts at cursor position
 * - Read mode: Inserts at beginning of message
 */
export async function insertTextIntoBody(
  text: string,
  isComposeMode: boolean
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const item = Office.context.mailbox.item as
      | Office.MessageRead
      | Office.MessageCompose;

    // Compose mode: Insert at cursor position
    if (isComposeMode && (item as Office.MessageCompose).body?.setSelectedDataAsync) {
      item.body.setSelectedDataAsync(
        text,
        { coercionType: Office.CoercionType.Html },
        (result) => result.status === Office.AsyncResultStatus.Succeeded
          ? resolve()
          : reject(result.error)
      );
    }
    // Read mode: Insert at beginning
    else if (!isComposeMode && (item as Office.MessageRead).body?.prependAsync) {
      (item as Office.MessageRead).body.prependAsync(
        text,
        { coercionType: Office.CoercionType.Html },
        (result) => result.status === Office.AsyncResultStatus.Succeeded
          ? resolve()
          : reject(result.error)
      );
    } else {
      reject(new Error("Required Body API not available"));
    }
  });
}

/**
 * Handler for the "Reply with MailAider" ribbon button
 * 
 * @description
 * Triggered when ribbon button is clicked and:
 * 1. Checks current mode (Compose/Read)
 * 2. Inserts predefined text
 * 3. Handles errors and returns control to Office
 */
Office.actions.associate("onReplyWithMailAider", async (event) => {
  try {
    const isCompose = outlookService.isComposeMode();
    await insertTextIntoBody("<p>Reply from MailAider ...</p>", isCompose);
  } catch (err) {
    console.error("Error replying with MailAider:", err);
  } finally {
    event.completed(); // Important for Office integration
  }
});

// ------------------------------------------------------------------
// OutlookService Interface & Implementation
// ------------------------------------------------------------------

/**
 * Interface for Outlook email data
 * 
 * @property subject - Message subject
 * @property sender - Sender information (Name <email>)
 * @property content - Cleaned message content
 * @property itemId - Unique message ID
 * @property conversationId - Conversation ID
 * @property messageClass - Message class (e.g. IPM.Note)
 */
interface OutlookEmailData {
  subject: string;
  sender: string;
  content: string;
  itemId: string;
  conversationId: string;
  messageClass: string;
}

/**
 * Interface for OutlookService
 * 
 * @description
 * Defines the public API for Outlook integration
 */
export interface OutlookService {
  initializeOffice(): Promise<void>;
  getCurrentEmailData(): Promise<OutlookEmailData>;
  onItemChanged(cb: (email: OutlookEmailData) => void): void;
  isOfficeInitialized(): boolean;
  isComposeMode(): boolean;
  insertComposeText(text: string): Promise<void>;
  insertReplyText(text: string): Promise<void>;
}

// Global promise for Office initialization
let officeResolve: () => void;
let officeReject: (err: unknown) => void;
const officeReady = new Promise<void>((resolve, reject) => {
  officeResolve = resolve;
  officeReject = reject;
});

// Initialize Office API when available
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

/**
 * Implementation of OutlookService
 * 
 * @class OutlookServiceImpl
 * @implements {OutlookService}
 * 
 * @description
 * Central class for Outlook integration with:
 * - Initialization logic
 * - Event handling
 * - Data extraction
 * - Content manipulation
 */
class OutlookServiceImpl implements OutlookService {
  private initialized = false;
  private composeMode = false;
  private itemChangedCb: ((email: OutlookEmailData) => void) | null = null;

  /**
   * Initializes the Office API
   * 
   * @description
   * 1. Waits for Office readiness
   * 2. Sets compose mode flag
   * 3. Registers ItemChanged handler
   */
  async initializeOffice(): Promise<void> {
    if (this.initialized) return;
    
    await officeReady;
    const item = Office.context.mailbox.item;

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

  /**
   * Extracts and cleans current email data
   * 
   * @returns Promise with processed email data
   * 
   * @description
   * 1. Gets raw data from Outlook item
   * 2. Cleans content (signatures, quotes)
   * 3. Formats sender information
   * 4. Returns structured data
   */
  async getCurrentEmailData(): Promise<OutlookEmailData> {
    await this.initializeOffice();
    const item = Office.context.mailbox.item;
    if (!item) throw new Error("No mail item available");

    return new Promise((resolve, reject) => {
      item.body.getAsync(Office.CoercionType.Text, (res) => {
        if (res.status !== Office.AsyncResultStatus.Succeeded) {
          return reject(new Error(res.error.message));
        }

        const rawContent = res.value || "";
        const emailData: OutlookEmailData = {
          subject: this.getSafeSubject(item),
          sender: this.getSenderInfo(item),
          content: this.cleanEmailContent(rawContent),
          itemId: this.getSafeItemId(item),
          conversationId: this.getSafeConversationId(item),
          messageClass: this.getSafeMessageClass(item)
        };

        resolve(emailData);
      });
    });
  }

  /**
   * Cleans email content of unwanted parts
   * 
   * @param content - Raw email content
   * @returns Cleaned content
   * 
   * @description Removes:
   * 1. Signatures (multilingual)
   * 2. Quoted text
   * 3. Forward markers
   * 4. Excessive empty lines
   */
  private cleanEmailContent(content: string): string {
    // Remove signatures
    const withoutSignature = content.split(
      /(--\s*$|Mit freundlichen Grüßen|Best regards|Kind regards|Cordialement|Saludos)/i
    )[0];

    // Remove quotes and metadata
    const withoutQuotes = withoutSignature
      .replace(/^>.*$/gm, '')
      .replace(/^-+.*Forwarded.*-+$/gim, '')
      .replace(/^From:.*$/gim, '');

    // Clean formatting
    return withoutQuotes
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  // Helper functions for safe property access with type checking
  private getSafeSubject(item: Office.Item): string {
    return "subject" in item && typeof item.subject === "string" 
      ? item.subject 
      : "";
  }

  private getSafeItemId(item: Office.Item): string {
    return "itemId" in item && typeof item.itemId === "string" 
      ? item.itemId 
      : "";
  }

  private getSafeConversationId(item: Office.Item): string {
    return "conversationId" in item && typeof item.conversationId === "string" 
      ? item.conversationId 
      : "";
  }

  private getSafeMessageClass(item: Office.Item): string {
    return "itemClass" in item && typeof item.itemClass === "string" 
      ? item.itemClass 
      : "";
  }

  /**
   * Extracts sender information with complete type checking
   * 
   * @param item - The Outlook item
   * @returns Formatted sender info (Name <email> or just email)
   */
  private getSenderInfo(item: Office.Item): string {
    // 1. Check if 'from' exists at all
    if (!("from" in item)) return "";
    
    // 2. Type narrowing for MessageRead
    const messageRead = item as Office.MessageRead;
    if (!messageRead.from) return "";
    
    // 3. Safe property access with optional chaining
    const displayName = messageRead.from.displayName?.trim();
    const emailAddress = messageRead.from.emailAddress?.trim();
    
    // 4. Format based on available data
    if (emailAddress) {
      return displayName 
        ? `${displayName} <${emailAddress}>` 
        : emailAddress;
    }
    
    return "";
  }

  /**
   * Inserts text in compose mode
   * 
   * @param text - Text to insert
   * @throws When not in compose mode
   */
  async insertComposeText(text: string): Promise<void> {
    await this.initializeOffice();
    if (!this.composeMode) throw new Error("Not in compose mode");

    const item = Office.context.mailbox.item as Office.MessageCompose;
    return new Promise((resolve, reject) => {
      item.body.setAsync(
        `<div>${text.replace(/\n/g, "<br>")}</div>`,
        { coercionType: Office.CoercionType.Html },
        (res) => res.status === Office.AsyncResultStatus.Succeeded
          ? resolve()
          : reject(res.error)
      );
    });
  }

  /**
   * Inserts text in reply mode
   * 
   * @param text - Text to insert
   * @throws When not in read mode
   */
  async insertReplyText(text: string): Promise<void> {
    await this.initializeOffice();
    if (this.composeMode) throw new Error("Not in reply mode");

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

// Singleton service instance
export const outlookService: OutlookService = new OutlookServiceImpl();