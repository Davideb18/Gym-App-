// frontend/src/components/schede/CreateRoutineScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Save, Plus, Dumbbell, AlignLeft, Layout, Flame } from 'lucide-react-native';
import { WorkoutTemplate, Exercise, WorkoutTemplateExercise, WorkoutTemplateSet } from '../../../../shared/types';
import { WorkoutService } from '../../api/workoutService';
import { useAuthStore } from '../../store/useAuthStore';
import { useCreateRoutineStore } from '../../store/useCreateRoutineStore';

export default function CreateRoutineScreen() {
  const { 
    isOpen, 
    templateToEdit, 
    exercises: storeExercises, 
    setExercises, 
    closeCreate 
  } = useCreateRoutineStore();

  const { session } = useAuthStore();
  const userId = session?.user?.id;

  const [routineName, setRoutineName] = useState('');
  const [routineDesc, setRoutineDesc] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (templateToEdit) {
        setRoutineName(templateToEdit.name);
        setRoutineDesc(templateToEdit.description || '');
      } else {
        setRoutineName('');
        setRoutineDesc('');
        setLocalError(null);
        setExercises([]);
      }
    }
  }, [isOpen, templateToEdit]);

  const handleSave = async () => {
    if (!routineName.trim()) {
      Alert.alert("Errore", "Inserisci un nome per la scheda.");
      return;
    }
    if (!userId) {
      Alert.alert("Errore", "Utente non loggato.");
      return;
    }

    setIsSaving(true);
    setLocalError(null);

    const mappedExercises: Omit<WorkoutTemplateExercise, 'id' | 'workout_template_id'>[] = storeExercises.map((ex, index) => ({
      exercise_id: ex.exercise_id,
      exercise_order: index,
      notes: ex.notes || null,
      workout_template_sets: ex.sets.map((set, sIdx) => ({
        set_number: sIdx + 1,
        set_type: set.set_type as "normal" | "warmup" | "dropset" | "failure",
        target_reps_min: set.target_reps,
        target_reps_max: set.target_reps,
        target_rpe: set.target_rpe,
        rest_seconds: set.rest_seconds || 90
      })) as Omit<WorkoutTemplateSet, 'id' | 'workout_template_exercise_id'>[]
    }));

    try {
      if (templateToEdit) {
        await WorkoutService.updateTemplate(templateToEdit.id, routineName.trim(), routineDesc.trim() || undefined, mappedExercises);
        Alert.alert("Successo", "Scheda aggiornata!");
      } else {
        await WorkoutService.createTemplate(userId, routineName.trim(), routineDesc.trim() || undefined, mappedExercises);
        Alert.alert("Successo", "Scheda salvata!");
      }
      closeCreate();
    } catch (err: any) {
      console.error(err);
      setLocalError(err.message || 'Errore durante il salvataggio.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <View className="absolute inset-0 z-[105] elevation-[105]">
      {/* Sfondo Oscurato cliccabile */}
      <TouchableOpacity activeOpacity={1} onPress={closeCreate} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center' }} />
      
      {/* Contenitore APPLE STYLE BOTTOM SHEET */}
      <View className="absolute bottom-0 w-full h-[93%] rounded-t-[40px] overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <BlurView intensity={100} tint="dark" className="flex-1 border-t border-x border-white/10">
          
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
            
            {/* Maniglietta visiva stile iOS */}
            <View className="w-full items-center pt-3 pb-2">
                <View className="w-12 h-1.5 bg-white/30 rounded-full" />
            </View>

            {/* Header Finale */}
            <View className="flex-row justify-between items-center px-6 mb-4 mt-2">
               <TouchableOpacity onPress={closeCreate} className="bg-white/10 p-2.5 rounded-full border border-white/5">
                 <X size={24} color="#FFF" />
               </TouchableOpacity>
               <Text className="text-white font-black text-sm uppercase tracking-widest">
                 {templateToEdit ? 'Modifica Routine' : 'Nuova Routine'}
               </Text>
               <TouchableOpacity 
                  onPress={handleSave} 
                  disabled={isSaving}
                  className={`${isSaving ? 'bg-white/20' : 'bg-[#10B981]'} p-2.5 rounded-full border border-transparent shadow-lg shadow-green-900/50`}
               >
                 <Save size={20} color={isSaving ? "#FFF" : "black"} />
               </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 150 }}>
              
              {/* Box Titolo e Desc */}
              <View className="bg-black/40 rounded-3xl p-5 mb-5 border border-white/5 shadow-inner">
                <View className="flex-row items-center border-b border-white/10 pb-4 mb-4">
                  <View className="bg-white/10 p-2.5 rounded-xl mr-3">
                    <Layout size={20} color="#FFF" />
                  </View>
                  <TextInput
                    className="flex-1 text-white font-black text-2xl tracking-tight"
                    placeholder="Nome Routine..."
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
                    placeholder="Descrizione o note..."
                    placeholderTextColor="#666"
                    value={routineDesc}
                    onChangeText={setRoutineDesc}
                    multiline
                  />
                </View>
              </View>

              {localError ? (
                <View className="mb-4 p-4 bg-red-900/40 rounded-2xl border border-red-500/50">
                  <Text className="text-red-400 font-bold text-sm text-center">
                    {localError}
                  </Text>
                </View>
              ) : null}

              {/* Box Esercizi */}
              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-4 px-2">
                  <Text className="text-gray-400 font-black text-[10px] uppercase tracking-[4px]">
                    Scheletro Esercizi
                  </Text>
                  {storeExercises.length > 0 ? (
                     <View className="bg-white/10 px-2.5 py-1 rounded-full">
                       <Text className="text-[#10B981] font-bold text-xs">{storeExercises.length} Ex</Text>
                     </View>
                  ) : null}
                </View>

                {storeExercises.length === 0 ? (
                  <View className="bg-white/5 border border-white/10 border-dashed rounded-[32px] p-10 items-center justify-center">
                    <View className="bg-white/10 p-4 rounded-full mb-4">
                      <Dumbbell size={28} color="#999" />
                    </View>
                    <Text className="text-gray-400 font-bold text-center text-sm mb-1">
                      Nessun esercizio inserito.
                    </Text>
                    <Text className="text-gray-600 text-xs text-center">
                      Costruisci il tuo allenamento premendo il bottone qui sotto.
                    </Text>
                  </View>
                ) : (
                  storeExercises.map((ex, exIdx) => (
                    <View key={exIdx} className="bg-white/5 rounded-3xl p-5 mb-4 border border-white/5 shadow-sm">
                      <View className="flex-row items-center justify-between mb-2">
                         <View className="flex-row items-center flex-1 pr-2">
                           <View className="w-6 h-6 bg-black/40 rounded-full items-center justify-center mr-2 border border-white/10">
                              <Text className="text-white font-bold text-[10px]">{exIdx + 1}</Text>
                           </View>
                           <Text className="text-white font-black text-lg tracking-tight" numberOfLines={1}>
                             {ex.exercise_name}
                           </Text>
                         </View>
                      </View>
                      
                      <View className="flex-row mt-2 items-center bg-black/40 self-start px-3 py-1.5 rounded-xl border border-white/5">
                        <Flame size={12} color="#10B981" />
                        <Text className="text-gray-300 font-bold text-xs ml-1.5">
                          {ex.sets.length} Set previsti
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => Alert.alert("In arrivo", "Libreria esercizi per selezione!")}
                className="bg-[#10B981]/20 border border-[#10B981]/30 rounded-3xl p-5 flex-row items-center justify-center shadow-lg"
              >
                <Plus size={20} color="#10B981" />
                <Text className="text-[#10B981] font-black uppercase text-sm tracking-widest ml-2">
                  Aggiungi Esercizio
                </Text>
              </TouchableOpacity>
              
            </ScrollView>
          </KeyboardAvoidingView>

        </BlurView>
      </View>
    </View>
  );
}
