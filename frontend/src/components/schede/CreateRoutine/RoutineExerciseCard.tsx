import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Trash2, Info, Plus } from 'lucide-react-native';
import { DraftExercise } from '../../../hooks/useWorkoutCreation';
import RoutineSetRow from './RoutineSetRow';

interface Props {
  exerciseDraft: DraftExercise;
  index: number;
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
  onOpenExerciseInfo,
  removeExercise,
  updateExerciseNotes,
  addSet,
  removeSet,
  updateSetField,
  onOpenSetTypeSelector
}: Props) {
  const { localId, exercise, notes, sets } = exerciseDraft;

  return (
    <View className="bg-white rounded-3xl p-4 mb-4 shadow-md shadow-black/5 border border-black/5">
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity 
          className="flex-1 mr-2 flex-row flex-wrap items-center"
          onPress={() => onOpenExerciseInfo(exercise)}
        >
          <Text className="text-lg font-black text-black mr-2">
            {index + 1}. {exercise.name}
          </Text>
          <Info size={14} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => removeExercise(localId)} className="bg-red-50 p-2 rounded-full border border-red-100">
          <Trash2 size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <TextInput
        value={notes}
        onChangeText={(text) => updateExerciseNotes(localId, text)}
        placeholder="Note per l'esercizio..."
        placeholderTextColor="#9ca3af"
        className="bg-gray-50/80 p-3 rounded-xl mb-4 text-sm font-medium text-gray-700 border border-gray-100"
      />

      {/* SETS HEADER */}
      <View className="flex-row mb-2 px-2 items-center">
         <Text className="w-14 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">SET</Text>
         <Text className="flex-1 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">KG</Text>
         <Text className="flex-1 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">REPS</Text>
         <Text className="w-16 text-center text-[10px] font-black uppercase tracking-widest text-[#FF4500]">REST (s)</Text>
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
        className="mt-2 py-3.5 bg-gray-50 rounded-xl items-center flex-row justify-center border border-dashed border-gray-300"
      >
        <Plus size={16} color="#4B5563" className="mr-1" />
        <Text className="text-gray-600 font-black text-sm uppercase tracking-widest">Aggiungi Serie</Text>
      </TouchableOpacity>
    </View>
  );
}
