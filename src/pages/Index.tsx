import { useEffect, useState } from "react";
import ComposeEditor from "@/components/ComposeEditor";
import { EmailViewer } from "@/components/EmailViewer";
import { ModernLoading } from "@/components/ModernLoading";
import { outlookService } from "@/services/outlookService";

const Index = () => {
  const [initialized, setInitialized] = useState(false);
  const [composeMode, setComposeMode] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: "",
    sender: "",
    content: "",
    summary: ""
  });
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await outlookService.initializeOffice();
      const isCompose = outlookService.isComposeMode();
      setComposeMode(isCompose);

      if (!isCompose) {
        const data = await outlookService.getCurrentEmailData();
        setEmailData({ ...data, summary: "" });
      }

      setInitialized(true);
      setLoading(false);
    }
    init();
  }, []);

  if (!initialized) {
    return <ModernLoading stage="processing" message="Outlook wird initialisiert..." />;
  }

  return composeMode ? (
    <ComposeEditor />
  ) : (
    <EmailViewer
      emailData={emailData}
      showSummary={showSummary}
      onToggleSummary={() => setShowSummary((s) => !s)}
      isLoading={loading}
    />
  );
};

export default Index;
