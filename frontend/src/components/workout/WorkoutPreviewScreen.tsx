// frontend/src/components/workout/WorkoutPreviewScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { X, Play, Clock, Flame, Dumbbell, Edit3, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useActiveWorkout } from '../../store/useActiveWorkout';
import { useExerciseModal } from '../../store/useExerciseModal';
import { useWorkoutPreviewStore } from '../../store/useWorkoutPreviewStore';
import { useCreateRoutineStore } from '../../store/useCreateRoutineStore';
import { WorkoutTemplate, Exercise } from '../../../../shared/types';
import { supabase } from '../../api/supabaseClient';

export default function WorkoutPreviewScreen() {
  const { isOpen, templateId, closePreview } = useWorkoutPreviewStore();
  const { t } = useTranslation();
  const { openEdit } = useCreateRoutineStore();
  const startWorkout = useActiveWorkout((s) => s.startWorkout);
  const isActiveWorkout = useActiveWorkout((s) => s.isActive);
  const { openExercise } = useExerciseModal();

  const {
    data: template,
    isLoading,
    isError,
  } = useQuery<WorkoutTemplate>({
    queryKey: ['template_details', templateId],
    queryFn: async () => {
      if (!templateId) throw new Error('ID mancante');
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*, workout_template_exercises(*, workout_template_sets(*), exercises(*))')
        .eq('id', templateId)
        .single();
      if (error) throw error;
      return data as unknown as WorkoutTemplate;
    },
    enabled: !!templateId && isOpen,
  });

  const handleStart = () => {
    if (!template) return;
    if (isActiveWorkout) {
      Alert.alert(t('active_workout.finish_title'), t('active_workout.abort_confirm'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.save'),
          style: 'destructive',
          onPress: () => {
            startWorkout(template);
            closePreview();
          },
        },
      ]);
    } else {
      startWorkout(template);
      closePreview();
    }
  };

  const handleEdit = () => {
    if (template) {
      // Open the editor first to avoid a visible flash where preview closes before edit mounts.
      openEdit(template);
      closePreview();
    }
  };

  if (!isOpen) return null;

  const totalExercises = template?.workout_template_exercises?.length || 0;
  const totalSets =
    template?.workout_template_exercises?.reduce(
      (acc, ex) => acc + (ex.workout_template_sets?.length || 0),
      0,
    ) || 0;

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={closePreview}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
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
        {/* Gradiente unico su tutta la modale */}
        <LinearGradient
          colors={['#171717', '#D1D5DB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <LinearGradient
          colors={['rgba(16,185,129,0.3)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180 }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(16,185,129,0.5)',
          }}
        />

        <View style={{ flex: 1 }}>
          {/* Handle */}
          <View className="w-full items-center pt-3 pb-1">
            <View className="w-12 h-1.5 bg-white/30 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row justify-between items-center px-6 mb-3 mt-1">
            <TouchableOpacity
              onPress={closePreview}
              className="bg-white/10 p-2.5 rounded-full border border-white/10"
            >
              <X size={22} color="#FFF" />
            </TouchableOpacity>
            <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <Text className="text-white/80 font-black uppercase text-[10px] tracking-widest">
                {t('active_workout.in_progress')}
              </Text>
            </View>
            <View style={{ width: 42 }} />
          </View>

          {/* Titolo + meta */}
          <View className="px-6 pb-5">
            {isLoading ? (
              <Text className="text-gray-400 font-bold">{t('common.loading')}</Text>
            ) : (
              <Text
                className="text-white font-black text-4xl tracking-tighter leading-tight"
                numberOfLines={2}
              >
                {template?.name || t('common.error')}
              </Text>
            )}
            {!isLoading && !isError && (
              <View className="flex-row items-center mt-3 gap-x-3">
                <View className="flex-row items-center bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                  <Clock size={15} color="#A0AEC0" />
                  <Text className="text-gray-300 font-bold text-xs ml-1.5">
                    ~{(totalSets * 3.5).toFixed(0)} min
                  </Text>
                </View>
                <View className="flex-row items-center bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                  <Flame size={15} color="#A0AEC0" />
                  <Text className="text-gray-300 font-bold text-xs ml-1.5">
                    {totalSets} set · {totalExercises} ex
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Lista esercizi — scorribile, senza pannello separato */}
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          >
            {isError && (
              <Text className="text-red-400 font-bold mb-4">{t('workouts.delete_error')}</Text>
            )}
            {!isLoading && template?.workout_template_exercises
              ? template.workout_template_exercises
                  .sort((a, b) => a.exercise_order - b.exercise_order)
                  .map((te, idx) => {
                    const ex = te.exercises as unknown as Exercise;
                    return (
                      <View
                        key={te.id}
                        className="bg-black/25 rounded-[28px] p-4 mb-4 border border-white/10"
                      >
                        <View className="flex-row items-center mb-3">
                          <View className="bg-white/10 w-7 h-7 rounded-full items-center justify-center mr-3 border border-white/10">
                            <Text className="font-black text-white text-xs">{idx + 1}</Text>
                          </View>
                          {ex?.image_url ? (
                            <Image
                              source={{ uri: ex.image_url }}
                              style={{ width: 44, height: 44, borderRadius: 12, marginRight: 12 }}
                            />
                          ) : (
                            <View className="w-11 h-11 rounded-xl bg-white/5 items-center justify-center mr-3 border border-white/10">
                              <Dumbbell size={18} color="#666" />
                            </View>
                          )}
                          <View className="flex-1">
                            <TouchableOpacity onPress={() => ex?.id && openExercise(ex.id)}>
                              <Text className="font-black text-white text-base tracking-tight leading-tight">
                                {ex?.name || t('workouts.exercise')}
                              </Text>
                            </TouchableOpacity>
                            <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mt-0.5">
                              {ex?.target_muscle || t('exercises.target_muscle')}
                            </Text>
                          </View>
                        </View>
                        <View className="bg-black/30 rounded-xl p-3 border border-white/5">
                          <View className="flex-row pb-2 mb-1 border-b border-white/5">
                            <Text className="text-gray-500 font-black text-[9px] uppercase w-9 text-center">
                              Set
                            </Text>
                            <Text className="text-gray-500 font-black text-[9px] uppercase flex-1 text-center">
                              Tipo
                            </Text>
                            <Text className="text-gray-500 font-black text-[9px] uppercase w-14 text-center">
                              Reps
                            </Text>
                            <Text className="text-gray-500 font-black text-[9px] uppercase w-14 text-center">
                              Rest
                            </Text>
                          </View>
                          {te.workout_template_sets
                            ?.sort((a, b) => a.set_number - b.set_number)
                            .map((ts) => (
                              <View
                                key={ts.id}
                                className="flex-row items-center py-2 border-b border-white/[0.03]"
                              >
                                <Text className="text-white font-black text-xs w-9 text-center">
                                  {ts.set_number}
                                </Text>
                                <View className="flex-1 items-center">
                                  <View
                                    className={`px-2 py-1 rounded-md ${ts.set_type === 'normal' ? 'bg-white/10' : 'bg-yellow-500/20'}`}
                                  >
                                    <Text
                                      className={`text-[8px] font-black uppercase tracking-widest ${ts.set_type === 'normal' ? 'text-gray-300' : 'text-yellow-400'}`}
                                    >
                                      {t(`difficulty.${ts.set_type}`)}
                                    </Text>
                                  </View>
                                </View>
                                <Text className="text-white font-black text-xs w-14 text-center">
                                  {ts.target_reps_max || '-'}
                                </Text>
                                <Text className="text-gray-400 font-bold text-xs w-14 text-center">
                                  {ts.rest_seconds}s
                                </Text>
                              </View>
                            ))}
                        </View>
                      </View>
                    );
                  })
              : null}
          </ScrollView>

          {/* Bottoni azione — parte del flusso, no BlurView separato */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 24,
              paddingBottom: 36,
              paddingTop: 10,
              flexDirection: 'row',
              gap: 12,
              backgroundColor: 'transparent',
            }}
          >
            <TouchableOpacity
              onPress={handleEdit}
              style={{
                flex: 0.28,
                height: 60,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
              activeOpacity={0.7}
            >
              <Edit3 size={22} color="#FFF" />
            </TouchableOpacity>
            {isActiveWorkout ? (
              <View
                style={{
                  flex: 0.72,
                  height: 60,
                  backgroundColor: '#1F2937',
                  borderRadius: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#374151',
                }}
              >
                <Lock size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontWeight: '900',
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                  }}
                >
                  {t('active_workout.in_progress')}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleStart}
                disabled={isLoading || isError}
                style={{
                  flex: 0.72,
                  height: 60,
                  backgroundColor: isLoading || isError ? 'rgba(255,255,255,0.15)' : '#10B981',
                  borderRadius: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.85}
              >
                {!isLoading && !isError && (
                  <Play size={20} color="#000" fill="#000" style={{ marginRight: 10 }} />
                )}
                <Text
                  style={{
                    color: isLoading || isError ? '#FFF' : '#000',
                    fontWeight: '900',
                    fontSize: 15,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                  }}
                >
                  {isLoading ? t('common.loading') : t('active_workout.start')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
