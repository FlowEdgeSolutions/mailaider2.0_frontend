// src/utils/clipboard.ts

/**
 * Kopiert Text zuverlässig in die Zwischenablage.
 * – versucht erst navigator.clipboard.writeText
 * – fällt auf document.execCommand('copy') zurück
 * Liefert true bei Erfolg, sonst false.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fällt unten auf Fallback */
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}
