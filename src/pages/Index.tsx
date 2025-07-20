import { useEffect, useState } from "react";
import ComposeEditor from "@/components/ComposeEditor";
import { MailAiderApp } from "@/components/MailAiderApp";
import { ModernLoading } from "@/components/ModernLoading";
import { outlookService } from "@/services/outlookService";
import { OutlookEmailData } from "@/services/outlookService";

const Index = () => {
  const [initialized, setInitialized] = useState(false);
  const [composeMode, setComposeMode] = useState(false);
  const [emailData, setEmailData] = useState<OutlookEmailData>({
    subject: "",
    sender: "",
    content: "",
    itemId: "",
    conversationId: "",
    messageClass: "",
  });

  useEffect(() => {
    async function init() {
      await outlookService.initializeOffice();
      const isCompose = outlookService.isComposeMode();
      setComposeMode(isCompose);

      if (!isCompose) {
        const data = await outlookService.getCurrentEmailData();
        setEmailData(data);
      }

      setInitialized(true);
    }
    init();
  }, []);

  if (!initialized) {
    return <ModernLoading stage="thinking" message="Outlook wird initialisiert..." />;
  }

  return composeMode ? <ComposeEditor /> : <MailAiderApp emailData={emailData} />;
};

export default Index;
