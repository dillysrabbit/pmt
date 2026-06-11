-- Bereits auf das Supabase-Projekt "Dienstuebergaben" (vixflxlukncdssucvayy) angewendet.

insert into public.phases (id, name, time_label, color) values
(1, 'Initiierung & Konzept', 'Mai – Jul 2026', '#028090'),
(2, 'Vorbereitung der Umsetzung', 'Aug 2026', '#00A896'),
(3, 'Pilotphase (Azubis)', 'Sep – Okt 2026', '#02C39A'),
(4, 'Einrichtungsweiter Rollout', 'Nov – Dez 2026', '#0891B2'),
(5, 'Evaluation & Nachhaltigkeit', 'Dez 26 – Jan 27', '#065A82');

insert into public.tas (id, phase_id, name) values
('1.1', 1, 'Problemanalyse'),
('1.2', 1, 'Schulung & Einweisung'),
('1.3', 1, 'Projektgruppen & Checklisten'),
('1.4', 1, 'Zusammenführung & Konzept'),
('1.5', 1, 'Stakeholder informieren'),
('2.1', 2, 'Materialien bereitstellen'),
('2.2', 2, 'Feedbackinstrumente'),
('3.1', 3, 'Hospitation'),
('3.2', 3, 'Begleitete & eigenst. Durchführung'),
('3.3', 3, 'Ausbildungsnachweis'),
('4.1', 4, 'Teamschulung & Rollout'),
('4.2', 4, 'Integration alle Schichten'),
('4.3', 4, 'Verbindlichkeit herstellen'),
('5.1', 5, 'Auswertung'),
('5.2', 5, 'Optimierung'),
('5.3', 5, 'Verstetigung');

insert into public.aps (id, ta_id, title, responsible, start_half, end_half) values
('1.1.1', '1.1', 'Ist-Analyse der Übergabepraxis', 'Stv. PDL', 0, 0),
('1.1.2', '1.1', 'Schwachstellen dokumentieren', 'Stv. PDL', 0, 1),
('1.2.1', '1.2', 'Praxisanleiter in Projektidee einweisen', 'Zentrale PA', 1, 2),
('1.2.2', '1.2', 'Feedbackstruktur & Leitfragen besprechen', 'Zentrale PA', 1, 2),
('1.2.3', '1.2', 'Azubis: Pflegeprozess & SIS® erläutern', 'PA vor Ort', 2, 2),
('1.2.4', '1.2', 'Rolle als Übergabeleitung klären', 'PA vor Ort', 2, 3),
('1.3.1', '1.3', 'Gruppe Pflegefachkräfte bilden', 'Stv. PDL', 2, 2),
('1.3.2', '1.3', 'Gruppe Auszubildende bilden', 'PA vor Ort', 2, 2),
('1.3.3', '1.3', 'PFK-Gruppe erstellt eigene Checkliste', 'Stv. PDL', 3, 4),
('1.3.4', '1.3', 'Azubi-Gruppe erstellt eigene Checkliste', 'PA vor Ort', 3, 4),
('1.4.1', '1.4', 'Checklisten vergleichen & Synthese erstellen', 'Stv. PDL', 4, 4),
('1.4.2', '1.4', 'Obligatorische Items ergänzen', 'Zentrale PA', 4, 5),
('1.4.3', '1.4', 'Phasenplan festlegen (5 Phasen)', 'Stv. PDL', 4, 5),
('1.4.4', '1.4', 'Konzept durch PDL freigeben', 'PDL', 5, 5),
('1.5.1', '1.5', 'PDL und Träger informieren', 'Stv. PDL', 5, 5),
('1.5.2', '1.5', 'Pflegeteam im Dienstgespräch informieren', 'Stv. PDL', 5, 5),
('2.1.1', '2.1', 'Finale Checklisten drucken', 'PA vor Ort', 6, 6),
('2.1.2', '2.1', 'Schichtordner ausstatten', 'PA vor Ort', 6, 7),
('2.1.3', '2.1', 'Vivendi-Zugang für Azubis prüfen', 'Stv. PDL', 6, 6),
('2.2.1', '2.2', 'Feedbackbögen mit Leitfragen erstellen', 'Zentrale PA', 6, 7),
('2.2.2', '2.2', 'Bewertungskriterien Lernzielkontrolle', 'Zentrale PA', 6, 7),
('2.2.3', '2.2', 'Vorlage Ausbildungsnachweise', 'PA vor Ort', 7, 7),
('3.1.1', '3.1', 'Azubis beobachten Übergaben (8–10 D.)', 'PA vor Ort', 8, 9),
('3.1.2', '3.1', 'PA führt vor, Azubi gibt Feedback', 'PA vor Ort', 8, 9),
('3.2.1', '3.2', 'Azubis leiten Übergabe (15–20 D.)', 'Azubis', 9, 11),
('3.2.2', '3.2', 'Strukturiertes Feedback je Übergabe', 'PA vor Ort', 9, 11),
('3.2.3', '3.2', 'Lernzielkontrolle: Punkte begründen', 'PA vor Ort', 10, 11),
('3.2.4', '3.2', 'Erfahrungen als Multiplikatoren ins Team', 'Azubis', 11, 11),
('3.3.1', '3.3', 'Anleitungen in Ausbildungsnachweise', 'PA vor Ort', 9, 11),
('3.3.2', '3.3', 'Checklisten als Kompetenznachweis', 'Azubis', 10, 11),
('4.1.1', '4.1', 'Gesamtes Pflegeteam einweisen', 'Stv. PDL', 12, 12),
('4.1.2', '4.1', 'Piloterfahrungen vorstellen', 'Stv. PDL', 12, 12),
('4.1.3', '4.1', 'Verbindlichen Starttermin festlegen', 'PDL', 12, 13),
('4.2.1', '4.2', 'Checkliste in Früh/Spät/Nacht einführen', 'Stv. PDL', 13, 15),
('4.2.2', '4.2', 'Jede PFK führt mit Checkliste durch', 'Pflegeteam', 13, 15),
('4.3.1', '4.3', 'Checklisten im Schichtordner ablegen', 'Pflegeteam', 13, 15),
('4.3.2', '4.3', 'Vivendi-Nutzung als Standard', 'Pflegeteam', 13, 15),
('4.3.3', '4.3', 'Stichprobenkontrolle Vollständigkeit', 'Stv. PDL', 14, 15),
('5.1.1', '5.1', 'Vollständigkeit prüfen (Ziel 100 %)', 'Stv. PDL', 15, 16),
('5.1.2', '5.1', 'Teamakzeptanz erfragen', 'Stv. PDL', 15, 16),
('5.1.3', '5.1', 'Informationsverluste auswerten', 'Stv. PDL', 15, 16),
('5.2.1', '5.2', 'Feedback der Azubis einholen', 'PA vor Ort', 15, 16),
('5.2.2', '5.2', 'Checkliste bei Bedarf anpassen', 'Stv. PDL', 16, 17),
('5.3.1', '5.3', 'Checkliste ins QM-Handbuch', 'PDL', 16, 17),
('5.3.2', '5.3', 'Übergabekultur als Dauerstandard', 'PDL', 17, 17);

insert into public.milestones (id, title, due_half, due_label) values
('M1', 'Konzept freigegeben', 5, 'Ende Jul 2026'),
('M2', 'Material & Instrumente bereit', 7, 'Ende Aug 2026'),
('M3', 'Pilotphase abgeschlossen', 11, 'Ende Okt 2026'),
('M4', 'Pflegeteam geschult', 12, 'Mitte Nov 2026'),
('M5', 'Im QM-Handbuch verankert', 17, 'Ende Jan 2027');

insert into public.milestone_deps (milestone_id, ap_id) values
('M1', '1.4.4'),
('M2', '2.1.1'), ('M2', '2.1.2'), ('M2', '2.1.3'), ('M2', '2.2.1'), ('M2', '2.2.2'), ('M2', '2.2.3'),
('M3', '3.1.1'), ('M3', '3.1.2'), ('M3', '3.2.1'), ('M3', '3.2.2'), ('M3', '3.2.3'), ('M3', '3.2.4'),
('M4', '4.1.1'), ('M4', '4.1.2'), ('M4', '4.1.3'),
('M5', '5.3.1'), ('M5', '5.3.2');

insert into public.task_states (ap_id)
select id from public.aps;
