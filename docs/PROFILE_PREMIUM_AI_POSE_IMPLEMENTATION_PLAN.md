# Profile + Premium + AI + Pose Estimation Implementation Plan

Data: 2026-04-13
Owner: The Lab
Obiettivo: trasformare la sezione profilo in un hub ad alto valore (free + premium) con analytics avanzate, retention e monetizzazione.

## 1) Problemi attuali e contesto

- I record in profilo devono essere affidabili e visibili sempre.
- Manca una dashboard statistica profonda (durata, trend mensile, distribuzione muscoli, PR completi).
- Manca una strategia premium completa con paywall e value proposition chiara.
- Mancano due feature ad alto impatto percepito:
  - AI routine generation
  - Pose Estimation

## 2) Obiettivi prodotto

- Dare una percezione forte di progresso (numeri + visual + trend).
- Aumentare retention con feedback settimanale/mensile.
- Aumentare conversione Premium con feature realmente desiderabili.
- Preparare architettura scalabile per AI + computer vision.

## 3) Scope funzionale (macro aree)

### A. Profilo 2.0 (core)

- KPI principali in alto:
  - Workout completati
  - PR totali
  - Livello + progress
- Record section:
  - Elenco PR completo per esercizio (non solo top 3)
  - Ordinamento e filtri (peso, e1RM, data)
- Grafici base:
  - Durata allenamenti (ultime N sessioni)
  - Volume per settimana
  - Sessioni per settimana

### B. Analytics avanzate (stats)

- Calendario allenamenti (heatmap mensile)
- Trend mese corrente vs mese precedente:
  - Durata totale
  - Volume totale
  - Numero workout
  - Delta percentuale
- Distribuzione muscoli allenati:
  - Percentuale gruppo muscolare
  - Bilanciamento push/pull/legs
- Distribuzione tipologia allenamenti:
  - template/routine più usate

### C. Premium monetization

- Sezione store premium dedicata:
  - Piano mensile/annuale
  - Vantaggi chiari e concreti
  - CTA persistenti contestuali
- Paywall trigger strategici:
  - accesso analytics avanzate
  - report mensile completo
  - storico illimitato grafici
  - esportazione report

### D. AI routine generation

- Wizard guidato:
  - obiettivo (massa/forza/dimagrimento)
  - giorni disponibili
  - livello esperienza
  - attrezzatura disponibile
  - muscoli target
- Output:
  - scheda generata + varianti
  - parametri serie/reps/rest
  - motivazioni sintetiche delle scelte

### E. Pose Estimation

- MVP tecnico:
  - 3-5 esercizi iniziali (es. squat, push-up, plank, shoulder press, deadlift)
  - feedback base in tempo reale (ROM, velocita, allineamento)
- Fase avanzata:
  - scoring forma
  - storico errori comuni
  - consigli personalizzati

## 4) Piano implementazione a fasi

## Fase 0 - Stabilizzazione immediata (1-2 giorni)

- Sistemare affidabilita record in profilo.
- Validare query dati su utenti reali (dataset piccoli e grandi).
- Aggiungere fallback UI in caso dati mancanti.

Deliverable:
- Record visibili e coerenti in profilo.

## Fase 1 - Profilo Analytics Foundation (4-6 giorni)

- Endpoint/query per KPI e grafici base.
- Componenti grafici riusabili.
- Schermata stats iniziale dentro profilo.

Deliverable:
- Durata allenamenti, volume settimanale, sessioni settimanali.

## Fase 2 - Advanced Stats + Calendar (5-8 giorni)

- Heatmap calendario allenamenti.
- Comparativa mese corrente vs mese precedente.
- Distribuzione muscoli allenati.

Deliverable:
- Stats dashboard completa (free con limiti).

## Fase 3 - Premium Store + Paywall (4-6 giorni)

- Schermata store premium dedicata.
- In-app purchase/subscription integration.
- Gating funzionalita avanzate.

Deliverable:
- Flusso monetizzazione end-to-end funzionante.

## Fase 4 - AI Routine Generator (7-12 giorni)

- Prompting + orchestrazione backend AI.
- Validazioni output e guardrail.
- Integrazione diretta con builder schede.

Deliverable:
- Generazione schede AI pronta per beta privata.

## Fase 5 - Pose Estimation MVP (10-16 giorni)

- Pipeline camera + keypoints + feedback live.
- Scelta motore (on-device vs cloud-assisted).
- Telemetria performance/fps e batteria.

Deliverable:
- MVP pose per esercizi selezionati.

## 5) Modello Free vs Premium

Free:
- KPI base profilo
- record base
- grafici limitati (window temporale ridotta)

Premium:
- report mensile completo
- storico illimitato + export
- analytics avanzate muscoli e bilanciamento
- AI routine generation completa
- Pose Estimation avanzata + report forma

## 6) Metriche di successo

- Retention D7 e D30
- Conversione a Premium
- Tempo medio in sezione Profilo/Stats
- Utilizzo feature AI/Pose
- Riduzione churn premium

## 7) Rischi e mitigazioni

- Dati incompleti storici: fallback robusti e normalizzazione.
- Costi AI elevati: caching, limiti e tier usage.
- Performance mobile su pose estimation: partire con MVP ridotto e benchmark device.
- Complessita UX: rollout progressivo e test utenti.

## 8) Backlog operativo immediato (prossimi task)

1. Hardening definitivo query PR + test casi reali.
2. Aggiunta grafico durata allenamenti in profilo.
3. Aggiunta sezione "Report del mese" (base).
4. Definizione schermata store premium (wireframe + copy conversione).
5. Specifica tecnica AI routine generator (input/output schema).
6. Technical spike pose estimation (librerie, performance, accuratezza).

## 9) Note implementative consigliate

- Riutilizzare store/query key gia presenti per evitare duplicazioni.
- Separare chiaramente componenti visuali da data logic.
- Inserire feature flags per rollout graduale premium/AI/pose.
- Loggare eventi analytics su ogni touchpoint conversion-critical.
