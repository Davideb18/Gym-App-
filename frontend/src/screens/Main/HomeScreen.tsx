import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Flame, Trophy, Activity, ChevronRight, Quote, Zap, Dumbbell } from 'lucide-react-native';

import ExerciseDetailModal from '../../components/exercises/ExerciseDetailModal';
import ExerciseLibrary from '../../components/exercises/ExerciseLibrary';

export default function HomeScreen() {
  const animalLevel = "Silver Gorilla";
  const progressToNext = 75; // percentage
  
  return (
    <View className="flex-1 bg-[#040404]">
      <StatusBar style="light" />
      
      {/* Sfondo HomeScreen */}
      <View className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#10B981]/5 to-transparent opacity-80" />

      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-5 pt-8" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          
          {/* HEADER - LOGO SIGNATURE */}
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-row items-center">
              <Text className="text-white text-3xl font-[1000] tracking-tighter">
                THE
              </Text>
              <View className="ml-1 bg-[#10B981] px-1.5 py-0.5 rounded shadow-sm shadow-green-900/50">
                <Text className="text-black text-xl font-black italic">LAB</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-white/5 p-3 rounded-full border border-white/10">
              <Activity size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Sezione Quotation */}
          <BlurView intensity={20} tint="dark" className="p-8 rounded-[40px] mb-8 border border-white/5 overflow-hidden relative">
             <View className="absolute top-[-10] right-[-10] opacity-5">
                <Quote size={120} color="white" />
             </View>
             <Text className="text-[#10B981] font-black uppercase text-[10px] tracking-[4px] mb-4">
               Daily Motivation
             </Text>
             <Text className="text-white text-2xl font-[1000] leading-tight tracking-tight">
               "STRENGTH DOES NOT COME FROM WINNING. YOUR STRUGGLES DEVELOP YOUR STRENGTHS."
             </Text>
             <View className="flex-row items-center mt-6">
                <View className="bg-[#10B981] w-8 h-[2px] mr-3" />
                <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  The Lab Protocol
                </Text>
             </View>
          </BlurView>

          {/* Sezione Livello Utente */}
          <View className="bg-black/60 border border-white/5 rounded-[40px] p-8 mb-8 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-gray-500 font-black uppercase text-[10px] tracking-[4px]">
                  Current Status
                </Text>
                <Text className="text-white text-3xl font-[1000] tracking-tighter mt-1 drop-shadow-md">
                  {animalLevel}
                </Text>
              </View>
              <View className="bg-white/5 p-4 rounded-[24px] border border-white/10">
                <Zap size={28} color="#10B981" fill="#10B981" />
              </View>
            </View>

            {/* PROGRESS BAR */}
            <View className="h-4 bg-white/5 rounded-full overflow-hidden mb-3 border border-white/5">
              <View 
                className="h-full bg-[#10B981] rounded-full shadow-lg shadow-green-900/50" 
                style={{ width: `${progressToNext}%` }} 
              />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500 font-bold text-[10px] uppercase">Level 12</Text>
              <Text className="text-[#10B981] font-black text-[10px] uppercase">25% to Golden Lion</Text>
            </View>
          </View>

          {/* RECENT SESSIONS */}
          <View className="mb-10">
            <View className="flex-row justify-between items-end mb-6 px-1">
              <Text className="text-gray-400 font-black uppercase text-[10px] tracking-[4px]">
                Recent Sessions
              </Text>
              <TouchableOpacity>
                <Text className="text-[#10B981] font-black uppercase text-[10px] tracking-widest">View All</Text>
              </TouchableOpacity>
            </View>

            {[1, 2].map((i) => (
              <TouchableOpacity 
                key={i}
                className="bg-black border border-white/5 rounded-[32px] p-5 mb-4 flex-row items-center shadow-lg"
              >
                <View className="bg-[#10B981]/10 p-4 rounded-2xl mr-4 border border-[#10B981]/20">
                  <Flame size={24} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-black text-lg tracking-tight">Push Protocol {i}</Text>
                  <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
                    Yesterday • 65 min • 320 kcal
                  </Text>
                </View>
                <ChevronRight size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Tasto Start Workout Dinamico */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent pt-12">
        <TouchableOpacity 
          className="bg-black/90 py-5 rounded-full flex-row items-center justify-center shadow-2xl border border-white/10 backdrop-blur-md"
          activeOpacity={0.9}
        >
          <Trophy size={18} color="#10B981" className="mr-3" />
          <Text className="text-white font-[1000] uppercase tracking-[3px] text-sm">
            Start Blank Workout
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
