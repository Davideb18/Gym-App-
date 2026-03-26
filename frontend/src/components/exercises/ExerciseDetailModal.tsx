import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, PlayCircle, Activity, TrendingUp, Flame, History, Info } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  useNativeModal?: boolean;
  exerciseName?: string;
  muscle?: string;
  equipment?: string | null;
  instructions?: string | null;
  videoUrl?: string | null;
  oneRmKg?: number | null;
  levelLabel?: string;
  historySessions?: ExerciseHistorySession[];
}

interface ExerciseHistorySet {
  set_number: number;
  weight?: number | null;
  reps?: number | null;
  is_pr?: boolean;
}

interface ExerciseHistorySession {
  date_label: string;
  workout_label?: string;
  sets: ExerciseHistorySet[];
}

export default function ExerciseDetailModal({
  visible,
  onClose,
  useNativeModal = true,
  exerciseName = 'Panca Piana',
  muscle = 'Petto',
  equipment = 'Bilanciere',
  instructions,
  videoUrl,
  oneRmKg = 90,
  levelLabel = 'Gorilla',
  historySessions,
}: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  React.useEffect(() => {
    if (visible) {
      setActiveTab('info');
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const sessionData: ExerciseHistorySession[] =
    historySessions && historySessions.length > 0
      ? historySessions
      : [
        {
          date_label: '15 Marzo 2026',
          workout_label: 'Push Day',
          sets: [
            { set_number: 1, weight: 80, reps: 10 },
            { set_number: 2, weight: 85, reps: 8 },
            { set_number: 3, weight: 90, reps: 6, is_pr: true },
          ],
        },
        {
          date_label: '8 Marzo 2026',
          workout_label: 'Chest & Triceps',
          sets: [{ set_number: 1, weight: 75, reps: 10 }],
        },
      ];

  const sheet = (
    <View
      style={[
        { flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' },
        !useNativeModal && { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100 }
      ]}
    >
      <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={onClose} />

      <View
        className="w-full h-[92%] rounded-t-[38px] overflow-hidden flex shadow-2xl bg-white"
      >
        <LinearGradient colors={['#d4d4d8', '#e4e4e7', '#ffffff']} locations={[0, 0.35, 1]} style={{ flex: 1 }}>
          <View className="px-6 pt-4 pb-6 bg-transparent" style={{ zIndex: 10 }}>
            <View className="items-center mb-4">
               <View className="w-16 h-1.5 bg-black/20 rounded-full self-center" />
            </View>
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                <Text className="text-black text-4xl font-[1000] tracking-tighter leading-10">{exerciseName}</Text>
                <Text className="text-[#FF4500] font-bold uppercase text-[12px] tracking-[3px] mt-2">
                  {muscle} • {equipment || 'Bodyweight'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
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
                Istruzioni
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('history')}
              className={`flex-1 py-3.5 rounded-[16px] flex-row justify-center items-center ${activeTab === 'history' ? 'bg-[#D1D5DB]' : 'bg-transparent'}`}
            >
              <History size={16} color={activeTab === 'history' ? '#374151' : '#9CA3AF'} style={{ marginRight: 8 }} />
              <Text className={`font-black text-[11px] ${activeTab === 'history' ? 'text-[#374151]' : 'text-[#9CA3AF]'}`}>
                Cronologia
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            {activeTab === 'info' ? (
              <>
                <View className="w-full h-48 bg-black/5 rounded-3xl mt-4 items-center justify-center border border-black/5 overflow-hidden relative">
                  <PlayCircle size={48} color="rgba(0,0,0,0.2)" />
                  <View className="absolute bottom-3 right-4 bg-white/80 px-3 py-1 rounded-full">
                    <Text className="text-black text-xs font-bold">
                      {videoUrl ? 'Video Disponibile' : 'Video Coming Soon'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between mt-6">
                  <View className="flex-1 bg-white rounded-3xl p-4 mr-2 border border-black/5 shadow-sm">
                    <View className="flex-row items-center mb-2">
                      <TrendingUp size={16} color="#FF4500" />
                      <Text className="text-gray-400 text-xs font-bold ml-1 uppercase">Il tuo 1RM</Text>
                    </View>
                    <Text className="text-black text-2xl font-black">
                      {oneRmKg ?? '--'} <Text className="text-sm text-gray-500">kg</Text>
                    </Text>
                  </View>

                  <View className="flex-1 bg-white rounded-3xl p-4 ml-2 border border-black/5 shadow-sm overflow-hidden relative">
                    <LinearGradient colors={['rgba(255,69,0,0.1)', 'transparent']} className="absolute inset-0 top-1/2" />
                    <View className="flex-row items-center mb-2 z-10">
                      <Flame size={16} color="#FF4500" />
                      <Text className="text-gray-400 text-xs font-bold ml-1 uppercase">Livello</Text>
                    </View>
                    <Text className="text-black text-xl font-black z-10">{levelLabel}</Text>
                  </View>
                </View>

                <View className="w-full h-32 bg-white rounded-3xl mt-4 items-center justify-center border border-black/5 p-4 shadow-sm">
                  <Activity size={30} color="rgba(0,0,0,0.1)" />
                  <Text className="text-gray-400 text-sm font-medium text-center mt-2">
                    Qui andrà il grafico della progressione forza con i dati reali
                  </Text>
                </View>

                <View className="mt-8 mb-10">
                  <Text className="text-black text-xl font-bold mb-4">Come si esegue</Text>
                  <Text className="text-gray-600 text-base leading-6">
                    {instructions && instructions.trim().length > 0
                      ? instructions
                      : 'Istruzioni non ancora disponibili per questo esercizio. Verranno caricate dal database esercizi.'}
                  </Text>
                </View>
              </>
            ) : (
              <View className="mt-2">
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>I tuoi Record Reali</Text>
                  <Text style={{ color: '#6B7280', fontSize: 14 }}>
                    Qui vedrai l'andamento di <Text style={{ color: '#FF4500', fontWeight: 'bold' }}>{exerciseName}</Text> nel tempo.
                  </Text>
                </View>

                {sessionData.map((session, idx) => (
                  <View
                    key={`${session.date_label}-${idx}`}
                    style={{
                      backgroundColor: idx === 0 ? 'white' : 'rgba(255,255,255,0.8)',
                      borderRadius: 24,
                      padding: 20,
                      marginBottom: 16,
                      borderColor: '#F3F4F6',
                      borderWidth: 1,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomColor: '#F3F4F6', borderBottomWidth: 1 }}>
                      <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 18 }}>{session.date_label}</Text>
                      <View style={{ backgroundColor: 'rgba(255, 69, 0, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}>
                        <Text style={{ color: '#FF4500', fontWeight: 'bold', fontSize: 12 }}>{session.workout_label || 'Sessione'}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={{ color: '#9CA3AF', fontWeight: 'bold', width: 48, textAlign: 'center' }}>Set</Text>
                      <Text style={{ color: '#9CA3AF', fontWeight: 'bold', flex: 1, textAlign: 'center' }}>Kg</Text>
                      <Text style={{ color: '#9CA3AF', fontWeight: 'bold', flex: 1, textAlign: 'center' }}>Reps</Text>
                    </View>

                    {session.sets.map((setItem) => (
                      <View
                        key={`${session.date_label}-${setItem.set_number}`}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: setItem.is_pr ? 'rgba(255, 69, 0, 0.1)' : '#F9FAFB',
                          borderColor: setItem.is_pr ? 'rgba(255, 69, 0, 0.3)' : 'transparent',
                          borderWidth: setItem.is_pr ? 1 : 0,
                          padding: 12,
                          borderRadius: 16,
                          marginBottom: 8,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: setItem.is_pr ? '#FF4500' : 'white',
                            borderColor: '#E5E7EB',
                            borderWidth: setItem.is_pr ? 0 : 1,
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: setItem.is_pr ? 'white' : 'black', fontWeight: 'bold' }}>{setItem.set_number}</Text>
                        </View>
                        <Text style={{ color: setItem.is_pr ? '#FF4500' : 'black', fontWeight: '900', fontSize: 18, flex: 1, textAlign: 'center' }}>
                          {setItem.weight ?? '--'}
                        </Text>
                        <Text style={{ color: setItem.is_pr ? '#FF4500' : 'black', fontWeight: '900', fontSize: 18, flex: 1, textAlign: 'center' }}>
                          {setItem.reps ?? '--'}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    </View>
  );

  if (!useNativeModal) {
    return sheet;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {sheet}
    </Modal>
  );
}
