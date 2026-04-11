// frontend/src/components/workout/WorkoutPreviewScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Play, Clock, Flame, Dumbbell, Edit3, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useActiveWorkout } from '../../store/useActiveWorkout';
import { useExerciseModal } from '../../store/useExerciseModal';
import { useWorkoutPreviewStore } from '../../store/useWorkoutPreviewStore';
import { useCreateRoutineStore } from '../../store/useCreateRoutineStore';
import { WorkoutTemplate, Exercise } from '../../../../shared/types';
import { supabase } from '../../api/supabaseClient';

const { height } = Dimensions.get('window');

export default function WorkoutPreviewScreen() {
  const { isOpen, templateId, closePreview } = useWorkoutPreviewStore();
  const { openEdit } = useCreateRoutineStore();
  
  const startWorkout = useActiveWorkout((state) => state.startWorkout);
  const isActiveWorkout = useActiveWorkout((state) => state.isActive);
  const { openExercise } = useExerciseModal();

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
    enabled: !!templateId && isOpen,
  });

  const handleStart = () => {
    if (template) {
      if (isActiveWorkout) {
        Alert.alert(
          "Allenamento in corso",
          "Vuoi sovrascriverlo perdendo i dati correnti?",
          [
            { text: "Annulla", style: "cancel" },
            { 
              text: "Sovrascrivi", 
              style: "destructive", 
              onPress: () => {
                startWorkout(template);
                closePreview();
              }
            }
          ]
        );
      } else {
        startWorkout(template);
        closePreview();
      }
    }
  };

  const handleEdit = () => {
    if (template) {
      closePreview();
      setTimeout(() => {
        openEdit(template);
      }, 50); // slight delay to unmount preview
    }
  };

  if (!isOpen) return null;

  const totalExercises = template?.workout_template_exercises?.length || 0;
  const totalSets = template?.workout_template_exercises?.reduce((acc, ex) => acc + (ex.workout_template_sets?.length || 0), 0) || 0;

  return (
    <View className="absolute inset-0 z-[100] elevation-[100]">
      {/* Sfondo Oscurato cliccabile */}
      <TouchableOpacity activeOpacity={1} onPress={closePreview} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center' }} />
      
      {/* Contenitore APPLE STYLE BOTTOM SHEET */}
      <View className="absolute bottom-0 w-full h-[93%] rounded-t-[40px] overflow-hidden shadow-2xl">
        <BlurView intensity={100} tint="dark" className="flex-1 border-t border-x border-white/10">
          
          {/* Maniglietta visiva stile iOS */}
           <View className="w-full items-center pt-3 pb-2">
               <View className="w-12 h-1.5 bg-white/30 rounded-full" />
           </View>
          
          {/* Full Screen Content Wrapper */}
          <View className="flex-1 pt-2 relative">
            
            {/* Header Action Bar */}
            <View className="flex-row justify-between items-center px-6 mb-4">
               <TouchableOpacity onPress={closePreview} className="bg-white/10 p-2.5 rounded-full border border-white/5">
                 <X size={24} color="#FFF" />
               </TouchableOpacity>
               
               <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
                  <Text className="text-white/80 font-bold uppercase text-[10px] tracking-widest">
                    Preview
                  </Text>
               </View>
               <View className="w-10" /> {/* spacer for balance */}
            </View>

            {/* Hero Meta Info */}
            <View className="px-6 pb-6">
              {isLoading ? null : (
                <Text className="text-white font-black text-4xl tracking-tighter leading-tight" numberOfLines={2}>
                  {template?.name ? template.name : 'Errore'}
                </Text>
              )}

              {isLoading || isError ? null : (
                <View className="flex-row items-center mt-4 gap-x-4">
                  <View className="flex-row items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5 shadow-inner">
                    <Clock size={16} color="#A0AEC0" />
                    <Text className="text-gray-300 font-bold text-xs ml-1.5">~ {(totalSets * 3.5).toFixed(0)} min</Text>
                  </View>
                  <View className="flex-row items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5 shadow-inner">
                    <Flame size={16} color="#A0AEC0" />
                    <Text className="text-gray-300 font-bold text-xs ml-1.5">{totalSets} Set · {totalExercises} Ex</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Sfumatura che degrada nei contenuti */}
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']} style={{ height: 20, width: '100%' }} />

            {/* List Wrapper - Glass Container */}
            <View className="flex-1 bg-black/40 rounded-t-[40px] overflow-hidden border-t border-white/5 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
              <ScrollView className="px-6 pt-6 flex-1 shadow-inner">
                
                {isError ? <Text className="text-red-500 font-bold">Impossibile scaricare la scheda.</Text> : null}
                {isLoading ? <Text className="text-gray-400 font-bold mt-10 text-center">Caricamento scheda in corso...</Text> : null}

                {!isLoading && template?.workout_template_exercises ? template.workout_template_exercises.sort((a, b) => a.exercise_order - b.exercise_order).map((te, idx) => {
                  const exerciseData = te.exercises as unknown as Exercise;

                  return (
                    <View key={te.id} className="bg-white/5 rounded-[32px] p-5 mb-5 shadow-sm border border-white/5">
                      <View className="flex-row items-center mb-5">
                        <View className="bg-black/50 border border-white/10 w-8 h-8 rounded-full items-center justify-center mr-3">
                          <Text className="font-black text-white text-xs">{idx + 1}</Text>
                        </View>
                        
                        {exerciseData?.image_url ? (
                          <Image source={{ uri: exerciseData.image_url }} className="w-12 h-12 rounded-xl bg-gray-900 border border-white/5 mr-3" />
                        ) : (
                          <View className="w-12 h-12 rounded-xl bg-white/5 items-center justify-center border border-white/5 mr-3">
                            <Dumbbell size={20} color="#666" />
                          </View>
                        )}

                        <View className="flex-1">
                          <TouchableOpacity onPress={() => { if(exerciseData?.id) openExercise(exerciseData.id) }}>
                            <Text className="font-black text-white text-lg tracking-tight leading-tight">
                              {exerciseData?.name ? exerciseData.name : 'Esercizio'}
                            </Text>
                          </TouchableOpacity>
                          <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider mt-1">
                            {exerciseData?.target_muscle ? exerciseData.target_muscle : 'Muscoli Vari'}
                          </Text>
                        </View>
                      </View>

                      <View className="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner">
                        <View className="flex-row pb-2 mb-2 border-b border-white/5 px-2">
                          <Text className="text-gray-500 font-black text-[10px] uppercase w-10 text-center">Set</Text>
                          <Text className="text-gray-500 font-black text-[10px] uppercase flex-1 text-center">Tipo</Text>
                          <Text className="text-gray-500 font-black text-[10px] uppercase w-16 text-center">Reps</Text>
                          <Text className="text-gray-500 font-black text-[10px] uppercase w-16 text-center">Rest</Text>
                        </View>

                        {te.workout_template_sets ? te.workout_template_sets.sort((s1, s2) => s1.set_number - s2.set_number).map((ts) => (
                          <View key={ts.id} className="flex-row items-center py-2.5 px-2 border-b border-white/[0.02]">
                            <Text className="text-white font-black text-xs w-10 text-center">{ts.set_number}</Text>
                            
                            <View className="flex-1 items-center">
                              <View className={`px-2 py-1.5 rounded-lg border border-white/5 ${ts.set_type === 'normal' ? 'bg-white/10' : 'bg-yellow-500/20'}`}>
                                <Text className={`text-[9px] font-black uppercase tracking-widest ${ts.set_type === 'normal' ? 'text-gray-300' : 'text-yellow-500'}`}>
                                  {ts.set_type}
                                </Text>
                              </View>
                            </View>
                            
                            <Text className="text-white font-black text-sm w-16 text-center">{ts.target_reps_max ? ts.target_reps_max : '-'}</Text>
                            <Text className="text-gray-500 font-bold text-xs w-16 text-center">{ts.rest_seconds}s</Text>
                          </View>
                        )) : null}
                      </View>
                    </View>
                  );
                }) : null}
                
                <View className="h-40" />
              </ScrollView>
            </View>

            {/* Tasti di Azione in Basso */}
            <BlurView intensity={80} tint="dark" className="absolute bottom-0 left-0 right-0 pt-4 pb-10 px-6 border-t border-white/10 flex-row gap-x-3 bg-black/50">
              
              {/* Tasto Modifica */}
              <TouchableOpacity 
                onPress={handleEdit}
                className="bg-white/10 items-center justify-center rounded-[24px] border border-white/10 shadow-sm"
                style={{ flex: 0.25, height: 60 }}
                activeOpacity={0.7}
              >
                <Edit3 size={24} color="#FFF" />
              </TouchableOpacity>

              {/* Tasto Avvia / O bloccato se in corso */}
              {isActiveWorkout ? (
                <View 
                  className="bg-gray-800 rounded-[24px] flex-row items-center justify-center opacity-80 border border-gray-700 shadow-inner"
                  style={{ flex: 0.75, height: 60 }}
                >
                  <Lock size={18} color="#A0AEC0" className="mr-3" />
                  <Text className="text-gray-400 font-black uppercase tracking-widest text-base">
                    In Corso...
                  </Text>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={handleStart}
                  disabled={isLoading || isError}
                  className={`${isLoading || isError ? 'bg-white/20' : 'bg-[#10B981]'} rounded-[24px] flex-row items-center justify-center shadow-xl shadow-green-900/50 border border-transparent`}
                  style={{ flex: 0.75, height: 60 }}
                  activeOpacity={0.8}
                >
                  {isLoading || isError ? null : <Play size={20} color="black" fill="black" className="mr-3" />}
                  <Text className={`font-black uppercase tracking-widest text-base ${isLoading || isError ? 'text-white' : 'text-black'}`}>
                    {isLoading ? 'Caricamento...' : 'Avvia Sessione'}
                  </Text>
                </TouchableOpacity>
              )}

            </BlurView>

          </View>
        </BlurView>
      </View>
    </View>
  );
}
