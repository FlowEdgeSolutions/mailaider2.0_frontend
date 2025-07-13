import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { outlookService } from "@/services/outlookService";

interface DebugInfoProps {
  isConnected: boolean;
  isComposeMode: boolean;
  isLoading: boolean;
}

export function DebugInfo({ isConnected, isComposeMode, isLoading }: DebugInfoProps) {
  const isDevelopment = import.meta.env.DEV;
  
  if (!isDevelopment) return null;

  return (
    <Card className="mb-4 border-dashed border-2 border-muted-foreground/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">🔧 Debug Info (Entwicklung)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "✅ Verbunden" : "❌ Nicht verbunden"}
          </Badge>
          <Badge variant={isComposeMode ? "secondary" : "outline"}>
            {isComposeMode ? "📝 Compose" : "📧 Read"}
          </Badge>
          <Badge variant={isLoading ? "secondary" : "outline"}>
            {isLoading ? "🔄 Lädt..." : "✅ Bereit"}
          </Badge>
          <Badge variant={typeof Office !== 'undefined' ? "default" : "destructive"}>
            {typeof Office !== 'undefined' ? "Office.js ✅" : "Office.js ❌"}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Office initialisiert: {outlookService.isOfficeInitialized() ? "Ja" : "Nein"} | 
          URL: {window.location.href}
        </div>
      </CardContent>
    </Card>
  );
}