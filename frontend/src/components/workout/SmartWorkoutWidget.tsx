import React from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Timer, X, Check, ChevronUp } from 'lucide-react-native';
import { useActiveWorkout } from '../../store/useActiveWorkout';
import { useRestTimer } from '../../store/useRestTimer';
import { useExerciseModal } from '../../store/useExerciseModal';

interface SmartWorkoutWidgetProps {
  onPressExpand: () => void;
}
export default function SmartWorkoutWidget({ onPressExpand }: SmartWorkoutWidgetProps) {
  const { isActive: workoutActive, exercises, updateSet, toggleSetComplete } = useActiveWorkout();
  const { isActive: timerActive, timeLeft, addTime, reduceTime, skipTimer } = useRestTimer();
  const { openExercise } = useExerciseModal();

  if (!workoutActive) return null;

  // Trova il Set corrente
  let currentExercise = null;
  let currentSet = null;
  let nextExercise = null;
  let nextSet = null;

  let foundCurrent = false;

  for (let i = 0; i < exercises.length; i++) {
    for (let j = 0; j < exercises[i].sets.length; j++) {
      const s = exercises[i].sets[j];
      if (!s.is_completed) {
        if (!foundCurrent) {
          currentExercise = exercises[i];
          currentSet = s;
          foundCurrent = true;
        } else if (!nextSet) {
          nextExercise = exercises[i];
          nextSet = s;
        }
      }
    }
  }

  // Fallback se tutti completati
  if (!currentExercise && exercises.length > 0) {
     currentExercise = exercises[exercises.length - 1];
     currentSet = currentExercise.sets[currentExercise.sets.length - 1];
  }

  const handleCheck = () => {
    if (currentExercise && currentSet) {
      toggleSetComplete(currentExercise.id, currentSet.id);
    }
  };

  const getSetColor = (type: string) => {
    switch(type) {
      case 'warmup': return 'bg-yellow-500/20 text-yellow-500';
      case 'normal': return 'bg-green-500/20 text-[#00FF00]';
      case 'failure': return 'bg-red-500/20 text-red-500';
      case 'dropset': return 'bg-orange-500/20 text-orange-500';
      case 'backoff': return 'bg-purple-500/20 text-purple-400';
      case 'superset': return 'bg-pink-500/20 text-pink-400';
      case 'cluster': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const restMinutes = Math.floor(timeLeft / 60);
  const restSeconds = timeLeft % 60;
  const restString = `${restMinutes}:${restSeconds.toString().padStart(2, '0')}`;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'position' : undefined} 
      keyboardVerticalOffset={10}
      className="absolute bottom-[110px] left-3 right-3 z-[990] shadow-2xl shadow-black/80"
      pointerEvents="box-none"
    >
      <TouchableOpacity activeOpacity={1} onPress={onPressExpand}>
        <BlurView intensity={80} tint="light" className="rounded-[32px] border border-black/5 overflow-hidden bg-white/80 mx-1 shadow-lg shadow-black/5">
          
          {timerActive ? (
            // =====================================
            // STATO 2: RECUPERO (TIMER)
            // =====================================
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between mb-3">
                 <View className="flex-row items-center">
                    <View className="bg-[#00FF00]/20 p-2.5 rounded-full mr-3">
                      <Timer size={20} color="#00FF00" />
                    </View>
                    <View>
                      <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Recupero</Text>
                      <Text className="text-[#00FF00] text-3xl font-black font-mono tracking-tighter -mt-1">{restString}</Text>
                    </View>
                 </View>

                 <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={() => reduceTime(15)} className="bg-black/5 px-3 py-2.5 rounded-xl border border-black/5">
                      <Text className="text-black text-xs font-bold">-15</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => addTime(15)} className="bg-black/5 px-3 py-2.5 rounded-xl border border-black/5">
                      <Text className="text-black text-xs font-bold">+15</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={skipTimer} className="bg-red-500/20 p-2.5 rounded-full border border-red-500/30 ml-1">
                      <X size={16} color="#ef4444" strokeWidth={3} />
                    </TouchableOpacity>
                 </View>
              </View>

              {/* Sezione Up Next */}
              {nextExercise && nextSet && (
                 <View className="bg-white/5 rounded-2xl p-3 flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-0.5">Up Next</Text>
                      <Text className="text-black font-bold text-sm" numberOfLines={1}>{nextExercise.exercise_name}</Text>
                    </View>
                    <View className="items-end">
                      <View className={`px-2 py-1 rounded-md ${getSetColor(nextSet.set_type).split(' ')[0]}`}>
                        <Text className={`text-[9px] uppercase font-black tracking-wider ${getSetColor(nextSet.set_type).split(' ')[1]}`}>
                          Set {nextSet.set_number} • {nextSet.set_type}
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-xs font-bold mt-1">
                        {nextSet.target_reps || '-'} reps @ {nextSet.target_weight || '-'} kg
                      </Text>
                    </View>
                 </View>
              )}
            </View>
          ) : (
            // =====================================
            // STATO 1: ESERCIZIO ATTIVO (WORK) 
            // =====================================
            <View className="px-5 py-4 flex-row items-center justify-between">
               
               <View className="flex-1 mr-4">
                 {/* Badge Tipo Serie */}
                 {currentSet && (
                   <View className="flex-row items-center mb-1">
                     <View className={`px-2 py-0.5 rounded-md ${getSetColor(currentSet.set_type).split(' ')[0]}`}>
                        <Text className={`text-[8px] uppercase font-black tracking-wider ${getSetColor(currentSet.set_type).split(' ')[1]}`}>
                          {currentSet.set_type} • Set {currentSet.set_number}
                        </Text>
                     </View>
                   </View>
                 )}
                 <View>
                   <Text className="text-black font-black text-xl uppercase tracking-tighter mb-2" numberOfLines={1}>
                     {currentExercise ? currentExercise.exercise_name : 'Finito!'}
                   </Text>
                 </View>

                 {/* Inputs Compatti */}
                 {currentSet && !currentSet.is_completed && (
                   <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center bg-black/5 rounded-xl border border-black/5 px-2 py-1.5 focus-within:border-black/20">
                         <TextInput
                            className="text-black font-black text-lg text-center w-12 p-0 m-0"
                            keyboardType="numeric"
                            placeholder={currentSet.target_weight ? String(currentSet.target_weight) : '-'}
                            placeholderTextColor="#999"
                            value={currentSet.real_weight ? String(currentSet.real_weight) : ''}
                            onChangeText={(val) => updateSet(currentExercise!.id, currentSet!.id, 'real_weight', parseFloat(val) || 0)}
                         />
                         <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest ml-1 mr-1">KG</Text>
                      </View>

                      <View className="flex-row items-center bg-black/5 rounded-xl border border-black/5 px-2 py-1.5 focus-within:border-black/20">
                         <TextInput
                            className="text-black font-black text-lg text-center w-10 p-0 m-0"
                            keyboardType="numeric"
                            placeholder={currentSet.target_reps ? String(currentSet.target_reps) : '-'}
                            placeholderTextColor="#999"
                            value={currentSet.real_reps ? String(currentSet.real_reps) : ''}
                            onChangeText={(val) => updateSet(currentExercise!.id, currentSet!.id, 'real_reps', parseInt(val, 10) || 0)}
                         />
                         <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest ml-1 mr-1">Reps</Text>
                      </View>
                   </View>
                 )}
               </View>

               {/* Spunta Gigante o Chevron */}
               <View className="items-center justify-center">
                 {currentSet && !currentSet.is_completed ? (
                   <TouchableOpacity onPress={handleCheck} className="w-16 h-16 bg-black rounded-full items-center justify-center shadow-xl shadow-black/20">
                     <Check size={36} color="white" strokeWidth={3} />
                   </TouchableOpacity>
                 ) : (
                   <View className="w-14 h-14 bg-black/5 rounded-full items-center justify-center">
                     <ChevronUp size={28} color="#000" />
                   </View>
                 )}
               </View>
            </View>
          )}

        </BlurView>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
