import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Check, Clock, Play, Loader2, Timer, X, Info } from 'lucide-react-native';
import { useActiveWorkout } from '../../store/useActiveWorkout';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutService } from '../../api/workoutService';
import { useRestTimer } from '../../store/useRestTimer';
import { useExerciseModal } from '../../store/useExerciseModal';
import { useWorkoutSummaryStore } from '../../store/useWorkoutSummaryStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function ActiveWorkoutScreen() {
  const { isActive, isExpanded, setIsExpanded, routineName, exercises, startTime, updateSet, toggleSetComplete, finishWorkout, cancelWorkout } = useActiveWorkout();
  const { t, i18n } = useTranslation();
  const { isActive: timerActive, timeLeft, addTime, reduceTime, skipTimer } = useRestTimer();
  const { openExercise } = useExerciseModal();
  const { session } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime]);

  const timeString = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  let totalVolume = 0, completedSets = 0, totalSets = 0;
  exercises.forEach(ex => ex.sets.forEach(set => {
    totalSets++;
    if (set.is_completed) { completedSets++; if (set.real_weight && set.real_reps) totalVolume += set.real_weight * set.real_reps; }
  }));

  const handleFinish = () => Alert.alert(t('active_workout.finish_title'), t('active_workout.finish_confirm'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('active_workout.finish'), onPress: async () => {
      if (!session?.user?.id || !startTime) return;
      setIsSaving(true);
      try {
        const summaryData = { timeString, totalVolume, completedSets, routineName: useActiveWorkout.getState().routineName, exercises: exercises.map(ex => ({ name: ex.exercise_name, setsCompleted: ex.sets.filter(s => s.is_completed).length })).filter(ex => ex.setsCompleted > 0) };
        await WorkoutService.saveCompletedSession(session.user.id, useActiveWorkout.getState().templateId, startTime, totalVolume, exercises);
        finishWorkout();
        useWorkoutSummaryStore.getState().openSummary(summaryData);
      } catch { Alert.alert(t('common.error'), t('active_workout.save_error')); }
      finally { setIsSaving(false); }
    }},
  ]);

  const handleAbort = () => Alert.alert(t('active_workout.abort'), t('active_workout.abort_confirm'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('active_workout.abort'), style: 'destructive', onPress: cancelWorkout },
  ]);

  if (!isActive || !isExpanded) return null;

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
      {/* Gradiente pieno — stesso dell'app */}
      <LinearGradient colors={['#171717', '#D1D5DB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
      <LinearGradient colors={['rgba(16,185,129,0.2)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

          {/* HEADER — tutto in un blocco compatto */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
            {/* Riga 1: collapse + titolo + fine */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={() => setIsExpanded(false)} className="p-2 bg-white/10 rounded-full border border-white/10">
                <ChevronDown size={22} color="#FFF" />
              </TouchableOpacity>
              <Text className="text-white font-black text-base uppercase tracking-widest flex-1 text-center mx-3" numberOfLines={1}>{routineName}</Text>
              <TouchableOpacity onPress={handleFinish} style={{ backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30 }}>
                <Text style={{ color: '#000', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}>{t('active_workout.finish')}</Text>
              </TouchableOpacity>
            </View>

            {/* Riga 2: stats centralizzate nell'header */}
            <View className="flex-row justify-center gap-x-3">
              <View className="flex-row items-center bg-[#10B981]/12 px-4 py-2.5 rounded-2xl border border-[#10B981]/20">
                <Clock size={16} color="#10B981" />
                <Text className="text-[#10B981] font-black text-base ml-2 font-mono">{timeString}</Text>
              </View>
              <View className="flex-row items-center bg-blue-500/10 px-4 py-2.5 rounded-2xl border border-blue-500/20">
                <Check size={16} color="#3B82F6" />
                <Text className="text-blue-400 font-black text-base ml-2 font-mono">{completedSets}/{totalSets}</Text>
              </View>
              <View className="flex-row items-center bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10">
                <Text className="text-white font-black text-sm font-mono">{totalVolume.toLocaleString()} kg</Text>
              </View>
            </View>
          </View>

          {/* LISTA ESERCIZI */}
          <ScrollView className="flex-1 px-4 mt-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {exercises.map((ex, idx) => (
              <View key={ex.id} className="mb-5 bg-black/25 rounded-3xl p-4 border border-white/10">
                <View className="flex-row items-center justify-between mb-3">
                  <TouchableOpacity onPress={() => openExercise(ex.exercise_id)} className="flex-1 mr-2">
                    <Text className="text-white font-black text-lg tracking-tighter" numberOfLines={1}>{idx + 1}. {ex.exercise_name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openExercise(ex.exercise_id)} className="p-2 rounded-full bg-white/10 border border-white/10">
                    <Info size={15} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row mb-2 px-1">
                  <Text className="flex-1 text-gray-400 font-bold uppercase text-[9px] tracking-widest">Set</Text>
                  <Text className="w-16 text-center text-gray-400 font-bold uppercase text-[9px] tracking-widest">KG</Text>
                  <Text className="w-16 text-center text-gray-400 font-bold uppercase text-[9px] tracking-widest">Reps</Text>
                  <Text className="w-12 text-center text-gray-400 font-bold uppercase text-[9px] tracking-widest">✓</Text>
                </View>

                {ex.sets.map((set) => (
                  <View key={set.id} className={`flex-row items-center py-2 px-1 rounded-xl mb-1 ${set.is_completed ? 'bg-[#10B981]/15 border border-[#10B981]/20' : 'border border-transparent'}`}>
                    <View className="flex-1 flex-row items-center">
                      <Text className={`font-black text-xs ${set.is_completed ? 'text-[#10B981]' : 'text-white'}`}>{set.set_number}</Text>
                      <View className="ml-2 px-1.5 py-0.5 bg-white/10 rounded">
                        <Text className="text-gray-400 font-bold text-[7px] uppercase">{t(`difficulty.${set.set_type}`)}</Text>
                      </View>
                    </View>
                    <View className={`w-16 bg-black/40 rounded-lg mx-1 border ${set.is_completed ? 'border-transparent opacity-40' : 'border-white/10'}`}>
                      <TextInput className="text-center text-white font-black py-1.5 text-sm" keyboardType="numeric" maxLength={4} placeholder={set.target_weight ? String(set.target_weight) : '-'} placeholderTextColor="#555" value={set.real_weight ? String(set.real_weight) : ''} onChangeText={(v) => updateSet(ex.id, set.id, 'real_weight', parseFloat(v))} editable={!set.is_completed} />
                    </View>
                    <View className={`w-16 bg-black/40 rounded-lg mx-1 border ${set.is_completed ? 'border-transparent opacity-40' : 'border-white/10'}`}>
                      <TextInput className="text-center text-white font-black py-1.5 text-sm" keyboardType="numeric" maxLength={4} placeholder={set.target_reps ? String(set.target_reps) : '-'} placeholderTextColor="#555" value={set.real_reps ? String(set.real_reps) : ''} onChangeText={(v) => updateSet(ex.id, set.id, 'real_reps', parseInt(v, 10))} editable={!set.is_completed} />
                    </View>
                    <TouchableOpacity onPress={() => toggleSetComplete(ex.id, set.id)} style={{ width: 48, height: 32, marginLeft: 4, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: set.is_completed ? '#10B981' : 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: set.is_completed ? 'transparent' : 'rgba(255,255,255,0.1)' }}>
                      <Check size={17} color={set.is_completed ? '#000' : '#6B7280'} strokeWidth={set.is_completed ? 3 : 2} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            <View className="h-32 items-center justify-center">
              <TouchableOpacity 
                onPress={handleAbort} 
                className="py-4 px-12 bg-red-600 rounded-full shadow-lg shadow-red-900/40 border border-red-500/50"
              >
                <Text className="text-white font-black uppercase tracking-[3px] text-xs">{t('active_workout.abort')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* REST TIMER */}
          {timerActive && (
            <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16, borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
              <LinearGradient colors={['rgba(23,23,23,0.97)', 'rgba(28,37,53,0.97)']} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} />
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
                <View className="flex-row items-center">
                  <View className="bg-blue-500/20 p-2 rounded-full mr-3 border border-blue-500/30"><Timer size={22} color="#60A5FA" /></View>
                  <View>
                    <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">{t('active_workout.rest')}</Text>
                    <Text className="text-white text-2xl font-black font-mono">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-x-2">
                  <TouchableOpacity onPress={() => reduceTime(15)} className="bg-white/10 px-3 py-2 rounded-xl border border-white/10"><Text className="text-white text-sm font-bold">-15</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => addTime(15)} className="bg-white/10 px-3 py-2 rounded-xl border border-white/10"><Text className="text-white text-sm font-bold">+15</Text></TouchableOpacity>
                  <TouchableOpacity onPress={skipTimer} className="bg-red-500/20 p-2.5 rounded-full border border-red-500/30"><X size={18} color="#F87171" /></TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* OVERLAY SALVATAGGIO */}
          {isSaving && (
            <View style={{ position: 'absolute', inset: 0, zIndex: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
              <View className="bg-black/90 px-8 py-5 rounded-3xl border border-white/10 flex-row items-center">
                <Loader2 size={22} color="#FFF" style={{ marginRight: 12 }} />
                <Text className="text-white text-base font-black">{t('active_workout.saving')}</Text>
              </View>
            </View>
          )}

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
