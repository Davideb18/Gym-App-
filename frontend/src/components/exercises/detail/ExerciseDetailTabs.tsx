import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { History, Info } from 'lucide-react-native';

type TabKey = 'descrizione' | 'history';

type ExerciseDetailTabsProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  descriptionLabel: string;
  historyLabel: string;
};

export default function ExerciseDetailTabs({
  activeTab,
  onChangeTab,
  descriptionLabel,
  historyLabel,
}: ExerciseDetailTabsProps) {
  return (
    <View className="px-6 mt-4">
      <View className="flex-row bg-black/40 rounded-full p-1 border border-white/5">
        <TouchableOpacity
          onPress={() => onChangeTab('descrizione')}
          className={`flex-1 py-2.5 rounded-full flex-row justify-center items-center ${activeTab === 'descrizione' ? 'bg-white/10' : 'bg-transparent'}`}
        >
          <Info
            size={14}
            color={activeTab === 'descrizione' ? '#10B981' : '#6B7280'}
            style={{ marginRight: 6 }}
          />
          <Text
            className={`font-black uppercase tracking-widest text-[10px] ${activeTab === 'descrizione' ? 'text-white' : 'text-gray-500'}`}
          >
            {descriptionLabel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChangeTab('history')}
          className={`flex-1 py-2.5 rounded-full flex-row justify-center items-center ${activeTab === 'history' ? 'bg-white/10' : 'bg-transparent'}`}
        >
          <History
            size={14}
            color={activeTab === 'history' ? '#10B981' : '#6B7280'}
            style={{ marginRight: 6 }}
          />
          <Text
            className={`font-black uppercase tracking-widest text-[10px] ${activeTab === 'history' ? 'text-white' : 'text-gray-500'}`}
          >
            {historyLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
