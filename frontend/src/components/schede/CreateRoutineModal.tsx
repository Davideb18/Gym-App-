import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { useWorkoutCreation, DraftExercise } from '../../hooks/useWorkoutCreation';
import ExerciseLibrary from '../exercises/ExerciseLibrary';

const REST_OPTIONS = Array.from({length: 21}, (_, i) => ({ label: String(i * 15), value: String(i * 15) }));
const REPS_OPTIONS = [
  { label: '-', value: '' },
  ...Array.from({length: 50}, (_, i) => ({ label: String(i + 1), value: String(i + 1) }))
];
const KG_OPTIONS = [
  { label: '-', value: '' },
  ...Array.from({length: 201}, (_, i) => ({ label: String(i), value: String(i) }))
];

const HorizontalWheelPicker = ({ 
  items, 
  value, 
  onValueChange,
  unit
}: { 
  items: {label: string, value: string}[], 
  value: string, 
  onValueChange: (val: string) => void,
  unit?: string
}) => {
  const ITEM_WIDTH = 76;
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const paddingX = (width - ITEM_WIDTH) / 2;

  useEffect(() => {
    const idx = items.findIndex(i => i.value === value);
    if (idx !== -1 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: idx * ITEM_WIDTH, animated: false });
      }, 50);
    }
  }, [value, items]);

  const handleScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    const validIdx = Math.max(0, Math.min(items.length - 1, index));
    if (items[validIdx]) {
      onValueChange(items[validIdx].value);
    }
  };

  return (
    <View className="w-full relative justify-center h-28 my-4">
      <View 
        className="absolute bg-black rounded-3xl shadow-xl shadow-black/20" 
        style={{ left: paddingX, width: ITEM_WIDTH, height: 80, top: 16 }} 
        pointerEvents="none" 
      />
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingHorizontal: paddingX, alignItems: 'center' }}
      >
        {items.map(item => {
          const isSelected = value === item.value;
          return (
            <View key={item.value} style={{ width: ITEM_WIDTH, height: 80 }} className="justify-center items-center">
              <Text className={`font-black text-2xl ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                {item.label}
              </Text>
              {unit ? (
                <Text className={`font-bold text-[10px] uppercase tracking-widest mt-1 ${isSelected ? 'text-white/80' : 'text-gray-300'}`}>
                  {unit}
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface CreateRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string | undefined, exercises: DraftExercise[]) => Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export default function CreateRoutineModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: CreateRoutineModalProps) {
  const {
    name, setName,
    description, setDescription,
    exercises,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSetField,
    updateExerciseNotes,
    validate,
    reset
  } = useWorkoutCreation();

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  type PickerType = 'restSeconds' | 'reps' | 'intensity';
  const [activePicker, setActivePicker] = useState<{ type: PickerType, exerciseLocalId: string, setLocalId: string } | null>(null);

  const getPickerConfig = () => {
    if (!activePicker) return { options: [], unit: '', title: '' };
    switch (activePicker.type) {
      case 'restSeconds': return { options: REST_OPTIONS, unit: 'sec', title: 'Scorri il tempo' };
      case 'reps': return { options: REPS_OPTIONS, unit: 'reps', title: 'Scorri le ripetizioni' };
      case 'intensity': return { options: KG_OPTIONS, unit: 'kg', title: 'Scorri il carico' };
      default: return { options: [], unit: '', title: '' };
    }
  };
  const pickerConfig = getPickerConfig();

  useEffect(() => {
    if (!visible) {
      reset();
      setLocalError(null);
      setIsLibraryOpen(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      setLocalError(errorMsg);
      return;
    }
    setLocalError(null);
    await onSubmit(name.trim(), description.trim() || undefined, exercises);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-gray-100">
        <LinearGradient colors={['#e4e4e7', '#f3f4f6', '#ffffff']} className="absolute inset-0" />
        
        {/* HEADER */}
        <View className="px-5 pt-12 pb-4 flex-row justify-between items-center bg-white border-b border-gray-200">
          <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
            <Text className="text-gray-500 font-bold text-lg">Annulla</Text>
          </TouchableOpacity>
          <Text className="text-xl font-black text-black">Crea Scheda</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className="text-black font-black text-lg">Salva</Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
            {/* GENERAL INFO */}
            <View className="p-5 bg-white mb-3 shadow-sm border-b border-gray-100">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nome Routine (es. Push Day)"
                placeholderTextColor="#9ca3af"
                className="text-3xl font-black text-black mb-4 tracking-tighter"
              />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Aggiungi una descrizione..."
                placeholderTextColor="#9ca3af"
                multiline
                className="text-gray-600 font-medium text-base min-h-[60px]"
              />
            </View>

            {(errorMessage || localError) && (
              <View className="mx-5 my-4 p-4 bg-red-100 rounded-2xl border border-red-200">
                <Text className="text-red-700 font-bold text-sm text-center">
                  {localError || errorMessage}
                </Text>
              </View>
            )}

            {/* EXERCISES LIST */}
            <View className="px-5 mt-4">
              {exercises.map((ex, index) => (
                <View key={ex.localId} className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-gray-100">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-black text-black flex-1 mr-2">{index + 1}. {ex.exercise.name}</Text>
                    <TouchableOpacity onPress={() => removeExercise(ex.localId)} className="bg-gray-100 p-2 rounded-full">
                      <Trash2 size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    value={ex.notes}
                    onChangeText={(text) => updateExerciseNotes(ex.localId, text)}
                    placeholder="Note per l'esercizio..."
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-50 p-3 rounded-xl mb-4 text-sm font-medium text-gray-700"
                  />

                  {/* SETS HEADER */}
                  <View className="flex-row mb-2 px-2">
                     <Text className="w-12 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">SET</Text>
                     <Text className="flex-1 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">KG</Text>
                     <Text className="flex-1 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">REPS</Text>
                     <Text className="w-16 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">REST</Text>
                     <Text className="w-8"></Text>
                  </View>

                  {/* SETS LIST */}
                  {ex.sets.map((set, setIndex) => (
                    <View key={set.localId} className="flex-row items-center bg-gray-50/80 rounded-2xl p-2 mb-2 border border-gray-100">
                       <View className="w-12 items-center justify-center">
                         <View className="bg-white w-8 h-8 rounded-full items-center justify-center shadow-sm">
                           <Text className="text-black font-black text-xs">{setIndex + 1}</Text>
                         </View>
                         {set.setType !== 'normal' && (
                           <Text className="text-[8px] font-bold text-[#FF4500] uppercase mt-1">{set.setType}</Text>
                         )}
                       </View>
                       
                       <View className="flex-1 px-1">
                         <TouchableOpacity
                           activeOpacity={0.7}
                           onPress={() => setActivePicker({ type: 'intensity', exerciseLocalId: ex.localId, setLocalId: set.localId })}
                           className="bg-white items-center justify-center py-3 rounded-xl shadow-sm border border-gray-100 h-[46px]"
                         >
                           <Text className="font-bold text-xs text-black">
                             {set.intensity ? `${set.intensity}kg` : '-'}
                           </Text>
                         </TouchableOpacity>
                       </View>

                       <View className="flex-1 px-1">
                         <TouchableOpacity
                           activeOpacity={0.7}
                           onPress={() => setActivePicker({ type: 'reps', exerciseLocalId: ex.localId, setLocalId: set.localId })}
                           className="bg-white items-center justify-center py-3 rounded-xl shadow-sm border border-gray-100 h-[46px]"
                         >
                           <Text className="font-bold text-xs text-black">
                             {set.reps || '-'}
                           </Text>
                         </TouchableOpacity>
                       </View>

                       <View className="w-16 px-1">
                         <TouchableOpacity
                           activeOpacity={0.7}
                           onPress={() => setActivePicker({ type: 'restSeconds', exerciseLocalId: ex.localId, setLocalId: set.localId })}
                           className="bg-white items-center justify-center py-3 rounded-xl shadow-sm border border-gray-100 h-[46px]"
                         >
                           <Text className="font-bold text-xs text-black">
                             {set.restSeconds ? `${set.restSeconds}s` : '90s'}
                           </Text>
                         </TouchableOpacity>
                       </View>

                       <View className="w-8 items-center justify-center">
                         <TouchableOpacity onPress={() => removeSet(ex.localId, set.localId)}>
                           <X size={16} color="#9CA3AF" />
                         </TouchableOpacity>
                       </View>
                    </View>
                  ))}

                  <TouchableOpacity 
                    onPress={() => addSet(ex.localId)}
                    className="mt-2 py-3 bg-gray-100 rounded-xl items-center flex-row justify-center border border-gray-200"
                  >
                    <Plus size={16} color="#6B7280" className="mr-1" />
                    <Text className="text-gray-600 font-bold text-sm">Aggiungi Serie</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* ADD EXERCISE BUTTON */}
              <TouchableOpacity
                onPress={() => setIsLibraryOpen(true)}
                className="bg-black py-5 rounded-full items-center shadow-xl shadow-black/20 mb-8 flex-row justify-center mt-2 border border-black/10"
              >
                <Plus size={20} color="white" className="mr-2" />
                <Text className="text-white font-black text-base uppercase tracking-widest">Aggiungi Esercizio</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* UNIFIED HORIZONTAL WHEEL PICKER MODAL */}
      <Modal visible={!!activePicker} transparent animationType="slide" onRequestClose={() => setActivePicker(null)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white w-full rounded-t-[38px] pt-6 pb-12 shadow-2xl border-t border-gray-100">
            <Text className="text-xl font-black text-black text-center tracking-tight">{pickerConfig.title}</Text>
            
            {activePicker && (
              <HorizontalWheelPicker 
                items={pickerConfig.options}
                value={exercises.find(e => e.localId === activePicker.exerciseLocalId)?.sets.find(s => s.localId === activePicker.setLocalId)?.[activePicker.type] || (activePicker.type === 'restSeconds' ? '90' : '')}
                onValueChange={(val) => updateSetField(activePicker.exerciseLocalId, activePicker.setLocalId, activePicker.type, val)}
                unit={pickerConfig.unit}
              />
            )}

            <View className="px-6 mt-4">
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setActivePicker(null)}
                className="py-4 bg-gray-100/80 rounded-full items-center border border-gray-200"
              >
                <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fatto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ExerciseLibrary
        visible={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onExerciseAdd={(exercise) => {
          addExercise(exercise);
          setIsLibraryOpen(false);
        }}
      />
    </Modal>
  );
}
