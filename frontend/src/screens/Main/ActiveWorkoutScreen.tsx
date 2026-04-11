import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Check, Clock, Play, Loader2, Timer, X, History, Info } from 'lucide-react-native';
import { useActiveWorkout } from '../../store/useActiveWorkout';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutService } from '../../api/workoutService';
import { useRestTimer } from '../../store/useRestTimer';
import { useExerciseModal } from '../../store/useExerciseModal';
import { useWorkoutSummaryStore } from '../../store/useWorkoutSummaryStore';
import ExerciseDetailModal from '../../components/exercises/ExerciseDetailModal';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function ActiveWorkoutScreen() {
  const { isActive, isExpanded, setIsExpanded, routineName, exercises, startTime, updateSet, toggleSetComplete, finishWorkout, cancelWorkout } = useActiveWorkout();
  
  const { isActive: timerActive, timeLeft, addTime, reduceTime, skipTimer } = useRestTimer();
  const { openExercise } = useExerciseModal();
  
  const { session } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Calcolo real-time di Volume e Serie Completate
  let totalVolume = 0;
  let completedSets = 0;
  let totalSets = 0;
  exercises.forEach(ex => {
    ex.sets.forEach(set => {
      totalSets++;
      if (set.is_completed) {
        completedSets++;
        if (set.real_weight && set.real_reps) {
          totalVolume += set.real_weight * set.real_reps;
        }
      }
    });
  });

  const handleFinish = () => {
    Alert.alert(
      "Termina Allenamento", 
      "Vuoi salvare e completare questo allenamento?",
      [
        { text: "Cancella", style: "cancel" },
        { 
          text: "Termina", 
          style: "default",
          onPress: async () => {
            if (!session?.user?.id || !startTime) return;
            setIsSaving(true);
            try {
              // Prepara i dati per il Summary 
              const summaryData = {
                 timeString,
                 totalVolume,
                 completedSets,
                 routineName: useActiveWorkout.getState().routineName,
                 exercises: exercises.map(ex => ({
                    name: ex.exercise_name,
                    setsCompleted: ex.sets.filter(s => s.is_completed).length,
                 })).filter(ex => ex.setsCompleted > 0)
              };

              await WorkoutService.saveCompletedSession(
                session.user.id,
                useActiveWorkout.getState().templateId,
                startTime,
                totalVolume,
                exercises
              );

              // Apriamo il Summary e resettiamo
              finishWorkout();
              useWorkoutSummaryStore.getState().openSummary(summaryData);
              
            } catch (error) {
              console.error("Errore salvataggio:", error);
              Alert.alert("Errore", "Si è verificato un errore durante il salvataggio.");
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  }

  const handleAbort = () => {
    Alert.alert(
      "Annulla Allenamento",
      "Vuoi annullare l'allenamento? I dati andranno persi.",
      [
        { text: "Continua", style: "cancel" },
        { text: "Annulla ORA", style: "destructive", onPress: () => {
            cancelWorkout();
        }}
      ]
    );
  }

  if (!isActive || !isExpanded) return null;

  return (
    <View className="absolute inset-0 z-[100] elevation-[100]">
      <BlurView intensity={100} tint="dark" className="flex-1">
        <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          
          {/* HEADER AVANZATO STILE "HEVY" */}
          <View className="pt-2 pb-4 px-6 flex-row items-center justify-between border-b border-white/5 bg-black/40">
            <TouchableOpacity onPress={() => setIsExpanded(false)} className="p-2 bg-white/10 rounded-full border border-white/5">
              <ChevronDown size={24} color="#FFF" />
            </TouchableOpacity>
          
            <View className="items-center flex-1">
              <Text className="text-white font-black text-lg tracking-tight uppercase" numberOfLines={1}>
                {routineName}
              </Text>
              
              <View className="flex-row items-center mt-6 gap-x-6">
                 <View className="flex-row items-center bg-[#10B981]/10 px-3 py-1.5 rounded-lg border border-[#10B981]/20">
                   <Clock size={20} color="#10B981" />
                   <Text className="text-[#10B981] font-black text-lg ml-2 font-mono">{timeString}</Text>
                 </View>
                 <View className="flex-row items-center bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                   <Check size={20} color="#3B82F6" />
                   <Text className="text-[#3B82F6] font-black text-lg ml-2 font-mono">{completedSets}/{totalSets}</Text>
                 </View>
                  <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                   <Text className="text-white font-black text-lg font-mono">{totalVolume.toLocaleString()} Kg</Text>
                 </View>
              </View>
            </View>

            <TouchableOpacity onPress={handleFinish} className="px-6 py-3 bg-[#10B981] rounded-full shadow-lg shadow-green-900/50 border border-t-white/30 border-x-white/20 ml-2">
               <Text className="text-black font-black text-sm uppercase tracking-widest">Fine</Text>
            </TouchableOpacity>
          </View>

        {/* Esercizi */}
        <ScrollView className="flex-1 px-4 mt-8" contentContainerStyle={{ paddingBottom: 100 }}>
          {exercises.map((ex, idx) => (
            <View key={ex.id} className="mb-6 bg-white/5 rounded-3xl p-5 border border-white/5 shadow-sm">
              <View className="flex-row items-center justify-between mb-4">
                 <TouchableOpacity onPress={() => openExercise(ex.exercise_id)} className="flex-1 mr-2">
                   <Text className="text-white font-black text-xl tracking-tighter" numberOfLines={2}>
                     {idx + 1}. {ex.exercise_name}
                   </Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   onPress={() => openExercise(ex.exercise_id)}
                   className="p-2 rounded-full bg-white/10 border border-white/5"
                 >
                   <Info size={16} color="#FFF" />
                 </TouchableOpacity>
              </View>
              
              {/* Header Colonne Serie */}
              <View className="flex-row mb-2 px-2">
                <Text className="flex-1 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Set</Text>
                <Text className="w-16 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest mx-1">KG</Text>
                <Text className="w-16 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest mx-1">Reps</Text>
                <Text className="w-14 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest ml-1">Spunta</Text>
              </View>

              {ex.sets.map((set) => (
                <View 
                  key={set.id} 
                  className={`flex-row items-center py-2.5 px-2 rounded-xl mb-1 ${set.is_completed ? 'bg-[#10B981]/20 border border-[#10B981]/20' : 'bg-transparent border border-transparent'}`}
                >
                  {/* Tipo / Numero */}
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className={`font-black text-xs ${set.is_completed ? 'text-[#10B981]' : 'text-white'}`}>
                        {set.set_number}
                      </Text>
                      <View className="ml-2 px-2 py-0.5 bg-white/10 rounded-md">
                        <Text className="text-gray-300 font-bold text-[8px] uppercase">{set.set_type}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Input Peso */}
                  <View className={`w-16 bg-black/40 rounded-lg mx-1 border border-white/5 focus-within:border-white/20 ${set.is_completed ? 'opacity-50 bg-transparent border-transparent' : ''}`}>
                    <TextInput
                      className="text-center text-white font-black py-1.5"
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder={set.target_weight ? String(set.target_weight) : "-"}
                      placeholderTextColor="#718096"
                      value={set.real_weight ? String(set.real_weight) : ''}
                      onChangeText={(val) => updateSet(ex.id, set.id, 'real_weight', parseFloat(val))}
                      editable={!set.is_completed}
                    />
                  </View>

                  {/* Input Ripetizioni */}
                  <View className={`w-16 bg-black/40 rounded-lg mx-1 border border-white/5 focus-within:border-white/20 ${set.is_completed ? 'opacity-50 bg-transparent border-transparent' : ''}`}>
                    <TextInput
                      className="text-center text-white font-black py-1.5"
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder={set.target_reps ? String(set.target_reps) : "-"}
                      placeholderTextColor="#718096"
                      value={set.real_reps ? String(set.real_reps) : ''}
                      onChangeText={(val) => updateSet(ex.id, set.id, 'real_reps', parseInt(val, 10))}
                      editable={!set.is_completed}
                    />
                  </View>

                  {/* Pulsante di Spunta */}
                  <TouchableOpacity 
                     onPress={() => toggleSetComplete(ex.id, set.id)}
                     className={`w-14 h-8 ml-1 rounded-lg items-center justify-center border ${set.is_completed ? 'bg-[#10B981] border-transparent shadow-sm shadow-green-900/50' : 'bg-white/10 border-white/10 shadow-sm shadow-black/5'}`}
                  >
                     {set.is_completed ? (
                        <Check size={18} color="black" strokeWidth={3} />
                     ) : (
                        <Check size={18} color="#6B7280" strokeWidth={2} />
                     )}
                  </TouchableOpacity>

                </View>
              ))}
            </View>
          ))}

          <View className="h-32 items-center justify-center">
              <TouchableOpacity onPress={handleAbort} className="py-4 px-6 bg-red-900/20 rounded-full border border-red-500/20">
                 <Text className="text-red-400 font-bold uppercase tracking-widest text-xs">Annulla Allenamento</Text>
              </TouchableOpacity>
          </View>
        </ScrollView>

        {/* FULL SCREEN REST TIMER (GLASSMORPHISM) */}
        {timerActive && (
          <View className="absolute bottom-8 left-4 right-4 rounded-[35px] overflow-hidden shadow-2xl shadow-black/50 border border-white/10 z-50">
            <BlurView intensity={80} tint="dark" className="p-4 flex-row items-center justify-between bg-black/40">
              <View className="flex-row items-center">
                <View className="bg-blue-500/20 p-2 rounded-full mr-3 border border-blue-500/30">
                  <Timer size={24} color="#60A5FA" />
                </View>
                <View>
                  <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Recupero</Text>
                  <Text className="text-white text-2xl font-black font-mono leading-tight">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => reduceTime(15)} className="bg-white/10 px-3 py-2 rounded-xl mr-2 border border-white/5 shadow-sm">
                  <Text className="text-white text-sm font-bold">-15</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => addTime(15)} className="bg-white/10 px-3 py-2 rounded-xl mr-2 border border-white/5 shadow-sm">
                  <Text className="text-white text-sm font-bold">+15</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={skipTimer} className="bg-red-500/20 p-2.5 rounded-full border border-red-500/30">
                  <X size={20} color="#F87171" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}

        {/* OVERLAY DI CARICAMENTO */}
        {isSaving && (
          <View className="absolute inset-0 z-50 flex items-center justify-center">
             <BlurView intensity={80} tint="dark" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
             <View className="bg-black/80 px-8 py-5 rounded-3xl shadow-2xl border border-white/10 flex-row items-center">
               <Loader2 size={24} color="#FFF" className="mr-3 animate-spin" />
               <Text className="text-white text-base font-black">Salvataggio...</Text>
             </View>
          </View>
        )}

        </KeyboardAvoidingView>
        </SafeAreaView>
      </BlurView>
    </View>
  );
}
