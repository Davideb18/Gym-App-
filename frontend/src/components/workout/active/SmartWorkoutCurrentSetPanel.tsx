import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Check, ChevronUp } from 'lucide-react-native';
import { LiveExercise, LiveSet } from '../../../store/useActiveWorkout';

type SmartWorkoutCurrentSetPanelProps = {
  currentExercise: LiveExercise | null;
  currentSet: LiveSet | null;
  setLabel: string;
  repsLabel: string;
  weightLabel: string;
  finishedLabel: string;
  difficultyLabel: (type: string) => string;
  getSetColor: (type: string) => string;
  parseNumber: (value: string) => number | undefined;
  onUpdateSet: (
    exerciseId: string,
    setId: string,
    field: 'real_weight' | 'real_reps',
    value?: number,
  ) => void;
  onCheck: () => void;
};

export default function SmartWorkoutCurrentSetPanel({
  currentExercise,
  currentSet,
  setLabel,
  repsLabel,
  weightLabel,
  finishedLabel,
  difficultyLabel,
  getSetColor,
  parseNumber,
  onUpdateSet,
  onCheck,
}: SmartWorkoutCurrentSetPanelProps) {
  return (
    <View className="px-5 py-4 flex-row items-center justify-between">
      <View className="flex-1 mr-4">
        {currentSet ? (
          <View className="flex-row items-center mb-1">
            <View
              className={`px-2 py-0.5 rounded-md border ${getSetColor(currentSet.set_type).split(' ')[0]} ${getSetColor(currentSet.set_type).split(' ')[2]}`}
            >
              <Text
                className={`text-[8px] uppercase font-black tracking-wider ${getSetColor(currentSet.set_type).split(' ')[1]}`}
              >
                {difficultyLabel(currentSet.set_type)} • {setLabel} {currentSet.set_number}
              </Text>
            </View>
          </View>
        ) : null}

        <Text
          className="text-white font-black text-xl uppercase tracking-tighter mb-2"
          numberOfLines={1}
        >
          {currentExercise ? currentExercise.exercise_name : finishedLabel}
        </Text>

        {currentExercise && currentSet && !currentSet.is_completed ? (
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center bg-black/50 rounded-xl border border-white/10 px-2 py-1.5 focus-within:border-white/20 shadow-inner">
              <TextInput
                className="text-white font-black text-lg text-center w-12 p-0 m-0"
                keyboardType="numeric"
                placeholder={currentSet.target_weight ? String(currentSet.target_weight) : '-'}
                placeholderTextColor="#718096"
                value={currentSet.real_weight ? String(currentSet.real_weight) : ''}
                onChangeText={(val) =>
                  onUpdateSet(currentExercise.id, currentSet.id, 'real_weight', parseNumber(val))
                }
              />
              <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest ml-1 mr-1">
                {weightLabel}
              </Text>
            </View>

            <View className="flex-row items-center bg-black/50 rounded-xl border border-white/10 px-2 py-1.5 focus-within:border-white/20 shadow-inner">
              <TextInput
                className="text-white font-black text-lg text-center w-10 p-0 m-0"
                keyboardType="numeric"
                placeholder={currentSet.target_reps ? String(currentSet.target_reps) : '-'}
                placeholderTextColor="#718096"
                value={currentSet.real_reps ? String(currentSet.real_reps) : ''}
                onChangeText={(val) =>
                  onUpdateSet(currentExercise.id, currentSet.id, 'real_reps', parseNumber(val))
                }
              />
              <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest ml-1 mr-1">
                {repsLabel}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="items-center justify-center">
        {currentSet && !currentSet.is_completed ? (
          <TouchableOpacity
            onPress={onCheck}
            className="w-16 h-16 bg-[#10B981] rounded-full items-center justify-center shadow-lg shadow-green-900/50"
          >
            <Check size={36} color="black" strokeWidth={3} />
          </TouchableOpacity>
        ) : (
          <View className="w-14 h-14 bg-white/10 rounded-full items-center justify-center border border-white/5">
            <ChevronUp size={28} color="#FFF" />
          </View>
        )}
      </View>
    </View>
  );
}
