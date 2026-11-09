const REASONS = {
  leer: 'Bitte gib einen Namen ein.',
  zu_kurz: 'Der Name ist zu kurz.',
  zu_lang: 'Der Name ist zu lang (höchstens 20 Zeichen).',
  doppelt: 'Dieser Name ist schon vergeben. Bitte wähle einen anderen.',
  anmeldung_geschlossen: 'Die Anmeldung ist geschlossen.',
  voll: 'Leider sind alle Plätze belegt.',
  nicht_angemeldet: 'Du bist noch nicht angemeldet.',
  keine_gruppe: 'Du hast noch keine Gruppe.',
  falsche_phase: 'Das ist jetzt nicht möglich (falsche Phase).',
  bereits_geloest: 'Eure Gruppe hat die Wortaufgabe bereits abgeschlossen.',
  zu_schnell: 'Nicht so schnell! Bitte kurz warten und dann erneut senden.',
  nicht_berechtigt: 'Falscher Admincode.',
  anmeldung_offen: 'Die Anmeldung ist noch offen. Bitte erst schließen.',
  zu_wenige: 'Zu wenige Teilnehmer für die eingestellte Mindestgröße.',
  nicht_teilbar: 'Die Teilnehmerzahl passt nicht zur eingestellten Gruppengröße. Anmeldung erneut öffnen oder Größe ändern.',
  ungueltige_dauer: 'Ungültige Dauer.',
  zu_wenige_namen: 'Nicht genug Gruppennamen vorhanden.',
  ungueltige_groesse: 'Ungültige Gruppengröße (1 bis 14, Minimum höchstens Maximum).',
  wort_nicht_geloest: 'Eure Gruppe hat die Wortaufgabe noch nicht abgeschlossen.',
  nicht_spielleiter: 'Nur der Spielleiter eurer Gruppe kann Antworten senden.',
  unbekannte_aufgabe: 'Diese Aufgabe gibt es nicht.',
  nicht_verfuegbar: 'Diese Aufgabe ist noch nicht freigeschaltet.',
  bereits_abgegeben: 'Eure Gruppe hat dieses Rätsel schon abgegeben.',
  nicht_gestartet: 'Das Rätsel wurde noch nicht geöffnet.',
  ungueltige_auswahl: 'Bitte einen der Namen auswählen.',
  ungueltige_optionen: 'Es werden genau 4 verschiedene Namen gebraucht, der richtige muss dabei sein.',
  ungueltige_zahl: 'Bitte eine ganze Zahl eingeben (nur Ziffern).',
  ungueltige_loesung: 'Bei Schätzfragen muss die Lösung eine ganze Zahl sein.',
  ungueltiges_bild: 'Ungültiger Bildlink (https://… oder relativer Pfad).',
  ungueltige_schwierigkeit: 'Bitte leicht, mittel oder schwer auswählen.',
  ungueltige_punktestaffel: 'Je Stufe neun nicht ansteigende ganze Punktewerte von 0 bis 10000 eintragen.',
  ungueltige_wortliste: 'Eindeutige Wörter mit 1 bis 9 Buchstaben A–Z eintragen; keine leeren Zeilen, Umlaute oder ß.',
  ungueltige_aufgaben: 'Die Aufgabendatei enthält Fehler oder ist leer; Liste prüfen.',
  ungueltige_id: 'Ungültige Aufgaben-ID.',
  doppelte_id: 'Aufgaben-ID doppelt.',
  ungueltige_kategorie: 'Kategorie fehlt oder ist länger als 40 Zeichen.',
  ungueltiger_titel: 'Titel fehlt oder ist länger als 120 Zeichen.',
  ungueltiger_typ: 'Typ muss exakt, schaetzung oder auswahl sein.',
  ungueltiger_text: 'Text fehlt oder ist länger als 4000 Zeichen.',
  optionen_nicht_erlaubt: 'Optionen sind nur beim Typ auswahl erlaubt.',
  kategorie_schreibweise: 'Kategorie unterscheidet sich nur in Groß-/Kleinschreibung.',
  keine_loesung: 'Keine Lösung – Aufgabe nicht spielbar.',
  keine_richtige_option: 'Keine richtige Option – Aufgabe nicht spielbar.',
};

const PHASES = {
  vorbereitet: 'Vorbereitet',
  anmeldung: 'Anmeldung läuft',
  gruppen_eingeteilt: 'Gruppen eingeteilt',
  wortaufgabe_aktiv: 'Spiel läuft',
  aufgabe_abgeschlossen: 'Spiele beendet',
};

export function reasonText(reason) {
  if (typeof reason === 'string' && Object.prototype.hasOwnProperty.call(REASONS, reason)) {
    return REASONS[reason];
  }
  return 'Etwas ist schiefgelaufen. Bitte versuche es noch einmal.';
}

export function phaseText(phase) {
  if (typeof phase === 'string' && Object.prototype.hasOwnProperty.call(PHASES, phase)) {
    return PHASES[phase];
  }
  return 'Unbekannt';
}
