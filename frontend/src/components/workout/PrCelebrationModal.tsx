import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { usePrCelebrationStore } from '../../store/usePrCelebrationStore';

export default function PrCelebrationModal() {
  const { t } = useTranslation();
  const { isOpen, items, closeCelebration } = usePrCelebrationStore();
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(22)).current;
  const crownScale = useRef(new Animated.Value(0.94)).current;
  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOpen) return;

    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const crownPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(crownScale, { toValue: 1.06, duration: 550, useNativeDriver: true }),
        Animated.timing(crownScale, { toValue: 0.96, duration: 550, useNativeDriver: true }),
      ]),
    );

    const confettiFloatA = Animated.loop(
      Animated.sequence([
        Animated.timing(floatA, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatA, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
    );

    const confettiFloatB = Animated.loop(
      Animated.sequence([
        Animated.timing(floatB, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatB, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );

    crownPulse.start();
    confettiFloatA.start();
    confettiFloatB.start();

    return () => {
      crownPulse.stop();
      confettiFloatA.stop();
      confettiFloatB.stop();
      cardOpacity.setValue(0);
      cardTranslateY.setValue(22);
      crownScale.setValue(0.94);
      floatA.setValue(0);
      floatB.setValue(0);
    };
  }, [isOpen, cardOpacity, cardTranslateY, crownScale, floatA, floatB]);

  if (!isOpen) return null;

  const floatATranslate = floatA.interpolate({ inputRange: [0, 1], outputRange: [0, -9] });
  const floatBTranslate = floatB.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 250 }}>
      <LinearGradient
        colors={['#FFEEA3', '#F7B500', '#E29300']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <Animated.View
        style={{
          position: 'absolute',
          top: 86,
          left: 32,
          transform: [{ translateY: floatATranslate }],
        }}
      >
        <View style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: '#FFF7D6' }} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          top: 120,
          right: 30,
          transform: [{ translateY: floatBTranslate }],
        }}
      >
        <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#FFD54A' }} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 190,
          left: 46,
          transform: [{ translateY: floatBTranslate }],
        }}
      >
        <View style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: '#FFF2B2' }} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 210,
          right: 52,
          transform: [{ translateY: floatATranslate }],
        }}
      >
        <View style={{ width: 16, height: 16, borderRadius: 99, backgroundColor: '#FFD86B' }} />
      </Animated.View>

      <Animated.View
        className="flex-1 px-6 pt-20 pb-10"
        style={{ opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }}
      >
        <View className="items-center mb-8">
          <Animated.View
            style={{ transform: [{ scale: crownScale }] }}
            className="w-32 h-32 rounded-full bg-black/20 items-center justify-center mb-5 border border-black/20"
          >
            <Crown size={58} color="#111827" />
          </Animated.View>
          <View className="flex-row items-center mb-2">
            <Sparkles size={15} color="#111827" />
            <Text className="text-black text-xs font-black uppercase tracking-[2px] ml-1">
              Record
            </Text>
          </View>
          <Text className="text-black text-3xl font-black text-center tracking-tight">
            {t('records.new_pr_title')}
          </Text>
          <Text className="text-black/90 font-black text-center mt-2 text-lg">
            {t('records.new_pr_question', { defaultValue: 'Hai superato il tuo nuovo record?' })}
          </Text>
          <Text className="text-black/70 font-bold text-center mt-1 text-sm">
            {t('records.new_pr_subtitle')}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {items.slice(0, 5).map((item, idx) => (
            <View
              key={`${item.exerciseName}-${idx}`}
              className="bg-black/20 border border-black/15 rounded-3xl px-4 py-4 mb-3"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-black font-black text-base flex-1 pr-3" numberOfLines={1}>
                  {item.exerciseName}
                </Text>
                <View className="flex-row items-center bg-black/15 px-2 py-1 rounded-full">
                  <Sparkles size={12} color="#111827" />
                  <Text className="text-black font-black text-[10px] uppercase tracking-[1px] ml-1">
                    PR
                  </Text>
                </View>
              </View>
              <Text className="text-black/80 font-bold text-sm mt-1">
                {item.weight} kg x {item.reps}
              </Text>
              <Text className="text-black/70 font-bold text-xs mt-1">
                e1RM {item.e1rm.toFixed(1)} kg
              </Text>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          onPress={closeCelebration}
          className="mt-4 bg-black py-4 rounded-2xl items-center"
          activeOpacity={0.85}
        >
          <Text className="text-white font-black text-sm uppercase tracking-[2px]">
            {t('common.close')}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
