-- Bereits auf das Supabase-Projekt "Dienstuebergaben" (vixflxlukncdssucvayy) angewendet.
-- Aktualisierung gemäß Meilensteinplanung (Stand Juni 2026)

-- Rollen: "Zentrale PA" und "PA vor Ort" zu "PA" zusammengeführt
update public.aps set responsible = 'PA' where responsible in ('Zentrale PA', 'PA vor Ort');

-- Pilotphase: Feedback je Übergabe durch PA bzw. Bezugs-PFK
update public.aps set responsible = 'PA / Bezugs-PFK' where id = '3.2.2';

-- Wording: Bereichsordner statt Schichtordner
update public.aps set title = 'Bereichsordner ausstatten' where id = '2.1.2';
update public.aps set title = 'Unterschriebene Checklisten im Bereichsordner ablegen' where id = '4.3.1';

-- Wording: Qualitätshandbuch statt QM-Handbuch
update public.aps set title = 'Checkliste ins Qualitätshandbuch (QM)' where id = '5.3.1';
update public.milestones set title = 'Im Qualitätshandbuch verankert' where id = 'M5';

-- Stakeholder informieren läuft bis Aug 2026
update public.aps set end_half = 7 where id in ('1.5.1', '1.5.2');
update public.phases set time_label = 'Mai – Aug 2026' where id = 1;

-- M4 fällig Ende Nov 2026 (statt Mitte Nov)
update public.milestones set due_half = 13, due_label = 'Ende Nov 2026' where id = 'M4';
