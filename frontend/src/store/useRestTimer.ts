import { create } from 'zustand';
import * as Haptics from 'expo-haptics';

interface RestTimerState {
  isActive: boolean;
  timeLeft: number;
  initialTime: number;
  timerInterval: NodeJS.Timeout | null;
  // Azioni
  startTimer: (seconds: number) => void;
  stopTimer: () => void;
  skipTimer: () => void;
  addTime: (seconds: number) => void;
  reduceTime: (seconds: number) => void;
  tick: () => void;
}

// Funzione helper per suonare e vibrare a scadenza timer
const playCompletionSound = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Nota: Il suono personalizzato è stato disattivato per via del file mancante
  } catch (err) {
    console.log('Error playing haptic feedback', err);
  }
};

export const useRestTimer = create<RestTimerState>((set, get) => ({
  isActive: false,
  timeLeft: 0,
  initialTime: 0,
  timerInterval: null,

  startTimer: (seconds: number) => {
    // Pulisci eventuale timer precedente
    const currentInterval = get().timerInterval;
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    const interval = setInterval(() => {
      get().tick();
    }, 1000);

    set({
      isActive: true,
      timeLeft: seconds,
      initialTime: seconds,
      timerInterval: interval,
    });
  },

  stopTimer: () => {
    const currentInterval = get().timerInterval;
    if (currentInterval) {
      clearInterval(currentInterval);
    }
    set({
      isActive: false,
      timeLeft: 0,
      initialTime: 0,
      timerInterval: null,
    });
  },

  skipTimer: () => {
    get().stopTimer();
  },

  addTime: (seconds: number) => {
    set((state) => {
      if (!state.isActive) return state;
      return {
        timeLeft: state.timeLeft + seconds,
        initialTime: Math.max(state.initialTime, state.timeLeft + seconds),
      };
    });
  },

  reduceTime: (seconds: number) => {
    set((state) => {
      if (!state.isActive) return state;
      const newTime = state.timeLeft - seconds;
      if (newTime <= 0) {
        // Se riduci e scade, non riprodurre il suono o riproducilo?
        // Spesso reduce manuale non triggera il suono forte se vai a sotto zero, o lo triggera se passa a zero
        return { timeLeft: Math.max(0, newTime) };
      }
      return { timeLeft: newTime };
    });
  },

  tick: () => {
    set((state) => {
      if (state.timeLeft <= 1) {
        // Il timer è arrivato a 0
        if (state.timerInterval) clearInterval(state.timerInterval);
        playCompletionSound();
        return {
          isActive: false,
          timeLeft: 0,
          timerInterval: null,
        };
      }
      return {
        timeLeft: state.timeLeft - 1,
      };
    });
  },
}));
