import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, PlaySquare, History, FileText, Save, Info } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkoutService } from '../../api/workoutService';
import { useExerciseModal } from '../../store/useExerciseModal';
import ExerciseVideoPlayer from './ExerciseVideoPlayer';
import ExerciseCharts from './ExerciseCharts';
import { LinearGradient } from 'expo-linear-gradient';

export default function ExerciseDetailModal() {
  const { isOpen, selectedExerciseId, closeModal } = useExerciseModal();
  const [activeTab, setActiveTab] = useState<'descrizione' | 'history'>('descrizione');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setActiveTab('descrizione');
      setEditingNotes({});
    }
  }, [isOpen]);

  const { data: baseInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ['exerciseBaseInfo', selectedExerciseId],
    queryFn: () => WorkoutService.getExerciseBaseInfo(selectedExerciseId!),
    enabled: !!selectedExerciseId && isOpen,
  });

  const { data: historySessions, isLoading: loadingHistory } = useQuery({
    queryKey: ['exerciseHistory', selectedExerciseId],
    queryFn: () => WorkoutService.getExerciseHistory(selectedExerciseId!),
    enabled: !!selectedExerciseId && isOpen,
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ sessionId, notes }: { sessionId: string; notes: string }) => WorkoutService.updateSessionNotes(sessionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseHistory', selectedExerciseId] });
    }
  });

  if (!isOpen) return null;

  const exName = baseInfo?.name || 'Caricamento...';
  const exMuscle = baseInfo?.target_muscle_group || 'Misto';
  const exEquipment = baseInfo?.equipment || 'Bodyweight';
  const instructions = baseInfo?.instructions || '';

  const handleNotesChange = (sessionId: string, val: string) => {
     setEditingNotes(prev => ({...prev, [sessionId]: val}));
  };

  const saveNotes = (sessionId: string) => {
     if(editingNotes[sessionId] !== undefined) {
        updateNotesMutation.mutate({ sessionId, notes: editingNotes[sessionId] });
     }
  };

  const mockupVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

  return (
    <View className="absolute inset-0 z-[105] elevation-[105]">
      <TouchableOpacity activeOpacity={1} onPress={closeModal} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center' }} />
      
      <View className="absolute bottom-0 w-full h-[93%] rounded-t-[40px] overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <BlurView intensity={100} tint="dark" className="flex-1 border-t border-x border-white/10">
          
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
            
            <View className="w-full items-center pt-3 pb-2">
                <View className="w-12 h-1.5 bg-white/30 rounded-full" />
            </View>

             <View className="px-6 pt-2 pb-6 border-b border-white/5">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-4">
                    {loadingInfo ? (
                       <ActivityIndicator size="small" color="#10B981" className="self-start mb-2" />
                    ) : (
                       <Text className="text-white text-3xl font-black tracking-tighter leading-8" numberOfLines={2}>{exName}</Text>
                    )}
                    <View className="flex-row items-center mt-2">
                       <View className="bg-white/10 px-2 py-0.5 rounded-md mr-2">
                          <Text className="text-gray-300 font-bold uppercase text-[10px] tracking-widest">{exMuscle}</Text>
                       </View>
                       <Text className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{exEquipment}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={closeModal}
                    className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/5"
                  >
                    <X size={20} color="white" />
                  </TouchableOpacity>
                </View>
             </View>

             {/* Navigation Pills (2 TABS) */}
             <View className="px-6 mt-4">
                <View className="flex-row bg-black/40 rounded-full p-1 border border-white/5">
                  <TouchableOpacity
                    onPress={() => setActiveTab('descrizione')}
                    className={`flex-1 py-2.5 rounded-full flex-row justify-center items-center ${activeTab === 'descrizione' ? 'bg-white/10' : 'bg-transparent'}`}
                  >
                    <Info size={14} color={activeTab === 'descrizione' ? '#10B981' : '#6B7280'} style={{ marginRight: 6 }} />
                    <Text className={`font-black uppercase tracking-widest text-[10px] ${activeTab === 'descrizione' ? 'text-white' : 'text-gray-500'}`}>
                      Descrizione
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActiveTab('history')}
                    className={`flex-1 py-2.5 rounded-full flex-row justify-center items-center ${activeTab === 'history' ? 'bg-white/10' : 'bg-transparent'}`}
                  >
                    <History size={14} color={activeTab === 'history' ? '#10B981' : '#6B7280'} style={{ marginRight: 6 }} />
                    <Text className={`font-black uppercase tracking-widest text-[10px] ${activeTab === 'history' ? 'text-white' : 'text-gray-500'}`}>
                      Storico
                    </Text>
                  </TouchableOpacity>
                </View>
             </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
              
              {activeTab === 'descrizione' && (
                <View className="pb-10">
                  <ExerciseVideoPlayer videoUrl={mockupVideoUrl} />
                  
                  <View className="mt-8 bg-black/40 rounded-[32px] p-6 border border-white/5 shadow-inner">
                    <Text className="text-white text-xl font-black mb-4 tracking-tight">Istruzioni d'Esecuzione</Text>
                    <Text className="text-gray-400 text-sm leading-6">
                      {instructions && instructions.trim().length > 0
                        ? instructions
                        : 'Manca la documentazione per questo esercizio. Focus sulla contrazione e discesa lenta (Tempo 3-0-1-0).'}
                    </Text>
                  </View>

                  <ExerciseCharts historyData={historySessions || []} />
                </View>
              )}

              {activeTab === 'history' && (
                 <View className="pb-10">
                   {loadingHistory ? (
                      <ActivityIndicator size="large" color="#10B981" className="mt-10" />
                   ) : historySessions && historySessions.length > 0 ? (
                     historySessions.map((session: any, idx: number) => {
                       const sessionNotes = editingNotes[session.session_id] !== undefined ? editingNotes[session.session_id] : session.notes;

                       return (
                         <View
                           key={`${session.session_id}-${idx}`}
                           className={`rounded-[32px] p-5 mb-4 border border-white/5 shadow-sm ${idx === 0 ? 'bg-white/10' : 'bg-black/40'}`}
                         >
                           <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-white/5">
                             <Text className="text-white font-black text-lg">
                               {new Date(session.completed_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                             </Text>
                             <View className="bg-[#10B981]/20 px-3 py-1.5 rounded-full border border-[#10B981]/30">
                               <Text className="text-[#10B981] font-bold text-xs uppercase tracking-widest">Sessione</Text>
                             </View>
                           </View>

                           <View className="flex-row justify-between items-center mb-3 px-2">
                             <Text className="text-gray-500 font-bold w-12 text-center text-xs uppercase tracking-widest">Set</Text>
                             <Text className="text-gray-500 font-bold flex-1 text-center text-xs uppercase tracking-widest">Kg</Text>
                             <Text className="text-gray-500 font-bold flex-1 text-center text-xs uppercase tracking-widest">Reps</Text>
                           </View>

                           {session.sets.map((setItem: any) => (
                             <View
                               key={setItem.id}
                               className="flex-row justify-between items-center bg-black/40 p-3 rounded-2xl mb-2 border border-white/5"
                             >
                               <View className="bg-white/5 border border-white/10 w-8 h-8 rounded-full items-center justify-center">
                                 <Text className="text-gray-300 font-black">{setItem.set_number}</Text>
                               </View>
                               <Text className="text-white font-black text-xl flex-1 text-center tracking-tighter">
                                 {setItem.weight ?? '--'}
                               </Text>
                               <Text className="text-white font-black text-xl flex-1 text-center tracking-tighter">
                                 {setItem.reps ?? '--'}
                               </Text>
                             </View>
                           ))}

                           {/* Note Edit Section */}
                           <View className="mt-4 pt-4 border-t border-white/5">
                             <View className="flex-row items-center mb-2 px-2">
                                <FileText size={14} color="#9CA3AF" />
                                <Text className="text-gray-400 text-xs font-bold ml-1.5 uppercase tracking-widest">Appunti</Text>
                             </View>
                             <View className="bg-black/40 rounded-[20px] p-3 border border-white/5 flex-row items-end">
                               <TextInput
                                 className="flex-1 text-white font-medium text-sm pt-0 pb-0"
                                 multiline
                                 placeholder="Es. 'Ottima spinta ma polso dolorante'"
                                 placeholderTextColor="#666"
                                 value={sessionNotes}
                                 onChangeText={(val) => handleNotesChange(session.session_id, val)}
                               />
                               {editingNotes[session.session_id] !== undefined && editingNotes[session.session_id] !== session.notes && (
                                  <TouchableOpacity onPress={() => saveNotes(session.session_id)} className="bg-[#10B981] p-2 rounded-full ml-2 shadow-lg shadow-green-900/50">
                                     {updateNotesMutation.isPending && updateNotesMutation.variables?.sessionId === session.session_id ? (
                                        <ActivityIndicator size="small" color="black" />
                                     ) : (
                                        <Save size={16} color="black" />
                                     )}
                                  </TouchableOpacity>
                               )}
                             </View>
                           </View>
                         </View>
                       );
                     })
                   ) : (
                     <View className="bg-black/40 rounded-[32px] p-8 items-center justify-center border border-white/5 mt-6 border-dashed">
                       <View className="bg-white/5 w-16 h-16 rounded-full items-center justify-center mb-4 border border-white/10">
                         <History size={24} color="#666" />
                       </View>
                       <Text className="text-white font-black text-lg mb-1 tracking-tight">Nessun log storico</Text>
                       <Text className="text-gray-500 text-xs text-center">Registra le tue performance in allenamento per popolare questi dati.</Text>
                     </View>
                   )}
                 </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </BlurView>
      </View>
    </View>
  );
}
