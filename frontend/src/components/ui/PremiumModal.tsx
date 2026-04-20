// frontend/src/components/ui/PremiumModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Crown, CheckCircle2, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export default function PremiumModal({ visible, onClose, onUpgrade }: PremiumModalProps) {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <View
      className="absolute z-[9999] justify-center items-center px-6"
      style={StyleSheet.absoluteFill}
    >
      {/* Sfondo Sfocato (Glassmorphism) */}
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

      <View className="w-full bg-white rounded-[40px] overflow-hidden shadow-2xl relative">
        {/* Header con Gradiente */}
        <LinearGradient colors={['#000', '#1A1A1A']} className="pt-12 pb-8 items-center">
          <View className="bg-yellow-400 p-4 rounded-full mb-4 shadow-lg">
            <Crown size={32} color="black" />
          </View>
          <Text className="text-white text-3xl font-black tracking-tighter uppercase">
            SPOTTERAI PRO
          </Text>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-[3px] mt-1">
            {t('premium.subtitle')}
          </Text>
        </LinearGradient>

        {/* Points/Features */}
        <View className="p-8 gap-y-5">
          {[
            t('premium.feature_routines'),
            t('premium.feature_stats'),
            t('premium.feature_ai'),
            t('premium.feature_sets'),
            t('premium.feature_vision'),
          ].map((text, i) => (
            <View key={i} className="flex-row items-center">
              <CheckCircle2 size={20} color="black" strokeWidth={3} />
              <Text className="text-black ml-4 font-bold text-sm">{text}</Text>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <View className="px-8 pb-10">
          <TouchableOpacity
            onPress={onUpgrade}
            className="bg-black py-5 rounded-2xl items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-black uppercase tracking-widest text-sm">
              {t('premium.subscribe')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} className="mt-4 items-center">
            <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Close Icon */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-6 right-6 bg-black/5 p-2 rounded-full"
        >
          <X size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
