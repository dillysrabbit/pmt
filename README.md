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
| `/nutzer` | Nutzerverwaltung (nur Admins): E-Mail-Adressen freischalten, Rollen ändern |

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

### Manuelle Schritte (einmalig)

**Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials):

1. OAuth-Client-ID anlegen (Typ „Webanwendung").
2. *Authorized redirect URI*: `https://vixflxlukncdssucvayy.supabase.co/auth/v1/callback`
3. Client-ID und Client-Secret kopieren.

**Supabase-Dashboard** (Authentication):

1. **Google-Provider aktivieren**: Sign In / Up → Google → enable, Client-ID + Secret eintragen.
2. **Sign-ups eingeschaltet lassen** („Allow new users to sign up" = an) — der Google-Login braucht das. Der Datenzugriff ist trotzdem geschützt: Wer nicht in der Allowlist (`app_users`) steht, sieht nur „Kein Zugang".
3. **Redirect-URLs setzen**: URL Configuration → *Site URL* auf die Vercel-Produktions-URL setzen und `https://<vercel-domain>/auth/confirm` sowie ggf. `http://localhost:3000/auth/confirm` als *Redirect URLs* eintragen.

**Nutzer freischalten** passiert danach direkt in der App unter `/nutzer` (Admin: `dillysrabbit@gmail.com`, per Seed eingetragen). Kein Supabase-Dashboard nötig.

## Deployment (Vercel)

Env-Variablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` im Vercel-Projekt setzen, dann deployen. Es wird kein weiterer Key benötigt; der anon key ist durch Row Level Security abgesichert (ohne Login keine Daten).

## Berechtigungsmodell

- Login per **Google** oder Magic Link (keine Passwörter); Middleware leitet nicht angemeldete Nutzer auf `/login` um.
- **Allowlist**: Datenzugriff hat nur, wessen E-Mail-Adresse in `app_users` steht (RLS prüft `auth.jwt() ->> 'email'`). Alle anderen sehen nach dem Login nur „Kein Zugang".
- **Rollen**: `admin` verwaltet die Allowlist über `/nutzer`; `member` darf alles andere (Status, Notizen, Risiken). Initialer Admin: `dillysrabbit@gmail.com`.
- Freigeschaltete Nutzer teilen sich einen Projektstand: Struktur-Tabellen (`phases`, `tas`, `aps`, `milestones`, `milestone_deps`) sind read-only, `task_states` und `risks` sind beschreibbar.
- Jeder Statuswechsel landet automatisch im `activity_log` (Trigger); `updated_by`/`updated_at` werden serverseitig gesetzt.
