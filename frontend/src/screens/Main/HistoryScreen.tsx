import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';

export default function HistoryScreen() {
  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <LinearGradient colors={['#D1D5DB', '#FFFFFF', '#D1D5DB']} className="absolute inset-0" />

      <SafeAreaView className="flex-1">
        <ScrollView className="px-6 pt-10">
          <View className="flex-row justify-between items-center mb-10">
            <View className="flex-row items-center">
              <Text className="text-black text-3xl font-[1000] tracking-tighter">THE</Text>
              <View className="ml-1 bg-black px-1.5 py-0.5">
                <Text className="text-white text-xl font-black italic">LAB</Text>
              </View>
            </View>
            <View className="bg-black/5 p-3 rounded-full">
              <CalendarIcon size={20} color="black" />
            </View>
          </View>

          <Text className="text-black/30 text-[10px] font-black uppercase tracking-[4px] mb-6">
            Training History
          </Text>

          {/* MOCK CALENDAR AREA */}
          <View className="bg-white/70 border border-black/5 rounded-[40px] p-8 mb-8 shadow-lg items-center">
             <Text className="text-black font-black text-sm uppercase tracking-widest mb-4">March 2026</Text>
             <View className="flex-row gap-x-2">
                {[15, 16, 17, 18, 19, 20, 21].map((day) => (
                  <View 
                    key={day} 
                    className={`w-10 h-14 rounded-2xl items-center justify-center ${day === 18 ? 'bg-black' : 'bg-black/5'}`}
                  >
                    <Text className={`text-[10px] font-bold ${day === 18 ? 'text-white/40' : 'text-black/20'}`}>Wed</Text>
                    <Text className={`text-sm font-black ${day === 18 ? 'text-white' : 'text-black'}`}>{day}</Text>
                  </View>
                ))}
             </View>
          </View>

          {/* SESSIONS LIST */}
          <View className="gap-y-4">
             {[1, 2, 3].map((i) => (
               <View key={`session-${i}`} className="bg-white/60 border border-black/5 rounded-[32px] p-6 flex-row items-center shadow-sm">
                  <View className="bg-black/5 p-4 rounded-2xl mr-5">
                    <Clock size={20} color="black" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-black font-black text-lg tracking-tight">Full Body Protocol {i}</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">
                      12 Mar • 50 min • Level Up
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#CCC" />
               </View>
             ))}
          </View>

          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
