// frontend/src/components/schede/CreateRoutineScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X, Save, Plus, Dumbbell, AlignLeft, Layout } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { WorkoutService } from '../../api/workoutService';
import { useAuthStore } from '../../store/useAuthStore';
import { useCreateRoutineStore } from '../../store/useCreateRoutineStore';
import ExerciseLibrary from '../exercises/ExerciseLibrary';
import { DraftExercise, useWorkoutCreation } from '../../hooks/useWorkoutCreation';
import { Exercise, SetType } from '../../../../shared/types';
import RoutineExerciseCard from './CreateRoutine/RoutineExerciseCard';
import SetTypeSelectorModal from './CreateRoutine/SetTypeSelectorModal';
import { useExerciseModal } from '../../store/useExerciseModal';

type ReorderRoutineModalProps = {
  visible: boolean;
  exercises: DraftExercise[];
  onClose: () => void;
  onReorder: (data: DraftExercise[]) => void;
};

function ReorderRoutineModal({ visible, exercises, onClose, onReorder }: ReorderRoutineModalProps) {
  if (!visible) return null;

  const reorderDialogWidthPct = 88;
  const reorderDialogHeightPct = Math.max(36, Math.min(74, 24 + exercises.length * 8));
  const reorderDialogTopPct = (100 - reorderDialogHeightPct) / 2;
  const reorderDialogLeftPct = (100 - reorderDialogWidthPct) / 2;

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 120 }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
      />
      <View
        style={{
          position: 'absolute',
          top: `${reorderDialogTopPct}%`,
          left: `${reorderDialogLeftPct}%`,
          width: `${reorderDialogWidthPct}%`,
          height: `${reorderDialogHeightPct}%`,
          borderRadius: 28,
          overflow: 'hidden',
          backgroundColor: '#171717',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <LinearGradient
          colors={['#171717', '#4B5563']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <LinearGradient
          colors={['rgba(16,185,129,0.28)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140 }}
        />

        <View className="w-full items-center pt-3 pb-1">
          <View className="w-12 h-1.5 bg-white/25 rounded-full" />
        </View>
        <View className="px-6 pb-2 flex-row items-center justify-between">
          <Text className="text-white font-black text-sm uppercase tracking-widest">
            Riordina esercizi
          </Text>
          <TouchableOpacity onPress={onClose} className="px-4 py-2 rounded-full bg-[#10B981]">
            <Text className="text-black font-black text-xs uppercase tracking-widest">Fine</Text>
          </TouchableOpacity>
        </View>
        <Text className="px-6 text-gray-300 text-xs mb-3">
          Tieni premuto e trascina per cambiare ordine.
        </Text>

        <DraggableFlatList
          data={exercises}
          keyExtractor={(item) => item.localId}
          activationDistance={0}
          autoscrollSpeed={300}
          autoscrollThreshold={60}
          onDragEnd={({ data }) => {
            onReorder([...(data as DraftExercise[])]);
          }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 26 }}
          renderItem={({ item, drag, isActive, getIndex }) => {
            const rowIndex = getIndex?.() ?? exercises.findIndex((e) => e.localId === item.localId);

            return (
              <ScaleDecorator>
                <TouchableOpacity
                  onLongPress={drag}
                  delayLongPress={120}
                  activeOpacity={0.9}
                  className={`rounded-2xl border px-4 py-4 mb-2 ${isActive ? 'bg-[#10B981]/18 border-[#10B981]/45' : 'bg-black/35 border-white/12'}`}
                >
                  <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    Esercizio {(rowIndex + 1).toString()}
                  </Text>
                  <Text className="text-white font-black text-base" numberOfLines={1}>
                    {item.exercise.name}
                  </Text>
                </TouchableOpacity>
              </ScaleDecorator>
            );
          }}
        />
      </View>
    </View>
  );
}

type RoutineHeaderProps = {
  isSaving: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSave: () => void;
  t: (key: string) => string;
};

function RoutineHeader({ isSaving, isEditing, onClose, onSave, t }: RoutineHeaderProps) {
  return (
    <View className="flex-row justify-between items-center px-6 mb-4 mt-2">
      <TouchableOpacity
        onPress={onClose}
        className="bg-white/10 p-2.5 rounded-full border border-white/5"
      >
        <X size={24} color="#FFF" />
      </TouchableOpacity>
      <Text className="text-white font-black text-sm uppercase tracking-widest">
        {isEditing ? t('create_routine.edit_title') : t('create_routine.new_title')}
      </Text>
      <TouchableOpacity
        onPress={onSave}
        disabled={isSaving}
        className={`${isSaving ? 'bg-white/20' : 'bg-[#10B981]'} p-2.5 rounded-full border border-transparent shadow-lg shadow-green-900/50`}
      >
        <Save size={20} color={isSaving ? '#FFF' : 'black'} />
      </TouchableOpacity>
    </View>
  );
}

type RoutineInfoCardProps = {
  routineName: string;
  routineDesc: string;
  setRoutineName: (value: string) => void;
  setRoutineDesc: (value: string) => void;
  t: (key: string) => string;
};

function RoutineInfoCard({
  routineName,
  routineDesc,
  setRoutineName,
  setRoutineDesc,
  t,
}: RoutineInfoCardProps) {
  return (
    <View className="bg-black/40 rounded-3xl p-5 mb-5 border border-white/5">
      <View className="flex-row items-center border-b border-white/10 pb-4 mb-4">
        <View className="bg-white/10 p-2.5 rounded-xl mr-3">
          <Layout size={20} color="#FFF" />
        </View>
        <TextInput
          className="flex-1 text-white font-black text-2xl tracking-tight"
          placeholder={t('create_routine.name_placeholder')}
          placeholderTextColor="#666"
          value={routineName}
          onChangeText={setRoutineName}
        />
      </View>

      <View className="flex-row items-center">
        <View className="bg-white/5 p-2 rounded-lg mr-3">
          <AlignLeft size={16} color="#999" />
        </View>
        <TextInput
          className="flex-1 text-gray-300 font-medium text-sm"
          placeholder={t('create_routine.desc_placeholder')}
          placeholderTextColor="#666"
          value={routineDesc}
          onChangeText={setRoutineDesc}
          multiline
        />
      </View>
    </View>
  );
}

export default function CreateRoutineScreen() {
  const { isOpen, templateToEdit, closeCreate } = useCreateRoutineStore();
  const { t } = useTranslation();

  const { session } = useAuthStore();
  const userId = session?.user?.id;
  const { openExercise } = useExerciseModal();

  const {
    name: routineName,
    description: routineDesc,
    exercises,
    setName: setRoutineName,
    setDescription: setRoutineDesc,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSetField,
    updateExerciseNotes,
    validate,
    reset,
    loadTemplate,
    reorderExercises,
  } = useWorkoutCreation();

  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExerciseLibraryOpen, setIsExerciseLibraryOpen] = useState(false);
  const [isSetTypeModalOpen, setIsSetTypeModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [selectedSetRef, setSelectedSetRef] = useState<{
    exerciseLocalId: string;
    setLocalId: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (templateToEdit) {
        loadTemplate(templateToEdit);
      } else {
        reset();
        setLocalError(null);
      }
      setIsReorderModalOpen(false);
    }
  }, [isOpen, templateToEdit, loadTemplate, reset]);

  const handleAddExercise = (exercise: Exercise) => {
    addExercise(exercise);
    setIsExerciseLibraryOpen(false);
  };

  const handleOpenReorder = () => {
    if (exercises.length > 1) {
      setIsReorderModalOpen(true);
    }
  };

  const handleCloseReorder = () => {
    setIsReorderModalOpen(false);
  };

  const handleOpenSetTypeSelector = (exerciseLocalId: string, setLocalId: string) => {
    setSelectedSetRef({ exerciseLocalId, setLocalId });
    setIsSetTypeModalOpen(true);
  };

  const handleSelectSetType = (setType: SetType) => {
    if (!selectedSetRef) return;
    updateSetField(selectedSetRef.exerciseLocalId, selectedSetRef.setLocalId, 'setType', setType);
    setIsSetTypeModalOpen(false);
    setSelectedSetRef(null);
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert(t('common.error'), validationError);
      return;
    }
    setIsReorderModalOpen(false);

    if (!userId) {
      Alert.alert(t('common.error'), t('create_routine.not_logged_in'));
      return;
    }

    setIsSaving(true);
    setLocalError(null);

    try {
      if (templateToEdit) {
        // Update: aggiorna nome e descrizione mantenendo gli esercizi esistenti
        await WorkoutService.updateCompleteWorkoutTemplate(
          templateToEdit.id,
          routineName.trim(),
          routineDesc.trim() || undefined,
          exercises,
        );
        Alert.alert(t('common.success'), t('create_routine.success_updated'));
      } else {
        // Create: crea una nuova scheda vuota
        await WorkoutService.saveCompleteWorkoutTemplate(
          userId,
          routineName.trim(),
          routineDesc.trim() || undefined,
          exercises,
        );
        Alert.alert(t('common.success'), t('create_routine.success_created'));
      }
      closeCreate();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : t('create_routine.save_error');
      setLocalError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <View className="absolute inset-0 z-[105] elevation-[105]">
      {/* Sfondo Oscurato cliccabile */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeCreate}
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
        <LinearGradient
          colors={['#171717', '#D1D5DB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <LinearGradient
          colors={['rgba(16,185,129,0.35)', 'rgba(16,185,129,0.05)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(16,185,129,0.4)',
          }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          {/* Maniglietta visiva stile iOS */}
          <View className="w-full items-center pt-3 pb-2">
            <View className="w-12 h-1.5 bg-white/30 rounded-full" />
          </View>

          {/* Header */}
          <RoutineHeader
            isSaving={isSaving}
            isEditing={Boolean(templateToEdit)}
            onClose={closeCreate}
            onSave={handleSave}
            t={t}
          />

          <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 150 }}>
            {/* Box Titolo e Desc */}
            <RoutineInfoCard
              routineName={routineName}
              routineDesc={routineDesc}
              setRoutineName={setRoutineName}
              setRoutineDesc={setRoutineDesc}
              t={t}
            />

            {localError ? (
              <View className="mb-4 p-4 bg-red-900/40 rounded-2xl border border-red-500/50">
                <Text className="text-red-400 font-bold text-sm text-center">{localError}</Text>
              </View>
            ) : null}

            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4 px-2">
                <Text className="text-gray-400 font-black text-[10px] uppercase tracking-[4px]">
                  {t('create_routine.exercises_label')}
                </Text>
                {exercises.length > 1 ? (
                  <TouchableOpacity
                    onPress={handleOpenReorder}
                    className="px-3 py-1.5 bg-white/10 border border-white/15 rounded-full"
                  >
                    <Text className="text-white/90 text-[10px] font-black uppercase tracking-widest">
                      Riordina
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {exercises.length === 0 ? (
                <View className="bg-white/5 border border-white/10 border-dashed rounded-[32px] p-10 items-center justify-center">
                  <View className="bg-white/10 p-4 rounded-full mb-4">
                    <Dumbbell size={28} color="#999" />
                  </View>
                  <Text className="text-gray-400 font-bold text-center text-sm mb-1">
                    {t('create_routine.no_exercises')}
                  </Text>
                  <Text className="text-gray-600 text-xs text-center">
                    {t('create_routine.no_exercises')}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={exercises}
                  keyExtractor={(item) => item.localId}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => (
                    <RoutineExerciseCard
                      exerciseDraft={item}
                      index={index}
                      compactMode={false}
                      isHighlightedDrag={false}
                      onActivateReorder={handleOpenReorder}
                      onOpenExerciseInfo={(exercise) => exercise?.id && openExercise(exercise.id)}
                      removeExercise={removeExercise}
                      updateExerciseNotes={updateExerciseNotes}
                      addSet={addSet}
                      removeSet={removeSet}
                      updateSetField={updateSetField}
                      onOpenSetTypeSelector={handleOpenSetTypeSelector}
                    />
                  )}
                />
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsExerciseLibraryOpen(true)}
              className="bg-[#10B981]/20 border border-[#10B981]/30 rounded-3xl p-5 flex-row items-center justify-center shadow-lg"
            >
              <Plus size={20} color="#10B981" />
              <Text className="text-[#10B981] font-black uppercase text-sm tracking-widest ml-2">
                {t('create_routine.add_exercise')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <ReorderRoutineModal
        visible={isReorderModalOpen}
        exercises={exercises}
        onClose={handleCloseReorder}
        onReorder={reorderExercises}
      />

      <ExerciseLibrary
        visible={isExerciseLibraryOpen}
        onClose={() => setIsExerciseLibraryOpen(false)}
        onExerciseAdd={handleAddExercise}
        selectionMode="add"
      />

      <SetTypeSelectorModal
        visible={isSetTypeModalOpen}
        onClose={() => {
          setIsSetTypeModalOpen(false);
          setSelectedSetRef(null);
        }}
        onSelect={(value) => handleSelectSetType(value)}
        isPremium={false}
      />
    </View>
  );
}
