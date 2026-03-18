import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Flame, Trophy, Activity, ChevronRight, Quote, Zap } from 'lucide-react-native';

export default function HomeScreen() {
  // Logic for Animal Level (Mockup for now)
  const animalLevel = "Silver Gorilla";
  const progressToNext = 75; // percentage
  
  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      
      {/* 1. PREMIUM GRADIENT BACKGROUND */}
      <LinearGradient
        colors={['#D1D5DB', '#FFFFFF', '#D1D5DB']}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1">
        <ScrollView className="px-6 pt-10">
          
          {/* HEADER - LOGO SIGNATURE */}
          <View className="flex-row justify-between items-center mb-10">
            <View className="flex-row items-center">
              <Text className="text-black text-3xl font-[1000] tracking-tighter">
                THE
              </Text>
              <View className="ml-1 bg-black px-1.5 py-0.5">
                <Text className="text-white text-xl font-black italic">LAB</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-black/5 p-3 rounded-full">
              <Activity size={20} color="black" />
            </TouchableOpacity>
          </View>

          {/* MOTIVATIONAL QUOTE CARD */}
          <View className="bg-black p-8 rounded-[40px] mb-8 shadow-2xl relative overflow-hidden">
             <View className="absolute top-[-10] right-[-10] opacity-10">
                <Quote size={120} color="white" />
             </View>
             <Text className="text-[#00FF00] font-black uppercase text-[10px] tracking-[4px] mb-4">
               Daily Motivation
             </Text>
             <Text className="text-white text-2xl font-[1000] leading-tight tracking-tight">
               "STRENGTH DOES NOT COME FROM WINNING. YOUR STRUGGLES DEVELOP YOUR STRENGTHS."
             </Text>
             <View className="flex-row items-center mt-6">
                <View className="bg-[#00FF00] w-8 h-[2px] mr-3" />
                <Text className="text-white/40 font-bold uppercase text-[10px] tracking-widest">
                  The Lab Protocol
                </Text>
             </View>
          </View>

          {/* ANIMAL LEVEL GAMIFICATION */}
          <View className="bg-white/70 border border-black/5 rounded-[40px] p-8 mb-8 shadow-lg shadow-black/5">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-black/40 font-black uppercase text-[10px] tracking-[4px]">
                  Current Status
                </Text>
                <Text className="text-black text-3xl font-[1000] tracking-tighter mt-1">
                  {animalLevel}
                </Text>
              </View>
              <View className="bg-black p-4 rounded-[24px]">
                <Zap size={28} color="white" fill="white" />
              </View>
            </View>

            {/* PROGRESS BAR */}
            <View className="h-4 bg-black/5 rounded-full overflow-hidden mb-3">
              <View 
                className="h-full bg-black rounded-full" 
                style={{ width: `${progressToNext}%` }} 
              />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-black/30 font-bold text-[10px] uppercase">Level 12</Text>
              <Text className="text-black font-black text-[10px] uppercase">25% to Golden Lion</Text>
            </View>
          </View>

          {/* RECENT SESSIONS */}
          <View className="mb-10">
            <View className="flex-row justify-between items-end mb-6 px-1">
              <Text className="text-black font-black uppercase text-[10px] tracking-[4px]">
                Recent Sessions
              </Text>
              <TouchableOpacity>
                <Text className="text-black/40 font-black uppercase text-[10px] tracking-widest">View All</Text>
              </TouchableOpacity>
            </View>

            {[1, 2].map((i) => (
              <TouchableOpacity 
                key={i}
                className="bg-white/60 border border-black/5 rounded-[32px] p-6 mb-4 flex-row items-center shadow-sm"
              >
                <View className="bg-black/5 p-4 rounded-2xl mr-5">
                  <Flame size={20} color="black" />
                </View>
                <View className="flex-1">
                  <Text className="text-black font-black text-lg tracking-tight">Push Protocol A</Text>
                  <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">
                    Yesterday • 65 min • 320 kcal
                  </Text>
                </View>
                <ChevronRight size={18} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>

          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>

      {/* QUICK START FLOATING BUTTON */}
      <TouchableOpacity 
        className="absolute bottom-10 left-10 right-10 bg-black py-6 rounded-[30px] flex-row items-center justify-center shadow-2xl"
        activeOpacity={0.9}
      >
        <Trophy size={20} color="#00FF00" className="mr-3" />
        <Text className="text-white font-[1000] uppercase tracking-[4px] text-lg">
          Start Training
        </Text>
      </TouchableOpacity>

    </View>
  );
}
