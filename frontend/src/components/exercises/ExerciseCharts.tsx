import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

interface ExerciseChartsProps {
  historyData: any[];
}

type ChartType = '1RM' | 'Volume' | 'Reps' | 'Serie';

export default function ExerciseCharts({ historyData }: ExerciseChartsProps) {
  const { t } = useTranslation();
  const { width } = Dimensions.get('window');
  const [activeMetric, setActiveMetric] = useState<ChartType>('1RM');

  // No data UI
  if (!historyData || historyData.length < 2) {
    return (
      <View className="items-center justify-center py-6 mt-4 opacity-50">
        <Text className="text-white font-bold mb-1">{t('exercises.insufficient_data')}</Text>
        <Text className="text-gray-500 text-xs text-center max-w-[250px]">
          {t('exercises.train_more_to_unlock')}
        </Text>
      </View>
    );
  }

  // Costruisci i dati per il grafico (ordinati cronologicamente vecchi -> nuovi)
  const sortedData = [...historyData].reverse();

  const epley = (weight: number, reps: number) => {
    if (weight <= 0 || reps <= 0) return 0;
    return weight * (1 + reps / 30);
  };

  const shouldShowLabel = (idx: number, total: number) => {
    if (total <= 6) return true;
    const step = Math.ceil(total / 6);
    return idx % step === 0 || idx === total - 1;
  };

  // Mapper di dati dinamico
  let chartData: any[] = [];
  let yAxisStyle: any = { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' };

  if (activeMetric === '1RM') {
    chartData = sortedData.map((session: any, idx: number) => {
      const sessionBestE1RM = Math.max(
        ...session.sets.map((set: any) =>
          epley(parseFloat(set.weight) || 0, parseInt(set.reps, 10) || 0),
        ),
      );
      return {
        value: Number(sessionBestE1RM.toFixed(1)),
        label: shouldShowLabel(idx, sortedData.length)
          ? new Date(session.completed_at).getDate() +
            '/' +
            (new Date(session.completed_at).getMonth() + 1)
          : '',
        frontColor: '#10B981',
      };
    });
  } else if (activeMetric === 'Volume') {
    chartData = sortedData.map((session: any, idx: number) => {
      const totalVolume = session.sets.reduce((acc: number, set: any) => {
        const w = parseFloat(set.weight) || 0;
        const r = parseInt(set.reps, 10) || 0;
        return acc + w * r;
      }, 0);
      return {
        value: totalVolume,
        label: shouldShowLabel(idx, sortedData.length)
          ? new Date(session.completed_at).getDate() +
            '/' +
            (new Date(session.completed_at).getMonth() + 1)
          : '',
        frontColor: '#3b82f6',
      };
    });
  } else if (activeMetric === 'Reps') {
    chartData = sortedData.map((session: any, idx: number) => {
      const totalReps = session.sets.reduce(
        (acc: number, set: any) => acc + (parseInt(set.reps, 10) || 0),
        0,
      );
      return {
        value: totalReps,
        label: shouldShowLabel(idx, sortedData.length)
          ? new Date(session.completed_at).getDate() +
            '/' +
            (new Date(session.completed_at).getMonth() + 1)
          : '',
        frontColor: '#F59E0B',
      };
    });
  } else if (activeMetric === 'Serie') {
    chartData = sortedData.map((session: any, idx: number) => {
      return {
        value: session.sets.length,
        label: shouldShowLabel(idx, sortedData.length)
          ? new Date(session.completed_at).getDate() +
            '/' +
            (new Date(session.completed_at).getMonth() + 1)
          : '',
        frontColor: '#8B5CF6',
      };
    });
  }

  const latest = chartData[chartData.length - 1]?.value ?? 0;
  const previous = chartData[chartData.length - 2]?.value ?? latest;
  const delta = latest - previous;
  const deltaText = delta === 0 ? '0' : `${delta > 0 ? '+' : ''}${Math.round(delta * 10) / 10}`;
  const deltaColor = delta > 0 ? '#10B981' : delta < 0 ? '#EF4444' : '#FFFFFF';

  const RenderTab = ({ metric, label }: { metric: ChartType; label: string }) => {
    const isActive = activeMetric === metric;
    return (
      <TouchableOpacity
        onPress={() => setActiveMetric(metric)}
        className={`px-3 py-1.5 rounded-full border ${isActive ? 'bg-white/20 border-white/30' : 'bg-transparent border-transparent'}`}
      >
        <Text
          className={`font-black text-[10px] uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="mt-8 mb-6">
      {/* Toggles Container */}
      <View className="flex-row items-center justify-between mb-4 bg-black/40 p-1 rounded-full border border-white/5 mx-1">
        <RenderTab metric="1RM" label={t('exercises.metrics.one_rm')} />
        <RenderTab metric="Volume" label={t('exercises.metrics.volume')} />
        <RenderTab metric="Reps" label={t('exercises.metrics.reps')} />
        <RenderTab metric="Serie" label={t('exercises.metrics.sets')} />
      </View>

      <View className="bg-black/40 p-5 pt-8 rounded-[32px] border border-white/5 shadow-inner">
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-white font-black text-xs uppercase tracking-[2px]">Trend</Text>
          <Text
            style={{ color: deltaColor }}
            className="font-black text-xs uppercase tracking-[2px]"
          >
            {deltaText}
          </Text>
        </View>
        {activeMetric === '1RM' ? (
          <LineChart
            data={chartData}
            width={width - 100}
            height={160}
            color="#10B981"
            thickness={3}
            startFillColor="rgba(16, 185, 129, 0.3)"
            endFillColor="rgba(16, 185, 129, 0.0)"
            initialSpacing={15}
            noOfSections={4}
            hideRules
            yAxisColor="transparent"
            xAxisColor="rgba(255,255,255,0.1)"
            yAxisTextStyle={yAxisStyle}
            xAxisLabelTextStyle={yAxisStyle}
            isAnimated
            curved
            pointerConfig={{
              pointerStripColor: 'rgba(255,255,255,0.2)',
              pointerStripWidth: 2,
              radius: 4,
              pointerColor: '#FFF',
              pointerComponent: () => (
                <View className="w-3 h-3 rounded-full bg-white border-[3px] border-[#10B981]" />
              ),
            }}
          />
        ) : (
          <BarChart
            data={chartData}
            width={width - 100}
            height={160}
            barBorderRadius={4}
            initialSpacing={15}
            noOfSections={4}
            hideRules
            yAxisColor="transparent"
            xAxisColor="rgba(255,255,255,0.1)"
            yAxisTextStyle={yAxisStyle}
            xAxisLabelTextStyle={yAxisStyle}
            isAnimated
            barWidth={18}
          />
        )}
      </View>
    </View>
  );
}
