import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { outlookService } from "../services/outlookService";
import { aiService } from "../services/aiService";
import { useToast } from "../hooks/use-toast";
import { PROMPTS } from "../services/prompts";

export default function ComposeEditor() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCorrect = async () => {
    setLoading(true);
    const response = await aiService.processEmail({
      action: "custom",
      emailContent: input,
      customPrompt: PROMPTS.correct,
      settings: {
        tone: "neutral",
        greeting: "neutral",
        length: "mittel",
        language: "Deutsch"
      }
    });
    setLoading(false);
    if (response.success) {
      setInput(response.result);
      toast({ title: "Text korrigiert!" });
    } else {
      toast({ title: "Fehler", description: response.error, variant: "destructive" });
    }
  };

  const handleInsert = async () => {
    await outlookService.insertComposeText(input);
    toast({ title: "Text eingefügt" });
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Schreibe deinen Text hier..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
      />
      <div className="flex gap-2">
        <Button onClick={handleCorrect} disabled={loading}>
          {loading ? "KI korrigiert..." : "Korrektur mit KI"}
        </Button>
        <Button variant="secondary" onClick={handleInsert}>
          In E-Mail einfügen
        </Button>
      </div>
    </div>
  );
}
