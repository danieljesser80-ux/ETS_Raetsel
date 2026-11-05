# Schnittstellenvertrag Weboberfläche (ARC-001, ARC-006)

Statische Seiten für GitHub Pages in `web/` (Veröffentlichungsordner; die Dateien im Hauptordner `C:\Raetsel` wie index.html/falsch.html/n8n-* sind Altlasten und werden **nicht** angefasst). Kein Build-Schritt. Reines HTML, CSS und ES-Module (Vanilla JS). Einzige externe Skripte per CDN mit fester Version: `@supabase/supabase-js@2` (jsDelivr/esm.sh) und ein QR-Code-Generator. Deutsch, mobil zuerst (Chrome/Safari auf Smartphones, große Bedienelemente, ab 320 px Breite nutzbar). Backend-Verträge: `supabase/API.md`.

## Sicherheit und Datenschutz
- Nutzerdaten (Spitznamen, Gruppennamen, Antworten) werden **nur** mit `textContent`/`createElement` in das DOM geschrieben, nie über `innerHTML`.
- Im Browser nur Project-URL und publishable Key (`web/config.js`, bereits vorbelegt, siehe unten). Kein Admincode, kein service_role-Key im Code. Der Admincode wird nur in `sessionStorage` gehalten.
- Supabase Anonymous Auth mit persistierter Sitzung (Standard von supabase-js, localStorage) → Wiederzugang im selben Browser (ENT-010).

## Dateien
- `web/config.js`: `export const SUPABASE_URL = 'https://myvknbqoxocpkagjnrjc.supabase.co'; export const SUPABASE_KEY = 'sb_publishable_FvEnlcSBsbL8B9By4EeesQ_EZB_2ArP';`
- `web/index.html` + `web/js/player.js`: Spieleransicht (QR-Ziel).
- `web/admin.html` + `web/js/admin.js`: Admin- und Beamer-Ansicht (Beamer = Schalter in derselben Seite, Vollbildansicht mit großem Countdown, Teilnehmerzahl und Rangliste).
- `web/style.css`: gemeinsames Styling (weihnachtlich, hoher Kontrast).
- `web/js/api.js`, `web/js/texts.js`, `web/js/views.js`, `web/js/countdown.js`: testbare Module (unten). `player.js`/`admin.js` verdrahten nur (DOM-Ereignisse, Polling, Supabase) und enthalten möglichst wenig Logik.
- `.github/workflows/pages.yml` (Root `C:\Raetsel`): GitHub-Actions-Workflow, der den Ordner `web` auf GitHub Pages veröffentlicht (actions/checkout, configure-pages, upload-pages-artifact mit `path: web`, deploy-pages; Berechtigungen pages: write, id-token: write).

## Module
`api.js`: `createApi(client)` mit einem Supabase-Client (nur `client.rpc(name, args)` und `client.auth` werden genutzt; `rpc` liefert `{ data, error }`).
- `ensureSession() -> Promise<void>`: `client.auth.getSession()`; ohne Sitzung `client.auth.signInAnonymously()`; Fehler werden geworfen.
- Spieler: `joinRound(name)`→`rpc('join_round',{p_name})`, `getState()`→`rpc('get_state')`, `submitAnswer(answer)`→`rpc('submit_answer',{p_answer})`.
- Admin: `admin.startRegistration(code, seconds)`→`rpc('admin_start_registration',{p_code,p_seconds})`, `admin.closeRegistration(code)`, `admin.formGroups(code)`, `admin.overview(code)`, `admin.finish(code)`, `admin.reset(code)` (jeweils `p_code`).
- Jede Methode gibt `data` (das jsonb-Objekt) zurück; bei `error` wird `Error` mit lesbarer Nachricht geworfen (Transportfehler), fachliche Fehler kommen als `{ok:false, reason}` in `data`.

`texts.js`: `reasonText(reason) -> string`: deutsche Meldung für alle Gründe: `leer, zu_kurz, zu_lang, doppelt, anmeldung_geschlossen, voll, nicht_angemeldet, keine_gruppe, falsche_phase, bereits_geloest, zu_schnell, nicht_berechtigt, anmeldung_offen, zu_wenige, nicht_teilbar, ungueltige_dauer, zu_wenige_namen`; unbekannter Grund → allgemeine Meldung (nie `undefined`, nie der Rohcode allein). `phaseText(phase) -> string` für die fünf Phasen.

`countdown.js`: `countdownSeconds(state, nowMs) -> integer >= 0 | null`: `state.deadline_ms` null → null; sonst `ceil((deadline_ms - (nowMs + (state.server_now_ms - state.fetchedAtMs))) / 1000)`, nie negativ. Dabei ist `state.fetchedAtMs` die lokale Gerätezeit beim Abruf (vom Controller gesetzt). `formatClock(seconds) -> 'M:SS'`.

`views.js` (reine DOM-Renderer, erhalten `root` (HTMLElement) und löschen/ersetzen dessen Inhalt; Handler werden als Callbacks übergeben):
- `renderPlayer(root, state, handlers, nowMs)`: `handlers = { onJoin(name), onSubmit(answer) }`. `state` ist die Antwort von `get_state()` (+ `fetchedAtMs`). Anzeige je Fall:
  - `joined:false` und Phase `anmeldung` mit Restzeit > 0: Namensfeld + Button „Anmelden“ (Eingabe `maxlength=20`), großer Countdown (`M:SS`).
  - `joined:false` sonst: Hinweis, dass die Anmeldung nicht (mehr) möglich ist bzw. noch nicht begonnen hat.
  - `joined:true`, Phase `vorbereitet`/`anmeldung`: „Angemeldet als <Name>“, Countdown (falls vorhanden), „Bitte warten“.
  - Phase `wortaufgabe_aktiv` (und `gruppen_eingeteilt`): Gruppenname, Mitgliederliste (eigener Name hervorgehoben), die **eigenen** Buchstaben groß in Reihenfolge, Aufgabentext („Findet eure Gruppenmitglieder und setzt das Wort zusammen“), Eingabefeld + Button „Wort senden“. Hat die Gruppe gelöst (`solved`): stattdessen Platz und Punkte, kein Eingabefeld.
  - Phase `aufgabe_abgeschlossen`: Abschluss, eigene Platzierung/Punkte der Gruppe (sofern `solved`), sonst „nicht gelöst“. Keine Rangliste (nur Admin/Beamer, ENT-006).
  - Der Aufruf mit einem unbekannten/`null`-State zeigt „Verbinde …“ ohne Fehler.
  - Das Lösungswort wird nie dargestellt, auch wenn der State (fälschlich) ein Feld `solution` enthielte.
- `renderAdmin(root, overview, handlers, nowMs)`: `handlers = { onStart(seconds), onClose(), onForm(), onFinish(), onReset(), onBeamer() }`. Zeigt Phase (deutsch), Restzeit, Teilnehmerzahl und -liste, Gruppen mit Mitgliedern/Platz/Punkten, Rangliste. Buttons nur sinnvoll aktiv: „Anmeldung starten/erneut öffnen“ (Phase vorbereitet/anmeldung), „Anmeldung schließen“ (anmeldung), „Gruppen einteilen“ (anmeldung und geschlossen oder Frist abgelaufen), „Aufgabe beenden“ (wortaufgabe_aktiv), „Alles zurücksetzen“ (immer; per `confirm`-Rückfrage im Controller). Deaktivierte Buttons haben `disabled`.
- `renderBeamer(root, overview, nowMs)`: großer Countdown (nur Phase anmeldung), Teilnehmerzahl, Phase, Rangliste (Platz, Gruppenname, Punkte), keine Spielernamen, keine Lösungswörter.
- `renderMessage(root, text, kind)`: kurze Meldung (kind `'info'|'error'|'success'`), per `role="status"`/`role="alert"`.

## Controller-Verhalten
- Spieler: nach `ensureSession()` sofort `getState()`, danach Polling alle 2 s und zusätzlich Realtime auf Tabelle `round` (bei Änderung sofort `getState()`); Countdown wird lokal jede Sekunde neu gezeichnet, ohne Netz. Bei Netzfehler sichtbarer Hinweis „Verbindung unterbrochen“, automatische Wiederaufnahme. Absenden sperrt den Button bis zur Antwort und zeigt `reasonText` bzw. „Leider falsch“/„Richtig! Platz …“. Antwortbestätigung soll innerhalb von 2 s sichtbar sein.
- Admin: Code-Eingabe (Passwortfeld) → `sessionStorage`; Polling `admin.overview` alle 2 s; nach jedem Befehl sofort aktualisieren; Fehlermeldungen via `reasonText`; zeigt auch den QR-Code zur Spieleradresse (`index.html` relativ zur aktuellen Admin-Adresse, aufgelöst per `new URL('index.html', location.href)`).
