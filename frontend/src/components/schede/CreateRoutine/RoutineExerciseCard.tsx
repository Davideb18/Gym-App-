import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Trash2, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { DraftExercise } from '../../../hooks/useWorkoutCreation';
import RoutineSetRow from './RoutineSetRow';

interface Props {
  exerciseDraft: DraftExercise;
  index: number;
  compactMode?: boolean;
  isHighlightedDrag?: boolean;
  onActivateReorder: () => void;
  onOpenExerciseInfo: (exercise: any) => void;
  removeExercise: (exId: string) => void;
  updateExerciseNotes: (exId: string, notes: string) => void;
  addSet: (exId: string) => void;
  removeSet: (exId: string, setId: string) => void;
  updateSetField: (exId: string, setId: string, field: any, value: any) => void;
  onOpenSetTypeSelector: (exId: string, setId: string) => void;
}

export default function RoutineExerciseCard({
  exerciseDraft,
  index,
  compactMode = false,
  isHighlightedDrag = false,
  onActivateReorder,
  onOpenExerciseInfo,
  removeExercise,
  updateExerciseNotes,
  addSet,
  removeSet,
  updateSetField,
  onOpenSetTypeSelector,
}: Props) {
  const { t } = useTranslation();
  const { localId, exercise, notes, sets } = exerciseDraft;

  return (
    <View
      className={`rounded-3xl p-4 mb-4 shadow-md shadow-black/20 border ${isHighlightedDrag ? 'bg-[#10B981]/20 border-[#10B981]/40' : 'bg-black/40 border-white/10'}`}
      style={[
        isHighlightedDrag ? { zIndex: 50, elevation: 50 } : {},
        compactMode ? { minHeight: 60 } : {},
      ]}
    >
      <View className={`flex-row justify-between items-center ${compactMode ? 'mb-0' : 'mb-4'}`}>
        <TouchableOpacity
          className={`flex-1 ${compactMode ? '' : 'mr-2'}`}
          onPress={compactMode ? undefined : () => onOpenExerciseInfo(exercise)}
          onLongPress={onActivateReorder}
          delayLongPress={0}
        >
          <Text className="text-lg font-black text-white" numberOfLines={2}>
            {index + 1}. {exercise.name}
          </Text>
          {compactMode ? null : (
            <Text className="text-[10px] text-gray-400 mt-1">
              {t('create_routine.reorder_hint')}
            </Text>
          )}
        </TouchableOpacity>

        {compactMode ? null : (
          <TouchableOpacity
            onPress={() => removeExercise(localId)}
            className="bg-red-50 p-2 rounded-full border border-red-100"
          >
            <Trash2 size={16} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      {compactMode ? null : (
        <>
          <TextInput
            value={notes}
            onChangeText={(text) => updateExerciseNotes(localId, text)}
            placeholder={t('create_routine.notes_placeholder_exercise')}
            placeholderTextColor="#9ca3af"
            className="bg-black/30 p-3 rounded-xl mb-4 text-sm font-medium text-gray-200 border border-white/10"
          />

          {/* SETS HEADER */}
          <View className="flex-row mb-2 px-2 items-center">
            <Text className="w-14 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
              {t('create_routine.set_label_caps')}
            </Text>
            <Text className="flex-1 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
              {t('create_routine.weight_label_caps')}
            </Text>
            <Text className="flex-1 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
              {t('create_routine.reps_label_caps')}
            </Text>
            <Text className="w-16 text-center text-[10px] font-black uppercase tracking-widest text-[#FF4500]">
              {t('create_routine.rest_label_caps')}
            </Text>
            <Text className="w-8"></Text>
          </View>

          {/* SETS LIST */}
          {sets.map((set, setIndex) => (
            <RoutineSetRow
              key={set.localId}
              set={set}
              setIndex={setIndex}
              exerciseLocalId={localId}
              onOpenSetTypeSelector={onOpenSetTypeSelector}
              updateSetField={updateSetField}
              removeSet={removeSet}
            />
          ))}

          <TouchableOpacity
            onPress={() => addSet(localId)}
            className="mt-2 py-3.5 bg-white/5 rounded-xl items-center flex-row justify-center border border-dashed border-white/20"
          >
            <Plus size={16} color="#d1d5db" className="mr-1" />
            <Text className="text-gray-300 font-black text-sm uppercase tracking-widest">
              {t('create_routine.add_set')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
