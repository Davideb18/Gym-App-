import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Dumbbell, Users, Brain } from 'lucide-react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type SchedeQuickActionsProps = {
  customLabel: string;
  coachLabel: string;
  exerciseLabel: string;
  onOpenCreate: () => void;
  onOpenCoach: () => void;
  onOpenLibrary: () => void;
};

export default function SchedeQuickActions({
  customLabel,
  coachLabel,
  exerciseLabel,
  onOpenCreate,
  onOpenCoach,
  onOpenLibrary,
}: SchedeQuickActionsProps) {
  const glow = useSharedValue(0);

  React.useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [glow]);

  const coachBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      glow.value,
      [0, 0.5, 1],
      ['#60A5FA', '#A78BFA', '#60A5FA'],
    );
    const cardBg = interpolateColor(
      glow.value,
      [0, 0.5, 1],
      ['rgba(96,165,250,0.08)', 'rgba(167,139,250,0.16)', 'rgba(96,165,250,0.08)'],
    );
    const scale = 1 + glow.value * 0.02;

    return {
      borderColor,
      backgroundColor: cardBg,
      shadowColor: borderColor,
      shadowOpacity: 0.45 + glow.value * 0.25,
      shadowRadius: 8 + glow.value * 8,
      transform: [{ scale }],
    };
  });

  return (
    <View className="flex-row justify-between mb-10 gap-x-4">
      <TouchableOpacity
        onPress={onOpenCreate}
        className="items-center bg-black/60 p-4 rounded-3xl border border-white/5 flex-1 shadow-lg"
        activeOpacity={0.7}
      >
        <View className="bg-white/5 p-2 rounded-xl mb-2 border border-white/5">
          <Dumbbell size={18} color="#10B981" />
        </View>
        <Text
          className="text-white text-[10px] font-black uppercase tracking-[2px] text-center"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {customLabel}
        </Text>
      </TouchableOpacity>

      <Animated.View style={coachBorderStyle} className="flex-1 rounded-3xl border shadow-lg">
        <TouchableOpacity
          onPress={onOpenCoach}
          className="items-center bg-black/50 p-4 rounded-3xl"
          activeOpacity={0.7}
        >
          <View className="bg-white/5 p-2 rounded-xl mb-2 border border-white/5">
            <Brain size={18} color="#60A5FA" />
          </View>
          <Text
            className="text-white text-[10px] font-black uppercase tracking-[2px] text-center"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {coachLabel}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        onPress={onOpenLibrary}
        className="items-center bg-black/60 p-4 rounded-3xl border border-white/5 flex-1 shadow-lg"
        activeOpacity={0.7}
      >
        <View className="bg-white/5 p-2 rounded-xl mb-2 border border-white/5">
          <Users size={18} color="#8B5CF6" />
        </View>
        <Text
          className="text-white text-[10px] font-black uppercase tracking-[2px] text-center"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {exerciseLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
