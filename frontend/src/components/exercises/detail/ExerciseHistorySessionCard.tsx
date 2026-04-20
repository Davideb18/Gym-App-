import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { FileText, Save } from 'lucide-react-native';
import type { ExerciseHistorySession } from '../../../api/workoutService';

type ExerciseHistorySessionCardProps = {
  session: ExerciseHistorySession;
  index: number;
  locale: string;
  labels: {
    session: string;
    set: string;
    weight: string;
    reps: string;
    notes: string;
    notesPlaceholder: string;
  };
  noteValue: string;
  noteChanged: boolean;
  saving: boolean;
  onChangeNote: (sessionId: string, value: string) => void;
  onSaveNote: (sessionId: string) => void;
};

export default function ExerciseHistorySessionCard({
  session,
  index,
  locale,
  labels,
  noteValue,
  noteChanged,
  saving,
  onChangeNote,
  onSaveNote,
}: ExerciseHistorySessionCardProps) {
  return (
    <View
      className={`rounded-[32px] p-5 mb-4 border border-white/5 shadow-sm ${index === 0 ? 'bg-white/10' : 'bg-black/40'}`}
    >
      <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-white/5">
        <Text className="text-white font-black text-lg">
          {new Date(session.completed_at).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <View className="bg-[#10B981]/20 px-3 py-1.5 rounded-full border border-[#10B981]/30">
          <Text className="text-[#10B981] font-bold text-xs uppercase tracking-widest">
            {labels.session}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-3 px-2">
        <Text className="text-gray-500 font-bold w-12 text-center text-xs uppercase tracking-widest">
          {labels.set}
        </Text>
        <Text className="text-gray-500 font-bold flex-1 text-center text-xs uppercase tracking-widest">
          {labels.weight}
        </Text>
        <Text className="text-gray-500 font-bold flex-1 text-center text-xs uppercase tracking-widest">
          {labels.reps}
        </Text>
      </View>

      {session.sets.map((setItem) => (
        <View
          key={setItem.id}
          className="flex-row justify-between items-center bg-black/40 p-3 rounded-2xl mb-2 border border-white/5"
        >
          <View className="bg-white/5 border border-white/10 w-8 h-8 rounded-full items-center justify-center">
            <Text className="text-gray-300 font-black">{setItem.set_number}</Text>
          </View>
          <Text className="text-white font-black text-xl flex-1 text-center tracking-tighter">
            {setItem.weight ?? '--'}
          </Text>
          <Text className="text-white font-black text-xl flex-1 text-center tracking-tighter">
            {setItem.reps ?? '--'}
          </Text>
        </View>
      ))}

      <View className="mt-4 pt-4 border-t border-white/5">
        <View className="flex-row items-center mb-2 px-2">
          <FileText size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs font-bold ml-1.5 uppercase tracking-widest">
            {labels.notes}
          </Text>
        </View>
        <View className="bg-black/40 rounded-[20px] p-3 border border-white/5 flex-row items-end">
          <TextInput
            className="flex-1 text-white font-medium text-sm pt-0 pb-0"
            multiline
            placeholder={labels.notesPlaceholder}
            placeholderTextColor="#666"
            value={noteValue}
            onChangeText={(val) => onChangeNote(session.session_id, val)}
          />
          {noteChanged ? (
            <TouchableOpacity
              onPress={() => onSaveNote(session.session_id)}
              className="bg-[#10B981] p-2 rounded-full ml-2 shadow-lg shadow-green-900/50"
            >
              {saving ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <Save size={16} color="black" />
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}
