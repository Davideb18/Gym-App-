import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Plus, Dumbbell, ChevronRight } from 'lucide-react-native';

type TemplateRow = {
  id: string;
  name: string;
  description?: string | null;
};

type SchedeTemplatesListProps = {
  loading: boolean;
  isError: boolean;
  templates: TemplateRow[];
  title: string;
  retryLabel: string;
  addLabel: string;
  emptyLabel: string;
  onRetry: () => void;
  onOpenTemplate: (id: string) => void;
  onLongPressTemplate: (id: string, name: string) => void;
  onOpenCreate: () => void;
};

export default function SchedeTemplatesList({
  loading,
  isError,
  templates,
  title,
  retryLabel,
  addLabel,
  emptyLabel,
  onRetry,
  onOpenTemplate,
  onLongPressTemplate,
  onOpenCreate,
}: SchedeTemplatesListProps) {
  return (
    <View>
      <Text className="text-white text-[10px] font-black uppercase tracking-[4px] mb-6 ml-1">
        {title}
      </Text>

      {loading ? (
        <ActivityIndicator color="#10B981" />
      ) : isError ? (
        <View className="bg-black/60 border border-red-500/20 rounded-[32px] p-6 mb-5 items-center">
          <Text className="text-white font-bold text-center mb-4">Error loading routines</Text>
          <TouchableOpacity
            onPress={onRetry}
            className="bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/30"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold">{retryLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              className="bg-black/60 border border-white/5 rounded-[32px] p-6 mb-5 flex-row items-center shadow-2xl"
              activeOpacity={0.7}
              onPress={() => onOpenTemplate(template.id)}
              onLongPress={() => onLongPressTemplate(template.id, template.name)}
            >
              <View className="bg-[#10B981]/10 p-4 rounded-2xl mr-5 border border-[#10B981]/20 shadow-md">
                <Dumbbell size={22} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-black text-xl tracking-tight">
                  {template.name}
                </Text>
                {template.description ? (
                  <Text className="text-white/90 font-bold text-xs mt-1" numberOfLines={1}>
                    {template.description}
                  </Text>
                ) : null}
              </View>
              <View className="bg-white/5 p-2 rounded-full">
                <ChevronRight size={18} color="#6B7280" strokeWidth={3} />
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={onOpenCreate}
            activeOpacity={0.8}
            className="bg-black/40 border border-dashed border-white/20 rounded-[40px] p-12 items-center mb-5"
          >
            <View className="bg-white/5 p-5 rounded-full mb-4 border border-white/5">
              <Plus size={32} color="#fff" />
            </View>
            <Text className="text-white text-center font-bold text-sm uppercase tracking-[2px] leading-loose">
              {templates.length === 0 ? emptyLabel : addLabel}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
