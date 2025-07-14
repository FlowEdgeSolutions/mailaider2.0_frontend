import { useState, useEffect } from "react";

interface EmailData {
  subject: string;
  sender: string;
  content: string;
  summary: string;
}

interface ComposeData {
  to: string[];
  cc: string[];
  subject: string;
  purpose: string;
}

export function useOfficeInitialization() {
  const [isComposeMode, setIsComposeMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

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
        // Warten bis Office.js bereit ist
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

        const composeMode =
          itemType === Office.MailboxEnums.ItemType.Message &&
          !Object.prototype.hasOwnProperty.call(item, "itemId");

        setIsComposeMode(composeMode);
        setIsConnected(true);

        if (composeMode) {
          // Compose Mode – Empfänger und Betreff
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
          // Read Mode – Inhalt auslesen
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
