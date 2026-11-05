# Testprotokoll Lauf 001

**Datum:** 05.11.2026 | **Befehl:** `npm test` (`node --test tests`) | **Umgebung:** Entwicklungsrechner, Node 20, lokal (keine Verbindung zu Supabase, kein Browser)
**Softwarestand:** Kernlogik `src/core`, `supabase/schema.sql`, `web/` (Entwurf nach Baseline v0.5; kein Versionsstand, kein Git)
**Erstellung der Tests:** getrennte Agenten, ausschließlich gegen die Schnittstellenverträge `src/core/API.md`, `supabase/API.md`, `web/API.md`; Code und Tests wurden unabhängig voneinander geschrieben.

**Ergebnis:** 228 Tests, 228 bestanden, 0 fehlgeschlagen. Beim ersten Lauf fielen zwei Tests durch (Regex im Test, nicht im Code); sie wurden korrigiert und der Lauf wiederholt.

| TST-ID | Umfang | Nachweis | Status |
|---|---|---|---|
| TST-U-002 bis TST-U-007 | `tests/*.test.js` (69 Tests) gegen `src/core` | automatisiert | bestanden |
| TST-S-002 bis TST-S-005, TST-S-007 (Datenbankteil) | `tests/db` (96 Tests) gegen `supabase/schema.sql` auf PGlite mit Stub für `auth.uid()` | automatisiert, nur nacheinander, keine echte Parallelität | bestanden (eingeschränkt) |
| TST-U-001, TST-U-008, TST-U-009, TST-S-005, TST-S-007 (UI-Teil) | `tests/web` (62 Tests) mit jsdom | automatisiert | bestanden |

**Nicht ausgeführt (blockiert beziehungsweise offen):** TST-K-001 bis TST-K-006, TST-S-001, TST-S-006, TST-A-001 bis TST-A-005 sowie die Nachweise auf Smartphones. Sie benötigen echtes Supabase, GitHub Pages, Browser/Smartphones oder den Kunden. Insbesondere ist TST-A-002 (parallele Zugriffe) ungeprüft.
