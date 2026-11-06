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
  bereits_geloest: 'Eure Gruppe hat das Wort schon gelöst.',
  zu_schnell: 'Nicht so schnell! Bitte kurz warten und dann erneut senden.',
  nicht_berechtigt: 'Falscher Admincode.',
  anmeldung_offen: 'Die Anmeldung ist noch offen. Bitte erst schließen.',
  zu_wenige: 'Zu wenige Teilnehmer für die eingestellte Mindestgröße.',
  nicht_teilbar: 'Die Teilnehmerzahl passt nicht zur eingestellten Gruppengröße. Anmeldung erneut öffnen oder Größe ändern.',
  ungueltige_dauer: 'Ungültige Dauer.',
  zu_wenige_namen: 'Nicht genug Gruppennamen vorhanden.',
  ungueltige_groesse: 'Ungültige Gruppengröße (1 bis 14, Minimum höchstens Maximum).',
  wort_nicht_geloest: 'Eure Gruppe hat das Wort noch nicht gelöst.',
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
};

const PHASES = {
  vorbereitet: 'Vorbereitet',
  anmeldung: 'Anmeldung läuft',
  gruppen_eingeteilt: 'Gruppen eingeteilt',
  wortaufgabe_aktiv: 'Wortaufgabe läuft',
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
