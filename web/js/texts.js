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
  zu_wenige: 'Zu wenige Teilnehmer (mindestens 4).',
  nicht_teilbar: 'Bei 7 Teilnehmern ist keine Einteilung möglich. Anmeldung erneut öffnen.',
  ungueltige_dauer: 'Ungültige Dauer.',
  zu_wenige_namen: 'Nicht genug Gruppennamen vorhanden.',
};

const PHASES = {
  vorbereitet: 'Vorbereitet',
  anmeldung: 'Anmeldung läuft',
  gruppen_eingeteilt: 'Gruppen eingeteilt',
  wortaufgabe_aktiv: 'Wortaufgabe läuft',
  aufgabe_abgeschlossen: 'Aufgabe abgeschlossen',
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
