import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';

type ScreenHeaderProps = {
  subtitle?: string;
  rightAction?: ReactNode;
  className?: string;
};

export default function ScreenHeader({
  subtitle,
  rightAction,
  className = 'mb-8',
}: ScreenHeaderProps) {
  return (
    <View className={`flex-row items-center justify-between ${className}`}>
      <View>
        <View className="flex-row items-center">
          <Text className="text-white text-3xl font-[1000] tracking-tighter">THE</Text>
          <View className="ml-1 bg-[#10B981] px-1.5 py-0.5 rounded shadow-sm shadow-green-900/50">
            <Text className="text-black text-xl font-black italic">LAB</Text>
          </View>
        </View>

        {subtitle ? (
          <Text
            className="text-white font-bold uppercase text-[11px] tracking-[2px] mt-1 ml-1"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightAction ? <View>{rightAction}</View> : null}
    </View>
  );
}
