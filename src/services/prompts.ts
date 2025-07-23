export const PROMPTS = {
  /**
   * System-Prompt: Steuert das generelle Verhalten der KI (z. B. Schreibstil, Regeln)
   * Wird als "system"-Nachricht an die KI gesendet.
   */
  system: `Du bist ein professioneller E-Mail-Assistent. Achte auf korrekte Rechtschreibung, stilistisch angemessene Formulierungen und einen klaren, respektvollen Ton. Berücksichtige regionale Sprachvarianten wie {region} (z. B. Deutschland, Österreich, Schweiz), falls angegeben. Verwende den bereitgestellten E-Mail-Inhalt als Grundlage, sofern kein separater Benutzertext gegeben ist.`,

  /**
   * Prompt für das Zusammenfassen einer E-Mail
   */
  summarize: `Fasse die folgende E-Mail präzise und übersichtlich zusammen und Liste es untereinander mit - auf:\n\n{base}`,

  /**
   * Prompt für das Antworten auf eine E-Mail
   */
  reply: `Formuliere eine Antwort auf die folgende E-Mail im {tone} Ton mit {greeting} Anrede ({length} Sprachstil).

Verwende korrekte Rechtschreibung und Grammatik entsprechend der Standardsprache. Berücksichtige regionale Varianten nur, wenn sie explizit angegeben werden.

Inhaltliche Grundlage: Nutze den bereitgestellten E-Mail-Inhalt als Ausgangspunkt – ausser es wird ein separater Benutzertext angegeben, dann hat dieser Vorrang.

Begrüssung: Beginne die Antwort mit: „Hallo [Name des Absenders der ursprünglichen E-Mail]". Falls der Name nicht erkennbar ist, schreibe nur: „Hallo,".

Grussformel: Lasse die Grussformel am Ende der E-Mail **komplett weg**.

Tonalität: Richte Formulierung, Ansprache und Stil **konsequent nach den übergebenen Parametern** aus (z. B. formell/informell, Sie/Du).

Formatierung: Lasse den Betreff vollständig weg und bringe ihn **nicht** in die Antwort ein.`,

  /**
   * Prompt für das Übersetzen einer E-Mail
   */
  translate: `Übersetze den folgenden Text ins {language}. Achte auf professionellen Sprachgebrauch und kulturelle Angemessenheit:\n\n{base}`,

  /**
   * Prompt für das Korrigieren von Stil und Grammatik
   */
  correct: `Überarbeite den folgenden Text stilistisch und grammatikalisch – professionell, klar und leserfreundlich:\n\n{base}`,

  /**
   * Prompt für das reine Korrigieren der Rechtschreibung
   */
  spelling: `Korrigiere ausschließlich die Rechtschreibfehler im folgenden Text. Der Stil soll unverändert bleiben:\n\n{base}`,

  /**
   * Prompt für das höfliche Umformulieren eines Textes
   */
  rephrase: `Formuliere den folgenden Text höflich und professionell um – ohne inhaltliche Änderungen:\n\n{base}`,

  /**
   * Prompt für das Verfassen einer neuen E-Mail
   */
  compose: `Verfasse eine neue E-Mail an {to} mit dem Betreff "{subject}". Zweck der E-Mail: {purpose}. Achte auf einen klaren Aufbau und einen passenden Stil ({tone}).`,

  // Optional: Prompt für "Freitext generieren"
  freestyle: `Erstelle einen professionellen E-Mail-Text basierend auf folgender Beschreibung:\n\n{base}`,

  // Optional: Prompt zur Vereinfachung von komplexen Texten
  simplify: `Vereinfache den folgenden Text sprachlich, ohne die Aussage zu verändern. Ziel ist eine klarere, leichter verständliche Ausdrucksweise:\n\n{base}`
};
