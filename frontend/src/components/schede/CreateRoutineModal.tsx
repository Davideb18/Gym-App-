import React, { useEffect, useState } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';

import { useWorkoutCreation, DraftExercise } from '../../hooks/useWorkoutCreation';
import ExerciseLibrary from '../exercises/ExerciseLibrary';
import ExerciseDetailModal from '../exercises/ExerciseDetailModal';
import { SetType, WorkoutTemplate } from '../../../../shared/types';
import { useExerciseModal } from '../../store/useExerciseModal';

import RoutineStatsSummary from './CreateRoutine/RoutineStatsSummary';
import RoutineExerciseCard from './CreateRoutine/RoutineExerciseCard';
import SetTypeSelectorModal from './CreateRoutine/SetTypeSelectorModal';
import PremiumModal from '../ui/PremiumModal';

interface CreateRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string | undefined, exercises: DraftExercise[]) => Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  isPremium?: boolean;
  templateToEdit?: WorkoutTemplate | null;
  onRequirePremium?: () => void;
}

export default function CreateRoutineModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
  isPremium = false,
  templateToEdit = null,
  onRequirePremium,
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
    reset,
    loadTemplate
  } = useWorkoutCreation();

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [activeSetTypePicker, setActiveSetTypePicker] = useState<{ exerciseLocalId: string, setLocalId: string } | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const { openExercise } = useExerciseModal();

  useEffect(() => {
    if (visible) {
      if (templateToEdit) {
        loadTemplate(templateToEdit);
      } else {
        reset();
      }
    } else {
      reset();
      setLocalError(null);
      setIsLibraryOpen(false);
      setActiveSetTypePicker(null);
    }
  }, [visible, templateToEdit]);

  const handleSubmit = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      setLocalError(errorMsg);
      return;
    }
    setLocalError(null);
    await onSubmit(name.trim(), description.trim() || undefined, exercises);
  };

  const handleSetTypeSelect = (setType: SetType, isPremiumType: boolean) => {
    if (!activeSetTypePicker) return;

    if (isPremiumType && !isPremium) {
      setActiveSetTypePicker(null);
      setTimeout(() => {
        setIsPremiumModalOpen(true);
      }, 300);
      return;
    }
    updateSetField(activeSetTypePicker.exerciseLocalId, activeSetTypePicker.setLocalId, 'setType', setType);
    setActiveSetTypePicker(null);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-[#F9FAFB]">
        <LinearGradient colors={['#e4e4e7', '#f3f4f6', '#F9FAFB']} className="absolute inset-0" />
        
        {/* HEADER */}
        <View className="px-5 pt-12 pb-4 flex-row justify-between items-center bg-transparent border-b border-black/5">
          <TouchableOpacity onPress={onClose} disabled={isSubmitting} className="w-20">
            <Text className="text-gray-500 font-bold text-lg">Annulla</Text>
          </TouchableOpacity>
          <Text className="text-xl font-black text-black">{templateToEdit ? 'Modifica Routine' : 'Crea Scheda'}</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} className="w-20 items-end">
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
            <View className="px-5 pt-5 pb-3">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nome Routine (es. Push Day)"
                placeholderTextColor="#9ca3af"
                className="text-3xl font-black text-black mb-2 tracking-tighter"
              />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Aggiungi una descrizione..."
                placeholderTextColor="#9ca3af"
                multiline
                className="text-gray-600 font-medium text-base min-h-[50px] mb-3"
              />
            </View>

            {/* HEADER SUMMARY: STATISTICHE INTELLIGENTI AMALGAMATE */}
            <RoutineStatsSummary exercises={exercises} />

            {(errorMessage || localError) && (
              <View className="mx-5 mb-4 p-4 bg-red-100 rounded-2xl border border-red-200">
                <Text className="text-red-700 font-bold text-sm text-center">
                  {localError || errorMessage}
                </Text>
              </View>
            )}

            {/* EXERCISES LIST */}
            <View className="px-5">
              {exercises.map((ex, index) => (
                <RoutineExerciseCard
                  key={ex.localId}
                  exerciseDraft={ex}
                  index={index}
                  onOpenExerciseInfo={(exInfo) => openExercise(exInfo.id)}
                  removeExercise={removeExercise}
                  updateExerciseNotes={updateExerciseNotes}
                  addSet={addSet}
                  removeSet={removeSet}
                  updateSetField={updateSetField}
                  onOpenSetTypeSelector={(exId, setId) => setActiveSetTypePicker({ exerciseLocalId: exId, setLocalId: setId })}
                />
              ))}

              {/* ADD EXERCISE BUTTON */}
              <TouchableOpacity
                onPress={() => setIsLibraryOpen(true)}
                className="bg-black py-5 rounded-2xl items-center shadow-xl shadow-black/20 mb-8 flex-row justify-center mt-2 border border-black/10"
              >
                <Plus size={20} color="white" className="mr-2" />
                <Text className="text-white font-black text-base uppercase tracking-widest">Aggiungi Esercizio</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <PremiumModal 
          visible={isPremiumModalOpen} 
          onClose={() => setIsPremiumModalOpen(false)} 
          onUpgrade={() => {
            Alert.alert("Premium", "Logica di pagamento in arrivo!");
            setIsPremiumModalOpen(false);
          }}
        />

      {/* MODAL SELEZIONE TIPO DI SET */}
      <SetTypeSelectorModal
        visible={!!activeSetTypePicker}
        onClose={() => setActiveSetTypePicker(null)}
        onSelect={handleSetTypeSelect}
        isPremium={isPremium}
      />

      <ExerciseLibrary
        visible={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onExerciseAdd={(exercise) => {
          addExercise(exercise);
          setIsLibraryOpen(false);
        }}
      />
      </View>
      <ExerciseDetailModal />
    </Modal>
  );
}
