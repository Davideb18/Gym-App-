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
import { MediaService } from '../../api/mediaService';
import { useExerciseModal } from '../../store/useExerciseModal';
import { LinearGradient } from 'expo-linear-gradient';
import ExerciseDetailHeader from './detail/ExerciseDetailHeader';
import ExerciseDetailTabs from './detail/ExerciseDetailTabs';
import ExerciseDescriptionContent from './detail/ExerciseDescriptionContent';
import ExerciseHistorySessionCard from './detail/ExerciseHistorySessionCard';

export default function ExerciseDetailModal() {
  const { isOpen, selectedExerciseId, closeModal } = useExerciseModal();
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

  const exName = baseInfo?.name || t('common.loading');
  const exMuscle = baseInfo?.target_muscle_group || baseInfo?.target_muscle || t('exercises.target_muscle_group_mixed');
  const exEquipment = baseInfo?.equipment || t('exercises.equipment_bodyweight');
  const instructions = baseInfo?.instructions || '';

  const handleNotesChange = (sessionId: string, val: string) => {
    setEditingNotes((prev) => ({ ...prev, [sessionId]: val }));
  };

  const saveNotes = (sessionId: string) => {
    if (editingNotes[sessionId] !== undefined) {
      updateNotesMutation.mutate({ sessionId, notes: editingNotes[sessionId] });
    }
  };

  const initialVideoUrl = baseInfo?.video_url || null;
  const realImageUrl = baseInfo?.image_url || null;
  const secondaryMuscles = baseInfo?.secondary_muscles || null;
  const difficulty = baseInfo?.difficulty || null;
  const force = baseInfo?.force || null;
  const mechanic = baseInfo?.mechanic || null;

  return (
    <View className="absolute inset-0 z-[105] elevation-[105]">
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
              <ExerciseDescriptionContent
                initialVideoUrl={initialVideoUrl}
                imageUrl={realImageUrl}
                onRequestVideo={async () => {
                  if (!selectedExerciseId) return null;
                  return MediaService.getVideoUrlForExercise(selectedExerciseId);
                }}
                instructions={instructions}
                secondaryMuscles={secondaryMuscles}
                difficulty={difficulty}
                force={force}
                mechanic={mechanic}
                noInstructionsLabel={t('exercises.no_instructions')}
                instructionsTitle={t('exercises.instructions_title')}
                historyData={historySessions || []}
              />
            )}

            {activeTab === 'history' && (
              <View className="pb-10">
                {loadingHistory ? (
                  <ActivityIndicator size="large" color="#10B981" className="mt-10" />
                ) : historySessions && historySessions.length > 0 ? (
                  historySessions.map((session: any, idx: number) => {
                    const sessionNotes =
                      editingNotes[session.session_id] !== undefined
                        ? editingNotes[session.session_id]
                        : session.notes;

                    return (
                      <ExerciseHistorySessionCard
                        key={`${session.session_id}-${idx}`}
                        session={session}
                        index={idx}
                        locale={i18n.language}
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
                        onChangeNote={handleNotesChange}
                        onSaveNote={saveNotes}
                      />
                    );
                  })
                ) : (
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
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
