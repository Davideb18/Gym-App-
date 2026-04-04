// frontend/src/components/workout/WorkoutPreviewModal.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image, Alert, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Play, Clock, Flame, Dumbbell, Edit3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useActiveWorkout } from '../../store/useActiveWorkout';
import { WorkoutTemplate, Exercise } from '../../../../shared/types';
import { supabase } from '../../api/supabaseClient';

const { height } = Dimensions.get('window');

interface WorkoutPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  templateId: string | null;
  onEdit?: (template: WorkoutTemplate) => void;
}

export default function WorkoutPreviewModal({ visible, onClose, templateId, onEdit }: WorkoutPreviewModalProps) {
  const startWorkout = useActiveWorkout((state) => state.startWorkout);

  const { data: template, isLoading, isError } = useQuery<WorkoutTemplate>({
    queryKey: ['template_details', templateId],
    queryFn: async () => {
      if (!templateId) throw new Error("ID mancante");
      
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*, workout_template_exercises(*, workout_template_sets(*), exercises(*))')
        .eq('id', templateId)
        .single();
      
      if (error) throw error;
      return data as unknown as WorkoutTemplate;
    },
    enabled: !!templateId && visible,
  });

  const handleStart = () => {
    if (template) {
      startWorkout(template);
      onClose();
    }
  };

  if (!visible) return null;

  const totalExercises = template?.workout_template_exercises?.length || 0;
  const totalSets = template?.workout_template_exercises?.reduce((acc, ex) => acc + (ex.workout_template_sets?.length || 0), 0) || 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        
        {/* Overlay Scuro (Fix Click: Usa TouchableWithoutFeedback per cliccare ovunque fuori) */}
        <TouchableWithoutFeedback onPress={onClose}>
           <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
              <BlurView intensity={40} tint="dark" style={{ flex: 1 }} />
              <View className="absolute inset-0 bg-black/60" />
           </View>
        </TouchableWithoutFeedback>
        
        <View style={{ height: height * 0.90 }} className="bg-white rounded-t-[40px] shadow-2xl overflow-hidden relative">
          
          {/* Header Aggiornato: Solido con sfumatura */}
          <View className="bg-[#111] px-6 pt-10 pb-6 flex-row justify-between items-start">
             <View className="flex-1 pr-4">
                <View className="bg-white/10 self-start px-3 py-1.5 rounded-full mb-3">
                  <Text className="text-white/80 font-bold uppercase text-[10px] tracking-widest">
                    {isLoading ? "Caricamento..." : "Workout Preview"}
                  </Text>
                </View>
                
                {!isLoading && (
                  <Text className="text-white font-black text-3xl tracking-tighter leading-tight" numberOfLines={2}>
                    {template?.name || 'Errore'}
                  </Text>
                )}

                {!isLoading && !isError && (
                  <View className="flex-row items-center mt-4 gap-x-4">
                    <View className="flex-row items-center">
                      <Clock size={14} color="#AAA" />
                      <Text className="text-gray-300 font-bold text-xs ml-1.5">~ {(totalSets * 3.5).toFixed(0)} min</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Flame size={14} color="#AAA" />
                      <Text className="text-gray-300 font-bold text-xs ml-1.5">{totalSets} Serie · {totalExercises} Esercizi</Text>
                    </View>
                  </View>
                )}
             </View>
             
             {/* Tasto Chiudi */}
             <TouchableOpacity onPress={onClose} className="bg-white/10 p-2.5 rounded-full mt-1">
               <X size={20} color="#FFF" />
             </TouchableOpacity>
          </View>
          
          {/* L'Effetto Sfumato (Separazione non netta) */}
          <LinearGradient colors={['#111', '#F9FAFB']} style={{ height: 20, width: '100%' }} />

          {/* Elenco Esercizi */}
          <ScrollView className="px-6 pt-2 bg-[#F9FAFB] flex-1">
            <Text className="text-black/40 font-black uppercase tracking-[3px] text-xs mb-6">
              Programma
            </Text>
            
            {isError && <Text className="text-red-500 font-bold">Impossibile scaricare la scheda.</Text>}

            {!isLoading && template?.workout_template_exercises?.sort((a, b) => a.exercise_order - b.exercise_order).map((te, idx) => {
              const exerciseData = te.exercises as unknown as Exercise;

              return (
                <View key={te.id} className="bg-white rounded-[32px] p-5 mb-5 shadow-sm border border-black/5">
                  <View className="flex-row items-center mb-5">
                    <View className="bg-black w-8 h-8 rounded-full items-center justify-center mr-3 shadow-md">
                      <Text className="font-black text-white text-xs">{idx + 1}</Text>
                    </View>
                    
                    {exerciseData?.image_url ? (
                      <Image source={{ uri: exerciseData.image_url }} className="w-12 h-12 rounded-xl bg-gray-100 mr-3" />
                    ) : (
                      <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center mr-3">
                        <Dumbbell size={20} color="#CCC" />
                      </View>
                    )}

                    <View className="flex-1">
                      <Text className="font-black text-black text-lg tracking-tight leading-tight">
                        {exerciseData?.name || 'Esercizio'}
                      </Text>
                      <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mt-1">
                        {exerciseData?.target_muscle || 'Muscoli Vari'}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-[#F9FAFB] rounded-2xl p-4 border border-black/5">
                    <View className="flex-row pb-2 mb-2 border-b border-black/5">
                      <Text className="text-gray-400 font-black text-[10px] uppercase w-10 text-center">Set</Text>
                      <Text className="text-gray-400 font-black text-[10px] uppercase flex-1">Tipo</Text>
                      <Text className="text-gray-400 font-black text-[10px] uppercase w-16 text-center">Reps</Text>
                      <Text className="text-gray-400 font-black text-[10px] uppercase w-16 text-center">Rest</Text>
                    </View>

                    {te.workout_template_sets?.sort((s1, s2) => s1.set_number - s2.set_number).map((ts) => (
                      <View key={ts.id} className="flex-row items-center py-2.5 border-b border-black/[0.02]">
                        <Text className="text-black font-black text-xs w-10 text-center">{ts.set_number}</Text>
                        
                        <View className="flex-1">
                          <View className={`self-start px-2 py-1.5 rounded-lg ${ts.set_type === 'normal' ? 'bg-gray-200' : 'bg-yellow-100'}`}>
                            <Text className={`text-[9px] font-black uppercase tracking-widest ${ts.set_type === 'normal' ? 'text-gray-600' : 'text-yellow-700'}`}>
                              {ts.set_type}
                            </Text>
                          </View>
                        </View>
                        
                        <Text className="text-black font-black text-sm w-16 text-center">{ts.target_reps_max || '-'}</Text>
                        <Text className="text-gray-500 font-bold text-xs w-16 text-center">{ts.rest_seconds}s</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
            
            <View className="h-40" />
          </ScrollView>

          {/* Tasti d'Azione (Modifica 1/4 + Avvia 3/4) in basso */}
          <View className="absolute bottom-0 w-full px-6 pb-10 pt-4 bg-white/90 border-t border-black/5 flex-row gap-x-3">
            
            {/* Tasto Modifica (25%) */}
            <TouchableOpacity 
              onPress={() => {
                if (onEdit && template) onEdit(template);
                else Alert.alert("Modalità Edit", "Caricamento template in corso...");
              }}
              className="bg-gray-100 items-center justify-center rounded-[24px] border border-gray-200"
              style={{ flex: 0.25, height: 60 }}
              activeOpacity={0.7}
            >
              <Edit3 size={24} color="#000" />
            </TouchableOpacity>

            {/* Tasto Avvia (75%) */}
            <TouchableOpacity 
              onPress={handleStart}
              disabled={isLoading || isError}
              className={`${isLoading || isError ? 'bg-gray-300' : 'bg-black'} rounded-[24px] flex-row items-center justify-center shadow-xl shadow-black/20`}
              style={{ flex: 0.75, height: 60 }}
              activeOpacity={0.8}
            >
              {!isLoading && !isError && <Play size={20} color="white" fill="white" className="mr-3" />}
              <Text className="text-white font-black uppercase tracking-widest text-base">
                {isLoading ? 'Caricamento...' : 'Avvia Sessione'}
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
}
