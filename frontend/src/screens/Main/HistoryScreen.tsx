import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Calendar as CalendarIcon, ChevronRight, Clock, Dumbbell } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutService } from '../../api/workoutService';

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['recentSessions', user?.id],
    queryFn: () => WorkoutService.getRecentSessions(user!.id),
    enabled: !!user?.id,
  });

  // Genera gli ultimi 14 giorni per il calendario orizzontale
  const generateDays = () => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const calendarDays = generateDays();

  // Filtra le sessioni in base al giorno selezionato
  const selectedSessions = sessions?.filter((s: any) => {
    const d = new Date(s.completed_at || s.started_at);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  }) || [];

  // Mappa di tutti i giorni con allenamenti (per i pallini)
  const workoutDatesMap = new Set(
    sessions?.map((s: any) => {
      const d = new Date(s.completed_at || s.started_at);
      return d.toDateString();
    }) || []
  );

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <StatusBar style="light" />
      
      {/* Sfondo HomeScreen */}
      <View className="absolute top-0 right-[-50] w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />
      <View className="absolute bottom-[20%] left-[-50] w-72 h-72 bg-[#10B981]/10 rounded-full blur-[120px]" />

      <SafeAreaView className="flex-1">
        
        {/* Intestazione */}
        <View className="px-5 pt-8 pb-4 flex-row justify-between items-center z-10">
          <View className="flex-row items-center">
            <Text className="text-white text-3xl font-[1000] tracking-tighter">THE</Text>
            <View className="ml-1 bg-[#10B981] px-1.5 py-0.5 rounded shadow-sm shadow-green-900/50">
              <Text className="text-black text-xl font-black italic">LAB</Text>
            </View>
          </View>
          <View className="bg-white/10 p-3 rounded-full border border-white/5">
            <CalendarIcon size={20} color="#FFF" />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          <Text className="px-5 text-gray-500 text-[10px] font-black uppercase tracking-[4px] mb-6">
            Training History
          </Text>

          {/* Calendario settimanale */}
          <View className="mb-8">
            <View className="px-5 mb-4 flex-row items-center justify-between">
               <Text className="text-white font-black text-lg tracking-widest">
                 {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
               </Text>
               <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
                 <Text className="text-[#10B981] font-bold text-xs uppercase">Today</Text>
               </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-5" contentContainerStyle={{ paddingRight: 40 }} snapToAlignment="end">
              {calendarDays.map((dateObj, index) => {
                const isSelected = dateObj.toDateString() === selectedDate.toDateString();
                const hasWorkout = workoutDatesMap.has(dateObj.toDateString());

                return (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => setSelectedDate(dateObj)}
                    className={`w-14 items-center justify-center py-3 rounded-[20px] mr-3 border ${isSelected ? 'bg-[#10B981] border-[#10B981] shadow-lg shadow-green-900/50' : 'bg-white/5 border-white/5'}`}
                  >
                    <Text className={`text-[10px] uppercase font-bold mb-1 ${isSelected ? 'text-black/60' : 'text-gray-500'}`}>
                      {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Text className={`text-xl font-black ${isSelected ? 'text-black' : 'text-white'}`}>
                      {dateObj.getDate()}
                    </Text>
                    
                    {/* Indicatore Workouts */}
                    <View className="flex-row items-center gap-x-1 mt-1.5 h-1.5">
                      {hasWorkout && <View className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-[#10B981]'}`} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Sessioni della giornata */}
          <View className="px-5 gap-y-4">
             <Text className="text-white font-black text-xl tracking-tighter mb-2">
               {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
             </Text>
             
             {isLoading ? (
               <ActivityIndicator size="large" color="#10B981" className="mt-10" />
             ) : selectedSessions.length === 0 ? (
               <View className="items-center mt-10">
                 <Dumbbell size={48} color="#4B5563" />
                 <Text className="text-gray-500 font-bold mt-4">Rest Day. No workouts logged.</Text>
               </View>
             ) : (
               selectedSessions.map((session: any) => {
                 // Estrai dati dalla sessione
                 const durationMin = Math.floor((session.duration_seconds || 0) / 60);
                 const volume = session.total_volume || 0;
                 const numSets = session.performed_sets?.length || 0;
                 const name = session.workout_templates?.name || 'Freestyle Session';

                 // Determinazione casuale o finta del tipo (Push, Pull, ecc se non c'è nel db)
                 return (
                   <TouchableOpacity key={session.id} className="bg-black/40 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                      {/* Testata Sessione */}
                      <View className="p-6 pb-4 border-b border-white/5 flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <View className="bg-blue-500/10 p-3 rounded-2xl mr-4 border border-blue-500/20">
                            <Dumbbell size={24} color="#3B82F6" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-white font-black text-lg tracking-tight" numberOfLines={1}>{name}</Text>
                            <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
                              Completed Setup
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Metriche */}
                      <View className="bg-white/5 p-4 py-5 flex-row justify-between items-center px-6">
                        <View className="items-center">
                           <Clock size={16} color="#6B7280" className="mb-1" />
                           <Text className="text-white font-black text-sm">{durationMin} min</Text>
                           <Text className="text-gray-500 text-[10px] uppercase font-bold mt-0.5">Time</Text>
                        </View>
                        <View className="w-[1px] h-8 bg-white/10" />
                        <View className="items-center">
                           <Dumbbell size={16} color="#6B7280" className="mb-1" />
                           <Text className="text-white font-black text-sm">{volume.toLocaleString()} kg</Text>
                           <Text className="text-gray-500 text-[10px] uppercase font-bold mt-0.5">Volume</Text>
                        </View>
                        <View className="w-[1px] h-8 bg-white/10" />
                        <View className="items-center">
                           <Text className="text-white font-black text-base mt-0.5">{numSets}</Text>
                           <Text className="text-gray-500 text-[10px] uppercase font-bold mt-1">Sets</Text>
                        </View>
                      </View>

                      <View className="px-6 py-4 flex-row items-center justify-between border-t border-white/5 bg-black/20">
                         <Text className="text-[#10B981] font-bold text-xs uppercase tracking-widest">View Details</Text>
                         <ChevronRight size={16} color="#10B981" />
                      </View>
                   </TouchableOpacity>
                 );
               })
             )}
          </View>

          <View className="h-32" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
