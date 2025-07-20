import { useState, useEffect } from "react";

// E-Mail Datenstruktur
interface EmailData {
  subject: string;
  sender: string;
  content: string;
  summary: string;
}

// Compose-Datenstruktur
interface ComposeData {
  to: string[];
  cc: string[];
  subject: string;
  purpose: string;
}

export function useOfficeInitialization() {
  const [isComposeMode, setIsComposeMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  const [emailData, setEmailData] = useState<EmailData>({
    subject: "",
    sender: "",
    content: "",
    summary: "",
  });

  const [composeData, setComposeData] = useState<ComposeData>({
    to: [],
    cc: [],
    subject: "",
    purpose: "",
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        // Warte bis Office.js verfügbar ist
        await new Promise<void>((resolve) => {
          if (typeof window.Office !== "undefined" && window.Office.context) {
            resolve();
          } else {
            window.Office?.onReady?.(() => resolve());
          }
        });

        const Office = window.Office;
        const item = Office.context?.mailbox?.item;
        console.log("📬 Mailbox item:", item); // ✅ Debug-Ausgabe

        if (!item) throw new Error("Kein Mail-Item gefunden");

        const itemType = item.itemType;

        // ✅ Sicherer Check für Compose-Modus (auch Mac-kompatibel)
        const composeMode =
          itemType === Office.MailboxEnums.ItemType.Message &&
          typeof item.body?.setAsync === "function";

        setIsComposeMode(composeMode);
        setIsConnected(true);

        if (composeMode) {
          // 📨 Compose-Modus: Empfänger & Betreff auslesen
          const toRecipients: string[] = await new Promise((resolve) => {
            (item.to as Office.Recipients).getAsync(
              (res: Office.AsyncResult<Office.EmailAddressDetails[]>) => {
                if (res.status === Office.AsyncResultStatus.Succeeded) {
                  resolve(res.value.map((r) => r.emailAddress));
                } else {
                  resolve([]);
                }
              }
            );
          });

          const ccRecipients: string[] = await new Promise((resolve) => {
            (item.cc as Office.Recipients).getAsync(
              (res: Office.AsyncResult<Office.EmailAddressDetails[]>) => {
                if (res.status === Office.AsyncResultStatus.Succeeded) {
                  resolve(res.value.map((r) => r.emailAddress));
                } else {
                  resolve([]);
                }
              }
            );
          });

          setComposeData({
            to: toRecipients,
            cc: ccRecipients,
            subject: item.subject || "",
            purpose: "Neue E-Mail verfassen",
          });
        } else {
          // 📖 Lese-Modus: Inhalte auslesen
          const subject = item.subject || "";
          const sender = item.sender?.emailAddress || "";

          const content = await new Promise<string>((resolve, reject) => {
            item.body.getAsync(Office.CoercionType.Text, (res) => {
              if (res.status === Office.AsyncResultStatus.Succeeded) {
                resolve(res.value);
              } else {
                reject("Konnte E-Mail-Inhalt nicht laden");
              }
            });
          });

          setEmailData({
            subject,
            sender,
            content,
            summary: "",
          });
        }
      } catch (error) {
        console.error("Office Initialization Error:", error);

        // 🔁 Fallback für Entwicklung ohne Outlook
        if (process.env.NODE_ENV === "development") {
          console.warn("Fallback auf Testdaten (Entwicklung)");
          setIsComposeMode(true);
          setIsConnected(true);
          setComposeData({
            to: ["dev@example.com"],
            cc: [],
            subject: "Test Compose Subject",
            purpose: "Testmail schreiben",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return {
    isConnected,
    isComposeMode,
    isLoading,
    emailData,
    composeData,
    setEmailData,
    setComposeData,
  };
}
