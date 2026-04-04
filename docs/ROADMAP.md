# 🚀 Roadmap: Obiettivo "Hevy & Strong"

Questa roadmap delinea i passaggi immediati (Breve Termine) e secondari (Medio Termine) necessari per portare *The Lab* allo stesso livello o superiore dei colossi del mercato come Hevy e Strong.

## 🎯 Breve Termine (Prossimi Giorni)
Queste sono le priorità assolute per avere un'app di allenamento completa, testabile dai tuoi follower su Instagram e TikTok:

1. **⏱️ Rest Timer Globale & Notifiche Locali**
   - **Feature:** Quando l'utente spunta ✅ una serie, deve apparire un Timer di Recupero (es. 90s) in sovrimpressione.
   - **Notifica:** Un suono e una vibrazione locale ("Beep!") quando il tempo scade, supportata nativamente da Apple Watch.
   
2. **💾 Salvataggio Storico Allenamenti (History)**
   - **Feature:** Bottone "Termina Allenamento" che fa una POST al backend per salvare l'intera sessione (volumi totali, KG sollevati per esercizio) in `workout_sessions`.
   - **Database:** Conferma dello schema del database Supabase per assicurare che le "Sessioni" registrino correttamente i progressi slegandosi dalle "Schede".

3. **📊 Storico Esercizio in linea (In-Workout Progress)**
   - **Feature:** Come su Hevy, quando stai eseguendo "Panca Piana" in `ActiveWorkoutScreen`, devi poter premere un bottoncino per vedere "Cosa ho fatto l'ultima volta che ho eseguito la Panca?", così sai immediatamente se devi alzare il peso.

## 📈 Medio Termine (Prima del Lancio Ufficiale)
Features potenti che fidelizzano l'utente:

4. **📉 Downgrade Gate Logic (Gating Premium)**
   - **Feature:** Se un utente disdice il premium, intercettare il momento, bloccare l'interfaccia e chiedergli di "Bannare" tutte le sue schede eccetto 4. Questo è un driver psicologico formidabile per mantenere l'abbonamento.

5. **👤 Profilo & Analytics**
   - **Feature:** Una tab profilo che esplode i dati: "Volume Sollevato Totale nel Mese", "Muscoli più allenati (Radar Chart/Heatmap del corpo)" e numero di Workout per settimana.

6. **🫂 Social Base**
   - **Feature:** Seguire i propri amici, feed home con chi si è allenato oggi (un grande plus naturale che Hevy ha applicato alla perfezione rubando la UI a Strava).

7. **👁️ Pose Estimation (Killer Feature)**
   - **Feature:** L'integrazione videocamera che corregge gli angoli di esecuzione on-device. Questo sarà **il vero motivo** per cui la gente abbandonerà Hevy e Strong per usare "The Lab"!
