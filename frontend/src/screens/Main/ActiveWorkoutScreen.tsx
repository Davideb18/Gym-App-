import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Loader2 } from 'lucide-react-native';
import { useActiveWorkout } from '../../store/useActiveWorkout';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutService } from '../../api/workoutService';
import { useRestTimer } from '../../store/useRestTimer';
import { useExerciseModal } from '../../store/useExerciseModal';
import { useWorkoutSummaryStore } from '../../store/useWorkoutSummaryStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { usePrCelebrationStore } from '../../store/usePrCelebrationStore';
import { parseFlexibleNumber } from '../../utils/numberUtils';
import ActiveWorkoutHeader from '../../components/workout/active/ActiveWorkoutHeader';
import ActiveWorkoutRestTimer from '../../components/workout/active/ActiveWorkoutRestTimer';
import ActiveWorkoutExerciseCard from '../../components/workout/active/ActiveWorkoutExerciseCard';

export default function ActiveWorkoutScreen() {
  const {
    isActive,
    isExpanded,
    setIsExpanded,
    routineName,
    exercises,
    startTime,
    updateSet,
    applyLastPerformance,
    toggleSetComplete,
    finishWorkout,
    cancelWorkout,
  } = useActiveWorkout();
  const { t } = useTranslation();
  const { isActive: timerActive, timeLeft, addTime, reduceTime, skipTimer } = useRestTimer();
  const { openExercise } = useExerciseModal();
  const { session } = useAuthStore();
  const queryClient = useQueryClient();
  const { openCelebration } = usePrCelebrationStore();
  const [isSaving, setIsSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bestE1rmByExercise, setBestE1rmByExercise] = useState<Record<string, number>>({});
  const celebratedSetIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!startTime) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime]);

  const exerciseIds = exercises.map((ex) => ex.exercise_id).filter(Boolean);

  const { data: lastPerformanceMap } = useQuery({
    queryKey: ['lastPerformanceByExercisesMap', session?.user?.id, exerciseIds.join('|')],
    queryFn: async () =>
      WorkoutService.getLastPerformanceByExercises(session!.user!.id, exerciseIds),
    enabled: !!session?.user?.id && isActive && exerciseIds.length > 0,
    staleTime: 60 * 1000,
  });

  const { data: bestE1rmMap } = useQuery({
    queryKey: ['bestE1rmByExercisesMap', session?.user?.id, exerciseIds.join('|')],
    queryFn: async () => WorkoutService.getBestE1RMByExercises(session!.user!.id, exerciseIds),
    enabled: !!session?.user?.id && isActive && exerciseIds.length > 0,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!lastPerformanceMap || !isActive) return;
    applyLastPerformance(lastPerformanceMap);
  }, [lastPerformanceMap, isActive, applyLastPerformance]);

  useEffect(() => {
    if (!bestE1rmMap || !isActive) return;
    setBestE1rmByExercise(bestE1rmMap);
  }, [bestE1rmMap, isActive]);

  const e1rm = (weight: number, reps: number) => {
    if (!Number.isFinite(weight) || !Number.isFinite(reps) || weight <= 0 || reps <= 0) return 0;
    return weight * (1 + reps / 30);
  };

  const deriveMuscleGroups = (exerciseNames: string[]) => {
    const groups = [
      { name: 'Chest', count: 0, color: '#F59E0B', keywords: ['chest', 'pector', 'bench', 'press', 'dip'] },
      { name: 'Back', count: 0, color: '#3B82F6', keywords: ['back', 'row', 'pull', 'lat', 'deadlift'] },
      { name: 'Legs', count: 0, color: '#10B981', keywords: ['squat', 'leg', 'lunge', 'deadlift', 'press'] },
      { name: 'Shoulders', count: 0, color: '#8B5CF6', keywords: ['shoulder', 'press', 'raise', 'deltoid', 'overhead'] },
      { name: 'Arms', count: 0, color: '#EF4444', keywords: ['curl', 'biceps', 'triceps', 'pushdown', 'skull'] },
      { name: 'Core', count: 0, color: '#F97316', keywords: ['core', 'plank', 'crunch', 'ab', 'sit'] },
    ];

    exerciseNames.forEach((name) => {
      const normalized = name.toLowerCase();
      groups.forEach((group) => {
        if (group.keywords.some((keyword) => normalized.includes(keyword))) {
          group.count += 1;
        }
      });
    });

    return groups.filter((group) => group.count > 0).sort((a, b) => b.count - a.count);
  };

  const buildCoachTips = (payload: {
    totalVolume: number;
    completedSets: number;
    timeString: string;
    newPrs: number;
    muscleGroups: number;
  }) => {
    const tips: string[] = [];
    const totalMinutes = Number(payload.timeString.slice(0, 2)) * 60 + Number(payload.timeString.slice(3, 5));

    if (payload.newPrs > 0) {
      tips.push('Hai fatto nuovi record. Mantieni carichi e tecnica per 1-2 sessioni prima di forzare ancora.');
    }
    if (totalMinutes >= 75 && payload.completedSets < 10) {
      tips.push('Sessione lunga con poche serie: valuta recuperi piu puliti o superserie mirate.');
    }
    if (payload.totalVolume >= 8000) {
      tips.push('Buon volume di lavoro: questa e una sessione solida per accumulo di stimolo.');
    } else if (payload.totalVolume > 0) {
      tips.push('Volume contenuto ma utile: perfetto se stai cercando qualita e controllo.');
    }
    if (payload.muscleGroups >= 4) {
      tips.push('Hai coperto molti gruppi: ottimo bilanciamento generale del workout.');
    }

    return tips.slice(0, 3);
  };

  const timeString = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  let totalVolume = 0,
    completedSets = 0,
    totalSets = 0;
  exercises.forEach((ex) =>
    ex.sets.forEach((set) => {
      totalSets++;
      if (set.is_completed) {
        completedSets++;
        if (set.real_weight && set.real_reps) totalVolume += set.real_weight * set.real_reps;
      }
    }),
  );

  const handleFinish = () =>
    Alert.alert(t('active_workout.finish_title'), t('active_workout.finish_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('active_workout.finish'),
        onPress: async () => {
          if (!session?.user?.id || !startTime) return;
          setIsSaving(true);
          try {
            const saveResult = await WorkoutService.saveCompletedSession(
              session.user.id,
              useActiveWorkout.getState().templateId,
              startTime,
              totalVolume,
              exercises,
            );

            const summaryExercises = exercises
              .map((ex) => ({
                name: ex.exercise_name,
                setsCompleted: ex.sets.filter((s) => s.is_completed).length,
                totalVolume: ex.sets.reduce((acc, set) => {
                  if (!set.is_completed) return acc;
                  const reps = Number(set.real_reps) || 0;
                  const weight = Number(set.real_weight) || 0;
                  return acc + reps * weight;
                }, 0),
              }))
              .filter((ex) => ex.setsCompleted > 0);

            const summaryData = {
              timeString,
              totalVolume,
              completedSets,
              routineName: useActiveWorkout.getState().routineName,
              exercises: summaryExercises,
              exerciseVolumeBars: summaryExercises
                .slice(0, 6)
                .map((ex) => ({ label: ex.name.length > 9 ? `${ex.name.slice(0, 8)}…` : ex.name, value: Math.max(1, Math.round(ex.totalVolume / 100)) })),
              newPrs: saveResult.newPrs || [],
              muscleGroups: deriveMuscleGroups(summaryExercises.map((ex) => ex.name)),
              coachTips: buildCoachTips({
                totalVolume,
                completedSets,
                timeString,
                newPrs: saveResult.newPrs?.length || 0,
                muscleGroups: deriveMuscleGroups(summaryExercises.map((ex) => ex.name)).length,
              }),
            };

            finishWorkout();

            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['recentSessions', session.user.id] }),
              queryClient.invalidateQueries({ queryKey: ['personalRecords', session.user.id] }),
              queryClient.invalidateQueries({
                queryKey: ['completedWorkoutCount', session.user.id],
              }),
              queryClient.invalidateQueries({
                queryKey: ['profileProgressionSessions', session.user.id],
              }),
            ]);

            useWorkoutSummaryStore.getState().openSummary(summaryData);
          } catch {
            Alert.alert(t('common.error'), t('active_workout.save_error'));
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);

  const handleToggleSetComplete = (exerciseLocalId: string, setId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseLocalId);
    const set = exercise?.sets.find((s) => s.id === setId);

    if (!exercise || !set) {
      toggleSetComplete(exerciseLocalId, setId);
      return;
    }

    const isCompleting = !set.is_completed;
    toggleSetComplete(exerciseLocalId, setId);
    if (!isCompleting) return;
    if (celebratedSetIdsRef.current.has(set.id)) return;

    const reps = Number(set.real_reps);
    const weight = Number(set.real_weight);
    if (!Number.isFinite(reps) || !Number.isFinite(weight) || reps <= 0 || weight <= 0) return;

    const currentScore = e1rm(weight, reps);
    const historicalBest = bestE1rmByExercise[exercise.exercise_id] || 0;

    if (currentScore > historicalBest + 0.2) {
      celebratedSetIdsRef.current.add(set.id);
      setBestE1rmByExercise((prev) => ({
        ...prev,
        [exercise.exercise_id]: currentScore,
      }));
      openCelebration([
        {
          exerciseName: exercise.exercise_name,
          weight,
          reps,
          e1rm: currentScore,
        },
      ]);
    }
  };

  const handleAbort = () =>
    Alert.alert(t('active_workout.abort'), t('active_workout.abort_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('active_workout.abort'), style: 'destructive', onPress: cancelWorkout },
    ]);

  if (!isActive || !isExpanded) return null;

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
      {/* Gradiente pieno — stesso dell'app */}
      <LinearGradient
        colors={['#171717', '#D1D5DB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <LinearGradient
        colors={['rgba(16,185,129,0.2)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ActiveWorkoutHeader
            routineName={routineName}
            timeString={timeString}
            completedSets={completedSets}
            totalSets={totalSets}
            totalVolume={totalVolume}
            onCollapse={() => setIsExpanded(false)}
            onFinish={handleFinish}
            finishLabel={t('active_workout.finish')}
          />

          {/* LISTA ESERCIZI */}
          <ScrollView
            className="flex-1 px-4 mt-4"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {exercises.map((exercise, idx) => (
              <ActiveWorkoutExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={idx}
                difficultyLabel={(setType) => t(`difficulty.${setType}`)}
                parseNumber={parseFlexibleNumber}
                onOpenExercise={openExercise}
                onUpdateSet={updateSet}
                onToggleSet={handleToggleSetComplete}
              />
            ))}

            <View className="h-32 items-center justify-center">
              <TouchableOpacity
                onPress={handleAbort}
                className="py-4 px-12 bg-red-600 rounded-full shadow-lg shadow-red-900/40 border border-red-500/50"
              >
                <Text className="text-white font-black uppercase tracking-[3px] text-xs">
                  {t('active_workout.abort')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {timerActive && (
            <ActiveWorkoutRestTimer
              timeLeft={timeLeft}
              restLabel={t('active_workout.rest')}
              onReduce={() => reduceTime(15)}
              onAdd={() => addTime(15)}
              onSkip={skipTimer}
            />
          )}

          {/* OVERLAY SALVATAGGIO */}
          {isSaving && (
            <View
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
              }}
            >
              <View className="bg-black/90 px-8 py-5 rounded-3xl border border-white/10 flex-row items-center">
                <Loader2 size={22} color="#FFF" style={{ marginRight: 12 }} />
                <Text className="text-white text-base font-black">
                  {t('active_workout.saving')}
                </Text>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
