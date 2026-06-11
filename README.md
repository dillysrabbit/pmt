# Projektsteuerung „Strukturierte Dienstübergaben"

WebApp zur Steuerung des Projekts „Strukturierte Dienstübergaben" (Maria-Hötte-Stift, Mai 2026 – Januar 2027): 5 Phasen, 16 Teilaufgaben, 45 Arbeitspakete, 5 Meilensteine, Risikoregister.

## Tech-Stack

- **Next.js 15** (App Router, TypeScript), **Tailwind CSS**
- **Supabase**: Postgres, Auth (Magic Link), Realtime (Live-Sync auf `task_states` und `risks`)
- **Vercel**-Hosting

## Views

| Route | Inhalt |
|---|---|
| `/` | Dashboard: KPIs, Meilenstein-Ampel, Phasen-Fortschritt, Überfällig/Anstehend |
| `/board` | Kanban (Offen / In Arbeit / Erledigt) mit Phasen-Filter |
| `/zeitplan` | Gantt über 18 Halbmonate inkl. Meilenstein-Rauten |
| `/liste` | Alle 45 APs mit Volltext-/Phasen-/Personen-/Status-Filter |
| `/meilensteine` | Meilenstein-Karten mit Fortschritt und verknüpften APs |
| `/risiken` | Risikoregister (anlegen, entschärfen, löschen) |

Überall: Detail-Modal mit Statuswechsel, debounced Notizen und „zuletzt geändert von". Header: JSON-Export und Abmelden.

## Lokale Entwicklung

```bash
cp .env.example .env.local   # Werte eintragen
npm install
npm run dev
```

Env-Variablen:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase-Setup

Die Migrationen unter `supabase/migrations/` sind bereits auf das Projekt **Dienstuebergaben** (`vixflxlukncdssucvayy`, eu-central-1/Frankfurt) angewendet: Schema, Seed-Daten, RLS-Policies, Audit-Trigger und Realtime-Publication.

### Manuelle Schritte im Supabase-Dashboard (einmalig)

1. **Sign-ups deaktivieren**: Authentication → Sign In / Up → „Allow new users to sign up" ausschalten. (Die App sendet Magic Links zusätzlich mit `shouldCreateUser: false`, d. h. nur eingeladene Nutzer können sich anmelden.)
2. **Redirect-URLs setzen**: Authentication → URL Configuration → *Site URL* auf die Vercel-Produktions-URL setzen und `https://<vercel-domain>/auth/confirm` sowie ggf. `http://localhost:3000/auth/confirm` als *Redirect URLs* eintragen. Ohne diesen Schritt führen Magic Links ins Leere.
3. **Nutzer einladen**: Authentication → Users → „Invite user" für jede Projekt-E-Mail-Adresse.

## Deployment (Vercel)

Env-Variablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` im Vercel-Projekt setzen, dann deployen. Es wird kein weiterer Key benötigt; der anon key ist durch Row Level Security abgesichert (ohne Login keine Daten).

## Berechtigungsmodell

- Zugriff nur mit Login (Magic Link, keine Passwörter); Middleware leitet nicht angemeldete Nutzer auf `/login` um.
- Eingeloggte Nutzer teilen sich einen Projektstand: Struktur-Tabellen (`phases`, `tas`, `aps`, `milestones`, `milestone_deps`) sind read-only, `task_states` und `risks` sind beschreibbar.
- Jeder Statuswechsel landet automatisch im `activity_log` (Trigger); `updated_by`/`updated_at` werden serverseitig gesetzt.
