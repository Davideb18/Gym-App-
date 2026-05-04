import 'intl-pluralrules'; // Polyfill per react-native
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// importiamo i file json con le traduzioni
import en from './en.json';
import it from './it.json';
import es from './es.json';

// diciamo queli sono le lingue disponibili e le loro traduzioni
const RESOURCES = {
  en: { translation: en },
  it: { translation: it },
  es: { translation: es },
};

// nome in cui salveremo la lingua scelta dall'utente su AsyncStorage
const LANGUAGE_KEY = '@app_language';

// Prendiamo SUBITO la lingua del dispositivo (es: "it-IT" -> "it") stringa iniziale
const deviceLocales = Localization.getLocales();
let defaultLanguage = deviceLocales[0]?.languageCode || 'en';

// Se la lingua non rientra tra quelle supportate, usa l'inglese di default
if (!Object.keys(RESOURCES).includes(defaultLanguage)) {
  defaultLanguage = 'en';
}

// 1. INIZIALIZZAZIONE SINCRONA (per spegnere l'errore "NO_I18NEXT_INSTANCE")
// Inizializziamo subito i18n all'avvio perché molte schermate leggono le stringhe al primo render.
i18n.use(initReactI18next).init({
  resources: RESOURCES,
  lng: defaultLanguage, // Lingua di partenza (quella del cell)
  fallbackLng: 'en', // La lingua di sicurezza
  compatibilityJSON: 'v4', // Obbligatorio in React Native
  interpolation: {
    escapeValue: false, // Sicurezza per React
  },
  react: {
    useSuspense: false, // Spegne l'attesa di caricamento
  },
});

// 2. SOVRASCRITTURA ASINCRONA (Se l'utente aveva salvato un'altra lingua in passato, la aggiorniamo)
// Se l'utente ha una preferenza salvata, la applichiamo dopo il bootstrap senza bloccare il render.
AsyncStorage.getItem(LANGUAGE_KEY).then((savedLanguage) => {
  if (savedLanguage && Object.keys(RESOURCES).includes(savedLanguage)) {
    i18n.changeLanguage(savedLanguage);
  }
});

// Funzione per cambiare lingua (dal menu Impostazioni)
export const changeLanguage = async (lng: string) => {
  await i18n.changeLanguage(lng);
  await AsyncStorage.setItem(LANGUAGE_KEY, lng);
};

export default i18n;
