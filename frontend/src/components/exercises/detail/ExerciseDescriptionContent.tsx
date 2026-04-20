import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import ExerciseVideoPlayer from '../ExerciseVideoPlayer';
import ExerciseCharts from '../ExerciseCharts';
import type { ExerciseHistorySession } from '../../../api/workoutService';

const FORCE_LABELS: Record<string, Record<string, string>> = {
  it: { push: 'Spinta', pull: 'Trazione', static: 'Statica' },
  es: { push: 'Empuje', pull: 'Traccion', static: 'Estatica' },
  en: { push: 'Push', pull: 'Pull', static: 'Static' },
};

const MECHANIC_LABELS: Record<string, Record<string, string>> = {
  it: { compound: 'Multiarticolare', isolation: 'Isolamento' },
  es: { compound: 'Multiarticular', isolation: 'Aislamiento' },
  en: { compound: 'Compound', isolation: 'Isolation' },
};

const MUSCLE_LABELS: Record<string, Record<string, string>> = {
  it: {
    abdominals: 'Addominali',
    abductors: 'Abduttori',
    adductors: 'Adduttori',
    biceps: 'Bicipiti',
    calves: 'Polpacci',
    chest: 'Petto',
    forearms: 'Avambracci',
    glutes: 'Glutei',
    hamstrings: 'Femorali',
    lats: 'Dorsali',
    'lower back': 'Lombari',
    'middle back': 'Schiena media',
    neck: 'Collo',
    quadriceps: 'Quadricipiti',
    shoulders: 'Spalle',
    traps: 'Trapezi',
    triceps: 'Tricipiti',
  },
  es: {
    abdominals: 'Abdominales',
    abductors: 'Abductores',
    adductors: 'Aductores',
    biceps: 'Biceps',
    calves: 'Pantorrillas',
    chest: 'Pecho',
    forearms: 'Antebrazos',
    glutes: 'Gluteos',
    hamstrings: 'Isquiotibiales',
    lats: 'Dorsales',
    'lower back': 'Lumbares',
    'middle back': 'Espalda media',
    neck: 'Cuello',
    quadriceps: 'Cuadriceps',
    shoulders: 'Hombros',
    traps: 'Trapecios',
    triceps: 'Triceps',
  },
};

type ExerciseDescriptionContentProps = {
  imageUrls?: string[] | null;
  imageUrl?: string | null;
  instructions: string;
  noInstructionsLabel: string;
  instructionsTitle: string;
  historyData: ExerciseHistorySession[];
  secondaryMuscles?: string | null;
  difficulty?: string | null;
  force?: string | null;
  mechanic?: string | null;
};

export default function ExerciseDescriptionContent({
  imageUrls,
  imageUrl,
  instructions,
  noInstructionsLabel,
  instructionsTitle,
  historyData,
  secondaryMuscles,
  difficulty,
  force,
  mechanic,
}: ExerciseDescriptionContentProps) {
  const { i18n, t } = useTranslation();

  const lang = i18n.language.startsWith('es') ? 'es' : i18n.language.startsWith('it') ? 'it' : 'en';

  const translatedForce = useMemo(() => {
    if (!force) return null;
    const key = force.toLowerCase();
    return FORCE_LABELS[lang]?.[key] || force;
  }, [force, lang]);

  const translatedMechanic = useMemo(() => {
    if (!mechanic) return null;
    const key = mechanic.toLowerCase();
    return MECHANIC_LABELS[lang]?.[key] || mechanic;
  }, [mechanic, lang]);

  const translatedSecondaryMuscles = useMemo(() => {
    if (!secondaryMuscles) return [];
    return secondaryMuscles
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m) => {
        const key = m.toLowerCase();
        return MUSCLE_LABELS[lang]?.[key] || m;
      });
  }, [secondaryMuscles, lang]);

  const instructionSteps = useMemo(() => {
    const rawSteps = instructions
      .split(/\n+/)
      .map((step) => step.trim())
      .filter(Boolean);

    if (rawSteps.length > 1) {
      return rawSteps;
    }

    const sentenceSteps = instructions
      .split(/(?<=[.!?])\s+/)
      .map((step) => step.trim())
      .filter(Boolean);

    return sentenceSteps.length > 1 ? sentenceSteps : rawSteps;
  }, [instructions]);

  return (
    <View className="pb-10">
      <ExerciseVideoPlayer imageUrls={imageUrls} imageUrl={imageUrl} />

      <View className="mt-4 bg-black/30 rounded-[28px] p-4 border border-white/5">
        <Text className="text-white text-sm font-black tracking-wide">
          {t('exercises.detail_section_title')}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">{t('exercises.detail_section_subtitle')}</Text>

        <View className="flex-row flex-wrap justify-between mt-4">
          {difficulty ? (
            <View className="w-[48%] mb-3 bg-black/35 rounded-2xl px-4 py-3 border border-white/10">
              <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">
                {t('exercises.detail_difficulty')}
              </Text>
              <Text className="text-white text-sm font-bold capitalize">
                {t(`difficulty.${difficulty}`, difficulty)}
              </Text>
            </View>
          ) : null}

          {translatedForce ? (
            <View className="w-[48%] mb-3 bg-black/35 rounded-2xl px-4 py-3 border border-white/10">
              <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">
                {t('exercises.detail_force')}
              </Text>
              <Text className="text-white text-sm font-bold">{translatedForce}</Text>
            </View>
          ) : null}

          {translatedMechanic ? (
            <View className="w-[48%] mb-3 bg-black/35 rounded-2xl px-4 py-3 border border-white/10">
              <Text className="text-white text-[10px] uppercase font-bold mb-1">
                {t('exercises.detail_mechanic')}
              </Text>
              <Text className="text-white text-sm font-bold">{translatedMechanic}</Text>
            </View>
          ) : null}

          {translatedSecondaryMuscles.length > 0 ? (
            <View className="w-[48%] mb-3 bg-black/35 rounded-2xl px-4 py-3 border border-white/10">
              <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">
                {t('exercises.detail_secondary_muscles')}
              </Text>
              <Text className="text-white text-sm font-bold" numberOfLines={2}>
                {translatedSecondaryMuscles.slice(0, 2).join(', ')}
                {translatedSecondaryMuscles.length > 2 ? '...' : ''}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="mt-4 bg-black/40 rounded-[32px] p-5 border border-white/5 shadow-inner">
        <Text className="text-white text-xl font-black tracking-tight">{instructionsTitle}</Text>
        <Text className="text-gray-400 text-xs mt-1 mb-4">
          {t('exercises.detail_steps_subtitle')}
        </Text>

        {instructionSteps.length > 0 ? (
          <View>
            {instructionSteps.map((step, index) => (
              <View key={`${step}-${index}`} className="flex-row items-start mb-3">
                <View className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-300/20 items-center justify-center mr-3 mt-0.5">
                  <Text className="text-emerald-200 text-[11px] font-black">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-gray-300 text-sm leading-6">{step}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-gray-400 text-sm leading-6">{noInstructionsLabel}</Text>
        )}
      </View>

      <ExerciseCharts historyData={historyData} />
    </View>
  );
}
