import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronDown, Check, Clock, Play, Loader2, Timer, X, History, Info } from 'lucide-react-native';
import { useActiveWorkout } from '../../store/useActiveWorkout';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutService } from '../../api/workoutService';
import { useRestTimer } from '../../store/useRestTimer';
import { useExerciseModal } from '../../store/useExerciseModal';
import ExerciseDetailModal from '../../components/exercises/ExerciseDetailModal';

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
              let totalVolume = 0;
              exercises.forEach(ex => {
                ex.sets.forEach(set => {
                  if (set.is_completed && set.real_weight && set.real_reps) {
                    totalVolume += set.real_weight * set.real_reps;
                  }
                });
              });

              await WorkoutService.saveCompletedSession(
                session.user.id,
                useActiveWorkout.getState().templateId,
                startTime,
                totalVolume,
                exercises
              );

              finishWorkout();
              Alert.alert("Complimenti!", "Allenamento salvato con successo.");
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

  if (!isActive) return null;

  return (
    <Modal visible={isExpanded} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsExpanded(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-black">
        {/* HEADER */}
        <View className="pt-6 pb-4 px-6 flex-row items-center justify-between border-b border-white/10 bg-[#111]">
          <TouchableOpacity onPress={() => setIsExpanded(false)} className="p-2 bg-white/10 rounded-full">
            <ChevronDown size={24} color="white" />
          </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-white font-black text-lg tracking-tight uppercase">{routineName}</Text>
          <View className="flex-row items-center mt-1">
             <Clock size={12} color="#00FF00" />
             <Text className="text-[#00FF00] font-bold text-xs ml-1.5">{timeString}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleFinish} className="px-4 py-2 bg-[#00FF00] rounded-full">
           <Text className="text-black font-black text-xs uppercase">Fine</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {exercises.map((ex, idx) => (
          <View key={ex.id} className="mb-6 bg-[#1A1A1A] rounded-3xl p-5 border border-white/5">
            <View className="flex-row items-center justify-between mb-4">
               <TouchableOpacity onPress={() => openExercise(ex.exercise_id)} className="flex-1 mr-2">
                 <Text className="text-white font-black text-xl tracking-tighter" numberOfLines={2}>
                   {idx + 1}. {ex.exercise_name}
                 </Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 onPress={() => openExercise(ex.exercise_id)}
                 className="p-2 rounded-full bg-white/5 border border-white/10"
               >
                 <Info size={16} color="#00FF00" />
               </TouchableOpacity>
            </View>
            
            {/* Header Colonne Serie */}
            <View className="flex-row mb-2 px-2">
              <Text className="flex-1 text-gray-500 font-bold uppercase text-[10px]">Set</Text>
              <Text className="w-16 text-center text-gray-500 font-bold uppercase text-[10px]">KG</Text>
              <Text className="w-16 text-center text-gray-500 font-bold uppercase text-[10px]">Reps</Text>
              <Text className="w-12 text-center text-gray-500 font-bold uppercase text-[10px]">Spunta</Text>
            </View>

            {ex.sets.map((set) => (
              <View 
                key={set.id} 
                className={`flex-row items-center py-2.5 px-2 rounded-xl mb-1 ${set.is_completed ? 'bg-[#00FF00]/10' : 'bg-transparent'}`}
              >
                {/* Tipo / Numero */}
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className={`font-black text-xs ${set.is_completed ? 'text-[#00FF00]' : 'text-white'}`}>
                      {set.set_number}
                    </Text>
                    <View className="ml-2 px-2 py-0.5 bg-white/5 rounded-md">
                      <Text className="text-gray-400 font-bold text-[8px] uppercase">{set.set_type}</Text>
                    </View>
                  </View>
                </View>

                {/* Input Peso */}
                <TextInput
                  className={`w-16 bg-white/5 text-center text-white font-bold rounded-lg py-1.5 mx-1 ${set.is_completed ? 'opacity-50' : ''}`}
                  keyboardType="numeric"
                  placeholder={set.target_weight ? String(set.target_weight) : "-"}
                  placeholderTextColor="#666"
                  value={set.real_weight ? String(set.real_weight) : ''}
                  onChangeText={(val) => updateSet(ex.id, set.id, 'real_weight', parseFloat(val))}
                  editable={!set.is_completed}
                />

                {/* Input Ripetizioni */}
                <TextInput
                  className={`w-16 bg-white/5 text-center text-white font-bold rounded-lg py-1.5 mx-1 ${set.is_completed ? 'opacity-50' : ''}`}
                  keyboardType="numeric"
                  placeholder={set.target_reps ? String(set.target_reps) : "-"}
                  placeholderTextColor="#666"
                  value={set.real_reps ? String(set.real_reps) : ''}
                  onChangeText={(val) => updateSet(ex.id, set.id, 'real_reps', parseInt(val, 10))}
                  editable={!set.is_completed}
                />

                {/* Pulsante di Spunta */}
                <TouchableOpacity 
                   onPress={() => toggleSetComplete(ex.id, set.id)}
                   className={`w-12 h-8 ml-1 rounded-lg items-center justify-center ${set.is_completed ? 'bg-[#00FF00]' : 'bg-white/10'}`}
                >
                   {set.is_completed ? (
                      <Check size={16} color="black" strokeWidth={3} />
                   ) : (
                      <View className="w-4 h-4 rounded-full border-2 border-gray-400" />
                   )}
                </TouchableOpacity>

              </View>
            ))}
          </View>
        ))}

        <View className="h-32 items-center justify-center">
            <TouchableOpacity onPress={handleAbort} className="py-4">
               <Text className="text-red-500 font-bold uppercase tracking-widest text-xs">Annulla Allenamento</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FULL SCREEN REST TIMER */}
      {timerActive && (
        <View className="absolute bottom-8 left-4 right-4 bg-black/90 rounded-[35px] p-4 flex-row items-center justify-between z-50 shadow-2xl border border-white/10">
          <View className="flex-row items-center">
            <View className="bg-blue-500/20 p-2 rounded-full mr-3">
              <Timer size={24} color="#3b82f6" />
            </View>
            <View>
              <Text className="text-gray-400 text-xs font-bold uppercase">Recupero</Text>
              <Text className="text-[#3b82f6] text-xl font-bold font-mono">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => reduceTime(15)} className="bg-white/10 px-3 py-2 rounded-lg mr-2 border border-white/5">
              <Text className="text-white text-sm font-bold">-15</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addTime(15)} className="bg-white/10 px-3 py-2 rounded-lg mr-2 border border-white/5">
              <Text className="text-white text-sm font-bold">+15</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={skipTimer} className="bg-red-500/20 p-2.5 rounded-full">
              <X size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* OVERLAY DI CARICAMENTO */}
      {isSaving && (
        <View className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
           <Text className="text-white text-lg font-bold">Salvataggio in corso...</Text>
        </View>
      )}

      {/* MODALE ESERCIZIO (Se aperta, sovrasta il workout screen) */}
      <ExerciseDetailModal />
      
      </KeyboardAvoidingView>
    </Modal>
  );
}
