// frontend/src/components/workout/SmartWorkoutWidget.tsx
import React from 'react';
import { TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { LiveExercise, LiveSet, useActiveWorkout } from '../../store/useActiveWorkout';
import { useRestTimer } from '../../store/useRestTimer';
import { parseFlexibleNumber } from '../../utils/numberUtils';
import SmartWorkoutRestPanel from './active/SmartWorkoutRestPanel';
import SmartWorkoutCurrentSetPanel from './active/SmartWorkoutCurrentSetPanel';

interface SmartWorkoutWidgetProps {
  onPressExpand: () => void;
}
export default function SmartWorkoutWidget({ onPressExpand }: SmartWorkoutWidgetProps) {
  const { t } = useTranslation();
  const { isActive: workoutActive, exercises, updateSet, toggleSetComplete } = useActiveWorkout();
  const { isActive: timerActive, timeLeft, addTime, reduceTime, skipTimer } = useRestTimer();

  if (!workoutActive) return null;

  // Trova il Set corrente
  let currentExercise: LiveExercise | null = null;
  let currentSet: LiveSet | null = null;
  let nextExercise: LiveExercise | null = null;
  let nextSet: LiveSet | null = null;

  let foundCurrent = false;

  for (let i = 0; i < exercises.length; i++) {
    for (let j = 0; j < exercises[i].sets.length; j++) {
      const s = exercises[i].sets[j];
      if (!s.is_completed) {
        if (!foundCurrent) {
          currentExercise = exercises[i];
          currentSet = s;
          foundCurrent = true;
        } else if (!nextSet) {
          nextExercise = exercises[i];
          nextSet = s;
        }
      }
    }
  }

  // Fallback se tutti completati
  if (!currentExercise && exercises.length > 0) {
    currentExercise = exercises[exercises.length - 1];
    currentSet = currentExercise.sets[currentExercise.sets.length - 1];
  }

  const handleCheck = () => {
    if (currentExercise && currentSet) {
      toggleSetComplete(currentExercise.id, currentSet.id);
    }
  };

  const getSetColor = (type: string) => {
    switch (type) {
      case 'warmup':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
      case 'normal':
        return 'bg-white/10 text-gray-300 border-white/10';
      case 'failure':
        return 'bg-red-500/20 text-red-500 border-red-500/20';
      case 'dropset':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
      case 'backoff':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
      case 'superset':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/20';
      case 'cluster':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-white/10 text-gray-400 border-white/10';
    }
  };

  const restMinutes = Math.floor(timeLeft / 60);
  const restSeconds = timeLeft % 60;
  const restString = `${restMinutes}:${restSeconds.toString().padStart(2, '0')}`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'position' : undefined}
      keyboardVerticalOffset={10}
      className="absolute bottom-[110px] left-3 right-3 z-[990] shadow-2xl shadow-black/80"
      pointerEvents="box-none"
    >
      <TouchableOpacity activeOpacity={1} onPress={onPressExpand}>
        <BlurView
          intensity={100}
          tint="dark"
          className="rounded-[32px] border border-white/10 overflow-hidden bg-black/40 mx-1 shadow-lg shadow-black/50"
        >
          {timerActive ? (
            <SmartWorkoutRestPanel
              restString={restString}
              restLabel={t('active_workout.rest')}
              nextLabel={t('active_workout.next')}
              setLabel={t('exercises.set_label')}
              repsLabel={t('exercises.reps_label')}
              weightLabel={t('exercises.weight_label')}
              nextExerciseName={nextExercise?.exercise_name}
              nextSetType={nextSet?.set_type}
              nextSetNumber={nextSet?.set_number}
              nextSetTargetReps={nextSet?.target_reps}
              nextSetTargetWeight={nextSet?.target_weight}
              getSetColor={getSetColor}
              difficultyLabel={(type) => t(`difficulty.${type}`)}
              onReduce={() => reduceTime(15)}
              onAdd={() => addTime(15)}
              onSkip={skipTimer}
            />
          ) : (
            <SmartWorkoutCurrentSetPanel
              currentExercise={currentExercise}
              currentSet={currentSet}
              setLabel={t('exercises.set_label')}
              repsLabel={t('exercises.reps_label')}
              weightLabel={t('exercises.weight_label')}
              finishedLabel={t('active_workout.finished')}
              difficultyLabel={(type) => t(`difficulty.${type}`)}
              getSetColor={getSetColor}
              parseNumber={parseFlexibleNumber}
              onUpdateSet={updateSet}
              onCheck={handleCheck}
            />
          )}
        </BlurView>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
