import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { History } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { WorkoutService } from '../../api/workoutService';
import type { ExerciseHistorySession } from '../../api/workoutService';
import { useExerciseModal } from '../../store/useExerciseModal';
import { useFormCoachStore } from '../../store/useFormCoachStore';
import { LinearGradient } from 'expo-linear-gradient';
import ExerciseDetailHeader from './detail/ExerciseDetailHeader';
import ExerciseDetailTabs from './detail/ExerciseDetailTabs';
import ExerciseDescriptionContent from './detail/ExerciseDescriptionContent';
import ExerciseHistorySessionCard from './detail/ExerciseHistorySessionCard';

const EXERCISE_NAME_OVERRIDES: Record<string, Record<'it' | 'es', string>> = {
  'hammer curl': {
    it: 'Curl a martello',
    es: 'Curl martillo',
  },
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

const getLocale = (language: string): 'it' | 'es' | 'en' =>
  language.startsWith('es') ? 'es' : language.startsWith('it') ? 'it' : 'en';

const translateExerciseName = (value: string | null | undefined, locale: 'it' | 'es' | 'en') => {
  if (!value) return null;
  const override = EXERCISE_NAME_OVERRIDES[value.trim().toLowerCase()];
  return override?.[locale as 'it' | 'es'] || value;
};

const translateMuscle = (
  value: string | null | undefined,
  locale: 'it' | 'es' | 'en',
  mixedLabel: string,
) => {
  if (!value) return mixedLabel;
  const key = value.toLowerCase().trim();
  return MUSCLE_LABELS[locale]?.[key] || value;
};

const parseMediaUrls = (raw: unknown) => {
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
  }

  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      const decoded = JSON.parse(raw);
      if (Array.isArray(decoded)) {
        return decoded.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
      }
    } catch {
      return [];
    }
  }

  return [];
};

type ExerciseBaseInfo = {
  name?: string | null;
  name_it?: string | null;
  name_es?: string | null;
  target_muscle_group?: string | null;
  target_muscle?: string | null;
  equipment?: string | null;
  instructions?: string | null;
  instructions_it?: string | null;
  instructions_es?: string | null;
  image_url?: string | null;
  videos_data?: unknown;
  secondary_muscles?: string | null;
  difficulty?: string | null;
  force?: string | null;
  mechanic?: string | null;
} | null;

const getLocalizedName = (baseInfo: ExerciseBaseInfo, locale: 'it' | 'es' | 'en') => {
  if (!baseInfo) return null;
  if (locale === 'it') return baseInfo.name_it;
  if (locale === 'es') return baseInfo.name_es;
  return baseInfo.name;
};

const getLocalizedInstructions = (baseInfo: ExerciseBaseInfo, locale: 'it' | 'es' | 'en') => {
  if (!baseInfo) return '';
  if (locale === 'it') return baseInfo.instructions_it || baseInfo.instructions || '';
  if (locale === 'es') return baseInfo.instructions_es || baseInfo.instructions || '';
  return baseInfo.instructions || '';
};

const buildCoachMediaUrls = (parsedImageUrls: string[], realImageUrl: string | null) => {
  if (parsedImageUrls.length > 0) return parsedImageUrls;
  return realImageUrl ? [realImageUrl] : [];
};

const getExerciseViewData = (
  baseInfo: ExerciseBaseInfo,
  locale: 'it' | 'es' | 'en',
  t: (key: string) => string,
) => {
  const localizedBaseName = getLocalizedName(baseInfo, locale);
  const exName =
    translateExerciseName(localizedBaseName, locale) ||
    translateExerciseName(baseInfo?.name, locale) ||
    t('common.loading');
  const rawMuscle = baseInfo?.target_muscle_group || baseInfo?.target_muscle || null;
  const exMuscle = translateMuscle(rawMuscle, locale, t('exercises.target_muscle_group_mixed'));
  const exEquipment = baseInfo?.equipment || t('exercises.equipment_bodyweight');
  const instructions = getLocalizedInstructions(baseInfo, locale);
  const realImageUrl = baseInfo?.image_url || null;

  return {
    exName,
    exMuscle,
    exEquipment,
    instructions,
    realImageUrl,
    parsedImageUrls: parseMediaUrls(baseInfo?.videos_data),
    secondaryMuscles: baseInfo?.secondary_muscles || null,
    difficulty: baseInfo?.difficulty || null,
    force: baseInfo?.force || null,
    mechanic: baseInfo?.mechanic || null,
  };
};

type DescriptionSectionProps = {
  onOpenCoach: () => void;
  t: (key: string) => string;
  parsedImageUrls: string[];
  realImageUrl: string | null;
  instructions: string;
  secondaryMuscles: string | null;
  difficulty: string | null;
  force: string | null;
  mechanic: string | null;
  historySessions: ExerciseHistorySession[] | undefined;
};

function DescriptionSection({
  onOpenCoach,
  t,
  parsedImageUrls,
  realImageUrl,
  instructions,
  secondaryMuscles,
  difficulty,
  force,
  mechanic,
  historySessions,
}: DescriptionSectionProps) {
  return (
    <>
      <TouchableOpacity
        onPress={onOpenCoach}
        className="mb-4 bg-[#10B981]/20 border border-[#10B981]/35 rounded-2xl p-4"
      >
        <Text className="text-[#A7F3D0] text-[10px] font-black uppercase tracking-widest mb-1">
          Nuova funzione
        </Text>
        <Text className="text-[#10B981] font-black text-sm uppercase tracking-widest">
          Coach Tecnica
        </Text>
        <Text className="text-gray-300 text-xs mt-1">
          Avvia analisi guidata con feedback live su postura, ripetizioni ed errori.
        </Text>
      </TouchableOpacity>

      <ExerciseDescriptionContent
        imageUrls={parsedImageUrls}
        imageUrl={realImageUrl}
        instructions={instructions}
        secondaryMuscles={secondaryMuscles}
        difficulty={difficulty}
        force={force}
        mechanic={mechanic}
        noInstructionsLabel={t('exercises.no_instructions')}
        instructionsTitle={t('exercises.instructions_title')}
        historyData={historySessions || []}
      />
    </>
  );
}

type HistorySectionProps = {
  loadingHistory: boolean;
  historySessions: ExerciseHistorySession[] | undefined;
  editingNotes: Record<string, string>;
  updateNotesMutation: {
    isPending: boolean;
    variables?: { sessionId?: string };
  };
  i18nLanguage: string;
  t: (key: string) => string;
  onChangeNote: (sessionId: string, val: string) => void;
  onSaveNote: (sessionId: string) => void;
};

function HistorySection({
  loadingHistory,
  historySessions,
  editingNotes,
  updateNotesMutation,
  i18nLanguage,
  t,
  onChangeNote,
  onSaveNote,
}: HistorySectionProps) {
  if (loadingHistory) {
    return <ActivityIndicator size="large" color="#10B981" className="mt-10" />;
  }

  if (!historySessions || historySessions.length === 0) {
    return (
      <View className="bg-black/40 rounded-[32px] p-8 items-center justify-center border border-white/5 mt-6 border-dashed">
        <View className="bg-white/5 w-16 h-16 rounded-full items-center justify-center mb-4 border border-white/10">
          <History size={24} color="#666" />
        </View>
        <Text className="text-white font-black text-lg mb-1 tracking-tight">
          {t('exercises.no_history_title')}
        </Text>
        <Text className="text-gray-500 text-xs text-center">
          {t('exercises.no_history_subtitle')}
        </Text>
      </View>
    );
  }

  return (
    <>
      {historySessions.map((session, idx: number) => {
        const sessionNotes =
          editingNotes[session.session_id] !== undefined
            ? editingNotes[session.session_id]
            : session.notes;

        return (
          <ExerciseHistorySessionCard
            key={`${session.session_id}-${idx}`}
            session={session}
            index={idx}
            locale={i18nLanguage}
            labels={{
              session: t('exercises.session_label'),
              set: t('exercises.set_label'),
              weight: t('exercises.weight_label'),
              reps: t('exercises.reps_label'),
              notes: t('exercises.notes_label'),
              notesPlaceholder: t('exercises.notes_placeholder'),
            }}
            noteValue={sessionNotes}
            noteChanged={
              editingNotes[session.session_id] !== undefined &&
              editingNotes[session.session_id] !== session.notes
            }
            saving={
              updateNotesMutation.isPending &&
              updateNotesMutation.variables?.sessionId === session.session_id
            }
            onChangeNote={onChangeNote}
            onSaveNote={onSaveNote}
          />
        );
      })}
    </>
  );
}

type ExerciseDetailModalViewProps = {
  closeModal: () => void;
  loadingInfo: boolean;
  exName: string;
  exMuscle: string;
  exEquipment: string;
  activeTab: 'descrizione' | 'history';
  setActiveTab: (tab: 'descrizione' | 'history') => void;
  t: (key: string) => string;
  handleOpenCoach: () => void;
  parsedImageUrls: string[];
  realImageUrl: string | null;
  instructions: string;
  secondaryMuscles: string | null;
  difficulty: string | null;
  force: string | null;
  mechanic: string | null;
  historySessions: ExerciseHistorySession[] | undefined;
  loadingHistory: boolean;
  editingNotes: Record<string, string>;
  updateNotesMutation: {
    isPending: boolean;
    variables?: { sessionId?: string };
  };
  i18nLanguage: string;
  handleNotesChange: (sessionId: string, val: string) => void;
  saveNotes: (sessionId: string) => void;
};

function ExerciseDetailModalView({
  closeModal,
  loadingInfo,
  exName,
  exMuscle,
  exEquipment,
  activeTab,
  setActiveTab,
  t,
  handleOpenCoach,
  parsedImageUrls,
  realImageUrl,
  instructions,
  secondaryMuscles,
  difficulty,
  force,
  mechanic,
  historySessions,
  loadingHistory,
  editingNotes,
  updateNotesMutation,
  i18nLanguage,
  handleNotesChange,
  saveNotes,
}: ExerciseDetailModalViewProps) {
  return (
    <View className="absolute inset-0 z-[130] elevation-[130]">
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center' }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '93%',
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={['#171717', '#D1D5DB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <LinearGradient
          colors={['rgba(16,185,129,0.1)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.1)',
          }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <View className="w-full items-center pt-3 pb-2">
            <View className="w-12 h-1.5 bg-white/30 rounded-full" />
          </View>

          <ExerciseDetailHeader
            loading={loadingInfo}
            name={exName}
            muscle={exMuscle}
            equipment={exEquipment}
            onClose={closeModal}
          />

          <ExerciseDetailTabs
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            descriptionLabel={t('exercises.tab_description')}
            historyLabel={t('exercises.tab_history')}
          />

          <ScrollView
            className="flex-1 px-6 pt-6"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'descrizione' && (
              <DescriptionSection
                onOpenCoach={handleOpenCoach}
                t={t}
                parsedImageUrls={parsedImageUrls}
                realImageUrl={realImageUrl}
                instructions={instructions}
                secondaryMuscles={secondaryMuscles}
                difficulty={difficulty}
                force={force}
                mechanic={mechanic}
                historySessions={historySessions}
              />
            )}

            {activeTab === 'history' && (
              <View className="pb-10">
                <HistorySection
                  loadingHistory={loadingHistory}
                  historySessions={historySessions}
                  editingNotes={editingNotes}
                  updateNotesMutation={updateNotesMutation}
                  i18nLanguage={i18nLanguage}
                  t={t}
                  onChangeNote={handleNotesChange}
                  onSaveNote={saveNotes}
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

export default function ExerciseDetailModal() {
  const { isOpen, selectedExerciseId, closeModal } = useExerciseModal();
  const openCoach = useFormCoachStore((s) => s.openCoach);
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'descrizione' | 'history'>('descrizione');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setActiveTab('descrizione');
      setEditingNotes({});
    }
  }, [isOpen]);

  const { data: baseInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ['exerciseBaseInfo', selectedExerciseId],
    queryFn: () => WorkoutService.getExerciseBaseInfo(selectedExerciseId!),
    enabled: !!selectedExerciseId && isOpen,
  });

  const { data: historySessions, isLoading: loadingHistory } = useQuery({
    queryKey: ['exerciseHistory', selectedExerciseId],
    queryFn: () => WorkoutService.getExerciseHistory(selectedExerciseId!),
    enabled: !!selectedExerciseId && isOpen,
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ sessionId, notes }: { sessionId: string; notes: string }) =>
      WorkoutService.updateSessionNotes(sessionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseHistory', selectedExerciseId] });
    },
  });

  if (!isOpen) return null;

  const locale = getLocale(i18n.language);

  const {
    exName,
    exMuscle,
    exEquipment,
    instructions,
    realImageUrl,
    parsedImageUrls,
    secondaryMuscles,
    difficulty,
    force,
    mechanic,
  } = getExerciseViewData(baseInfo, locale, t);

  const handleNotesChange = (sessionId: string, val: string) => {
    setEditingNotes((prev) => ({ ...prev, [sessionId]: val }));
  };

  const saveNotes = (sessionId: string) => {
    if (editingNotes[sessionId] !== undefined) {
      updateNotesMutation.mutate({ sessionId, notes: editingNotes[sessionId] });
    }
  };

  const handleOpenCoach = () => {
    if (!selectedExerciseId) return;
    const coachMediaUrls = buildCoachMediaUrls(parsedImageUrls, realImageUrl);
    openCoach({
      exerciseId: selectedExerciseId,
      exerciseName: exName,
      mediaUrl: coachMediaUrls[0] || null,
      mediaUrls: coachMediaUrls,
    });
    closeModal();
  };

  return (
    <ExerciseDetailModalView
      closeModal={closeModal}
      loadingInfo={loadingInfo}
      exName={exName}
      exMuscle={exMuscle}
      exEquipment={exEquipment}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      t={t}
      handleOpenCoach={handleOpenCoach}
      parsedImageUrls={parsedImageUrls}
      realImageUrl={realImageUrl}
      instructions={instructions}
      secondaryMuscles={secondaryMuscles}
      difficulty={difficulty}
      force={force}
      mechanic={mechanic}
      historySessions={historySessions}
      loadingHistory={loadingHistory}
      editingNotes={editingNotes}
      updateNotesMutation={updateNotesMutation}
      i18nLanguage={i18n.language}
      handleNotesChange={handleNotesChange}
      saveNotes={saveNotes}
    />
  );
}
