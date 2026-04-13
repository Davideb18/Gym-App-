import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

type LanguageSelectorModalProps = {
  visible: boolean;
  currentLanguage: string;
  title: string;
  closeLabel: string;
  onClose: () => void;
  onSelectLanguage: (language: string) => void;
};

const LANGUAGES = [
  { id: 'it', label: 'Italiano', flag: '🇮🇹' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelectorModal({
  visible,
  currentLanguage,
  title,
  closeLabel,
  onClose,
  onSelectLanguage,
}: LanguageSelectorModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View
          style={{
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            overflow: 'hidden',
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 44,
            backgroundColor: '#171717',
          }}
        >
          <Text className="text-white text-xl font-black mb-6 px-4">{title}</Text>

          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              onPress={() => onSelectLanguage(lang.id)}
              className={`flex-row items-center justify-between p-5 mb-3 rounded-[24px] border ${currentLanguage === lang.id ? 'bg-[#10B981]/20 border-[#10B981]/40' : 'bg-black/20 border-white/5'}`}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-4">{lang.flag}</Text>
                <Text className="text-white font-black text-lg">{lang.label}</Text>
              </View>
              {currentLanguage === lang.id ? (
                <View className="w-3 h-3 rounded-full bg-[#10B981]" />
              ) : null}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 py-4 items-center bg-white/10 rounded-[24px] border border-white/10"
          >
            <Text className="text-white font-bold">{closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
