# Progression & Graphics System Plan

Data: 2026-04-13
Scope: progettazione UX/UI + logica dati per record, progressioni, livelli e grafici stile app fitness (Hevy / Strong / Evolve-like) adattata a The Lab.

## 1) Problemi attuali

- Livello troppo sensibile con pochi dati (spike iniziali).
- Record mostrati in forma limitata (manca focus su ultimo record e trend storico).
- Grafici utili ma ancora poco gerarchici per decisioni allenamento.
- Mancanza di una schermata dedicata al "Level System" con progressione chiara.

## 2) Obiettivi prodotto

- Dare feedback immediato: "sto migliorando o no?".
- Rendere visibile il progresso per utente e per singolo esercizio.
- Fornire una UI soddisfacente e chiara (badge, tier, progress bars, milestone).
- Evitare gamification falsata: crescita coerente con esperienza reale.

## 3) Livello utente (globale)

### Metriche input

- workout completati (totale)
- volume totale (kg)
- durata totale (minuti)
- PR count
- consistenza ultimi 30 giorni

### Logica

- scoring con componenti logaritmiche su volume/durata per limitare spike.
- cap esperienza in base al numero workout per evitare livelli irreali con pochi dati.
- output: level, score, tier, progressPercent.

### Tier proposta

- Rookie: 1-14
- Builder: 15-29
- Advanced: 30-44
- Elite: 45+

## 4) Livello per esercizio (nuovo)

Per ogni esercizio calcolare:

- e1RM attuale (Epley)
- migliore e1RM storico
- miglioramento 30 giorni (delta %)
- consistenza (sessioni con quell'esercizio negli ultimi 30 giorni)

Output per card esercizio:

- Exercise Level (1-20)
- trend: up / stable / down
- stato progresso: "in crescita", "stabile", "in calo"

## 5) Record section redesign

### Record principali da mostrare

- Ultimo record fatto (timestamp + esercizio + valore)
- Top PR assoluti (peso, volume, reps)
- Nuovi PR ultimi 30 giorni

### Card record proposta

- Titolo esercizio
- valore record (es. 100kg x 5)
- e1RM stimato
- data ultimo update
- mini trend sparkline (7-12 punti)

## 6) Grafici (target: ~10 visualizzazioni)

1. e1RM trend (line)
2. Volume trend (bar)
3. Reps trend (bar)
4. Sets count trend (bar)
5. Weekly total volume (stack/column)
6. Workout frequency weekly (bar)
7. Muscle-group distribution (donut)
8. PR timeline (event markers)
9. Fatigue proxy (rolling load) line
10. Exercise consistency heatmap (calendar style)

## 7) Posizionamento UI

### Profile screen

- row 1: Workouts / PR / Level
- row 2 (nuova): Last PR + Weekly streak + Recovery trend
- section records: lista esercizi con ultimo record e trend breve

### Exercise detail modal

- tab Description: istruzioni + video
- tab History:
  - blocco KPI (ultimo e1RM, best e1RM, delta 30d)
  - blocco grafici principali (1RM/Volume/Reps/Sets)
  - blocco log sessioni con note

### Nuova Level Screen (dedicata)

Accesso da card "Level" in Profile:

- livello attuale + tier badge
- progress bar verso livello successivo
- milestone rewards (visual only)
- breakdown score (workouts/volume/consistency/PR)

## 8) Asset grafici livello (badge/logo)

- Set badge per tier (Rookie/Builder/Advanced/Elite).
- Set badge per level milestone (Lv 5, 10, 20, 30, 40, 50).
- Variante monocromatica + variante premium accent.
- Formato consigliato: SVG + fallback PNG @1x/@2x/@3x.

## 9) Piano implementazione (incrementale)

### Fase A (fondamenta dati)

- consolidare progression service globale
- aggiungere metriche per esercizio
- aggiungere endpoint/select necessari per ultimo record + trend

### Fase B (UI minima utile)

- card level cliccabile in Profile
- ultimo record fatto in sezione Record
- trend badge (up/stable/down)

### Fase C (grafici avanzati)

- aggiungere 4 grafici base già prioritari
- ottimizzare labels e responsive su iPhone piccoli
- introdurre grafici 5-10 progressivamente

### Fase D (refinement)

- badge/icone definitive
- animazioni leggere (stagger + reveal)
- QA prestazionale e accessibilità contrasto

## 10) KPI di qualità

- tempo medio comprensione stato progresso < 5 sec (test UX)
- nessun overflow testi su iPhone piccoli
- caricamento grafici sotto 200ms su dataset medio locale
- coerenza colori/gerarchia su tutte le tab principali

## 11) Note tecniche

- usare smoothing/rolling windows per evitare rumore nei trend.
- evitare interpretation bias: mostrare sempre range temporale del dato.
- mantenere fallback robusto quando storico è scarso (stato "insufficient data").
