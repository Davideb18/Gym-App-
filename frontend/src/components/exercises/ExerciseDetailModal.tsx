import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, PlayCircle, Activity, TrendingUp, Flame, History, Info, Save, FileText } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkoutService } from '../../api/workoutService';
import { useExerciseModal } from '../../store/useExerciseModal';

export default function ExerciseDetailModal() {
  const { isOpen, selectedExerciseId, closeModal } = useExerciseModal();
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  
  const queryClient = useQueryClient();

  const [renderModal, setRenderModal] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
      setEditingNotes({});
      setRenderModal(true);
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0,
          speed: 14
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        })
      ]).start();
    } else if (renderModal) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        })
      ]).start(() => setRenderModal(false));
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

  if (!renderModal) return null;

  const exName = baseInfo?.name || 'Caricamento...';
  const exMuscle = baseInfo?.target_muscle_group || 'Misto';
  const exEquipment = baseInfo?.equipment || 'Bodyweight';
  const instructions = baseInfo?.instructions || '';

  // Max weight calculation from real history
  let bestWeight: number | string = '--';
  if (historySessions && historySessions.length > 0) {
     const max = Math.max(...historySessions.flatMap((s: any) => s.sets.map((set: any) => set.weight || 0)));
     if (max > 0) bestWeight = max;
  }

  const handleNotesChange = (sessionId: string, val: string) => {
     setEditingNotes(prev => ({...prev, [sessionId]: val}));
  };

  const saveNotes = (sessionId: string) => {
     if(editingNotes[sessionId] !== undefined) {
        updateNotesMutation.mutate({ sessionId, notes: editingNotes[sessionId] });
     }
  };

  const sheet = (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1, justifyContent: 'flex-end' }}
    >
      <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', opacity: fadeAnim }}>
         <Pressable style={{ flex: 1 }} onPress={closeModal} />
      </Animated.View>
      
      <Animated.View 
         className="w-full h-[92%] rounded-t-[38px] overflow-hidden flex shadow-2xl bg-white"
         style={{ transform: [{ translateY: slideAnim }] }}
      >
        <LinearGradient colors={['#d4d4d8', '#e4e4e7', '#ffffff']} locations={[0, 0.35, 1]} style={{ flex: 1 }}>
          <View className="px-6 pt-4 pb-6 bg-transparent" style={{ zIndex: 10 }}>
            <View className="items-center mb-4">
               <View className="w-16 h-1.5 bg-black/20 rounded-full self-center" />
            </View>
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                {loadingInfo ? (
                   <ActivityIndicator size="small" color="#FF4500" className="self-start mb-2" />
                ) : (
                   <Text className="text-black text-4xl font-[1000] tracking-tighter leading-10" numberOfLines={2}>{exName}</Text>
                )}
                <Text className="text-[#FF4500] font-bold uppercase text-[12px] tracking-[3px] mt-2">
                  {exMuscle} • {exEquipment}
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeModal}
                className="w-12 h-12 bg-black/5 rounded-full items-center justify-center border border-black/5"
              >
                <X size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row mx-6 mb-6 bg-gray-100 rounded-[20px] p-1.5">
            <TouchableOpacity
              onPress={() => setActiveTab('info')}
              className={`flex-1 py-3.5 rounded-[16px] flex-row justify-center items-center ${activeTab === 'info' ? 'bg-[#D1D5DB]' : 'bg-transparent'}`}
            >
              <Info size={16} color={activeTab === 'info' ? '#374151' : '#9CA3AF'} style={{ marginRight: 8 }} />
              <Text className={`font-black text-[11px] ${activeTab === 'info' ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>
                Info & Dati
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('history')}
              className={`flex-1 py-3.5 rounded-[16px] flex-row justify-center items-center ${activeTab === 'history' ? 'bg-[#D1D5DB]' : 'bg-transparent'}`}
            >
              <History size={16} color={activeTab === 'history' ? '#374151' : '#9CA3AF'} style={{ marginRight: 8 }} />
              <Text className={`font-black text-[11px] ${activeTab === 'history' ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>
                Cronologia & Note
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 64 }} showsVerticalScrollIndicator={false}>
            {activeTab === 'info' ? (
              <>
                <View className="w-full h-48 bg-black/5 rounded-3xl mt-4 items-center justify-center border border-black/5 overflow-hidden relative">
                  <PlayCircle size={48} color="rgba(0,0,0,0.2)" />
                  <View className="absolute bottom-3 right-4 bg-white/80 px-3 py-1 rounded-full">
                    <Text className="text-black text-xs font-bold">Video Coming Soon</Text>
                  </View>
                </View>

                {/* KPI e Dati Ottimizzati */}
                <View className="flex-row justify-between mt-6">
                  <View className="flex-1 bg-white rounded-3xl p-4 mr-2 border border-black/5 shadow-sm">
                    <View className="flex-row items-center mb-2">
                      <TrendingUp size={16} color="#FF4500" />
                      <Text className="text-gray-400 text-xs font-bold ml-1 uppercase">1RM Storico</Text>
                    </View>
                    <Text className="text-black text-2xl font-black">
                      {bestWeight} <Text className="text-sm text-gray-500">kg</Text>
                    </Text>
                  </View>

                  <View className="flex-1 bg-white rounded-3xl p-4 ml-2 border border-black/5 shadow-sm overflow-hidden relative">
                    <LinearGradient colors={['rgba(255,69,0,0.1)', 'transparent']} className="absolute inset-0 top-1/2" />
                    <View className="flex-row items-center mb-2 z-10">
                      <Flame size={16} color="#FF4500" />
                      <Text className="text-gray-400 text-xs font-bold ml-1 uppercase">Livello</Text>
                    </View>
                    <Text className="text-black text-xl font-black z-10">Gorilla</Text>
                  </View>
                </View>

                {/* Spazio preparato per il grafico futuro */}
                <View className="w-full h-40 bg-white rounded-3xl mt-4 items-center justify-center border border-black/5 p-4 shadow-sm">
                  <Activity size={30} color="rgba(0,0,0,0.1)" />
                  <Text className="text-gray-400 text-sm font-medium text-center mt-2">
                    Integrazione Grafico Volumi in lavorazione.
                  </Text>
                </View>

                <View className="mt-8 mb-10">
                  <Text className="text-black text-xl font-bold mb-4">Come si esegue</Text>
                  <Text className="text-gray-600 text-base leading-6">
                    {instructions && instructions.trim().length > 0
                      ? instructions
                      : 'Istruzioni non disponibili per questo esercizio.'}
                  </Text>
                </View>
              </>
            ) : (
              <View className="mt-2">
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>I tuoi Allenamenti Guardati a Raggi X</Text>
                  <Text style={{ color: '#6B7280', fontSize: 13 }}>
                    Qui puoi vedere come hai affrontato <Text style={{ color: '#FF4500', fontWeight: 'bold' }}>{exName}</Text> nel tempo e annotare ricordi.
                  </Text>
                </View>

                {loadingHistory ? (
                   <ActivityIndicator size="large" color="#FF4500" className="mt-10" />
                ) : historySessions && historySessions.length > 0 ? (
                  historySessions.map((session: any, idx: number) => {
                    const sessionNotes = editingNotes[session.session_id] !== undefined ? editingNotes[session.session_id] : session.notes;

                    return (
                      <View
                        key={`${session.session_id}-${idx}`}
                        className={`rounded-[24px] p-5 mb-4 border border-gray-200 ${idx === 0 ? 'bg-white shadow-sm' : 'bg-white/80'}`}
                      >
                        <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
                          <Text className="text-black font-black text-lg">
                            {new Date(session.completed_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </Text>
                          <View className="bg-orange-500/10 px-3 py-1.5 rounded-full">
                            <Text className="text-[#FF4500] font-bold text-xs uppercase">Sessione</Text>
                          </View>
                        </View>

                        <View className="flex-row justify-between items-center mb-3">
                          <Text className="text-gray-400 font-bold w-12 text-center text-xs uppercase">Set</Text>
                          <Text className="text-gray-400 font-bold flex-1 text-center text-xs uppercase">Kg</Text>
                          <Text className="text-gray-400 font-bold flex-1 text-center text-xs uppercase">Reps</Text>
                        </View>

                        {session.sets.map((setItem: any) => (
                          <View
                            key={setItem.id}
                            className="flex-row justify-between items-center bg-gray-50 p-2.5 rounded-2xl mb-2"
                          >
                            <View className="bg-white border border-gray-200 w-8 h-8 rounded-full items-center justify-center">
                              <Text className="text-black font-black">{setItem.set_number}</Text>
                            </View>
                            <Text className="text-black font-black text-lg flex-1 text-center">
                              {setItem.weight ?? '--'}
                            </Text>
                            <Text className="text-black font-black text-lg flex-1 text-center">
                              {setItem.reps ?? '--'}
                            </Text>
                          </View>
                        ))}

                        {/* Note Section */}
                        <View className="mt-4 pt-4 border-t border-gray-100">
                          <View className="flex-row items-center mb-2">
                             <FileText size={14} color="#9CA3AF" />
                             <Text className="text-gray-500 text-xs font-bold ml-1 uppercase">Note di Recupero</Text>
                          </View>
                          <View className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex-row items-end">
                            <TextInput
                              className="flex-1 text-black font-medium text-sm pt-0 pb-0"
                              multiline
                              placeholder="Che sensazioni hai avuto qua? Es. 'Poca spinta nel braccio sx'"
                              placeholderTextColor="#9CA3AF"
                              value={sessionNotes}
                              onChangeText={(val) => handleNotesChange(session.session_id, val)}
                            />
                            {editingNotes[session.session_id] !== undefined && editingNotes[session.session_id] !== session.notes && (
                               <TouchableOpacity onPress={() => saveNotes(session.session_id)} className="bg-[#FF4500] p-1.5 rounded-full ml-2">
                                  {updateNotesMutation.isPending && updateNotesMutation.variables?.sessionId === session.session_id ? (
                                     <ActivityIndicator size="small" color="white" />
                                  ) : (
                                     <Save size={14} color="white" />
                                  )}
                               </TouchableOpacity>
                            )}
                          </View>
                        </View>

                      </View>
                    );
                  })
                ) : (
                  <View className="bg-white/50 rounded-2xl p-6 items-center border border-gray-200 mt-6">
                    <Text className="text-gray-500 font-bold mb-1">Nessun dato storico</Text>
                    <Text className="text-gray-400 text-xs text-center">Inizia ad allenarti con questo esercizio per popolare i tuoi record a raggi X.</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, zIndex: 9999, elevation: 9999 }}>
      {sheet}
    </View>
  );
}
