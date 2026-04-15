import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

type ProfileSession = {
  completed_at?: string | null;
  duration_seconds?: number | null;
  total_volume?: number | null;
};

type ProfileWorkoutAnalyticsProps = {
  sessions: ProfileSession[];
  title: string;
  trendTitle: string;
  reportTitle: string;
  thisMonthLabel: string;
  lastMonthLabel: string;
  sessionsLabel: string;
  durationLabel: string;
  volumeLabel: string;
  avgDurationLabel: string;
  noDataLabel: string;
  compareLabel: string;
};

function formatMinutes(seconds: number) {
  return Math.round(seconds / 60);
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function nextMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function previousMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

export default function ProfileWorkoutAnalytics({
  sessions,
  title,
  trendTitle,
  reportTitle,
  thisMonthLabel,
  lastMonthLabel,
  sessionsLabel,
  durationLabel,
  volumeLabel,
  avgDurationLabel,
  noDataLabel,
  compareLabel,
}: ProfileWorkoutAnalyticsProps) {
  const { width } = Dimensions.get('window');

  const analytics = useMemo(() => {
    const completed = [...sessions]
      .filter((session) => session.completed_at)
      .sort((a, b) => new Date(a.completed_at || '').getTime() - new Date(b.completed_at || '').getTime());

    const today = new Date();
    const currentMonth = monthStart(today);
    const prevMonth = previousMonthStart(today);
    const nextCurrentMonth = nextMonthStart(currentMonth);

    const thisMonthSessions = completed.filter((session) => {
      const date = new Date(session.completed_at || '');
      return date >= currentMonth && date < nextCurrentMonth;
    });

    const lastMonthSessions = completed.filter((session) => {
      const date = new Date(session.completed_at || '');
      return date >= prevMonth && date < currentMonth;
    });

    const durationData = completed.slice(-8).map((session, idx, arr) => {
      const durationMinutes = formatMinutes(Number(session.duration_seconds) || 0);
      const date = new Date(session.completed_at || '');
      const label = `${date.getDate()}/${date.getMonth() + 1}`;
      return {
        value: durationMinutes,
        label: arr.length <= 6 || idx === 0 || idx === arr.length - 1 || idx % 2 === 0 ? label : '',
        frontColor: '#8B5CF6',
      };
    });

    const calcTotals = (items: ProfileSession[]) => {
      const sessionsCount = items.length;
      const durationSeconds = items.reduce((acc, session) => acc + (Number(session.duration_seconds) || 0), 0);
      const volume = items.reduce((acc, session) => acc + (Number(session.total_volume) || 0), 0);
      const avgDurationSeconds = sessionsCount > 0 ? durationSeconds / sessionsCount : 0;
      return {
        sessionsCount,
        durationSeconds,
        volume,
        avgDurationSeconds,
      };
    };

    const thisMonth = calcTotals(thisMonthSessions);
    const lastMonth = calcTotals(lastMonthSessions);
    const durationDelta = lastMonth.durationSeconds > 0
      ? ((thisMonth.durationSeconds - lastMonth.durationSeconds) / lastMonth.durationSeconds) * 100
      : thisMonth.durationSeconds > 0
        ? 100
        : 0;

    return {
      durationData,
      thisMonth,
      lastMonth,
      durationDelta,
      hasChart: durationData.length >= 2,
    };
  }, [sessions]);

  const widthForChart = width - 100;

  return (
    <View className="mb-10">
      <Text className="text-white text-[10px] font-black uppercase tracking-[4px] mb-4 px-1">{title}</Text>

      <View className="bg-black/40 rounded-[32px] border border-white/5 p-4 mb-4">
        <View className="flex-row items-center justify-between mb-3 px-1">
          <Text className="text-white font-black text-xs uppercase tracking-[2px]">{trendTitle}</Text>
          <Text className="text-white/80 font-bold text-[10px] uppercase tracking-[1px]">{compareLabel}</Text>
        </View>

        {analytics.hasChart ? (
          <LineChart
            data={analytics.durationData}
            width={widthForChart}
            height={160}
            color="#8B5CF6"
            thickness={3}
            startFillColor="rgba(139, 92, 246, 0.28)"
            endFillColor="rgba(139, 92, 246, 0.0)"
            initialSpacing={10}
            noOfSections={4}
            hideRules
            yAxisColor="transparent"
            xAxisColor="rgba(255,255,255,0.1)"
            yAxisTextStyle={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 'bold' }}
            xAxisLabelTextStyle={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 'bold' }}
            isAnimated
            curved
          />
        ) : (
          <View className="items-center justify-center py-8 px-4">
            <Text className="text-white font-bold text-sm text-center">{noDataLabel}</Text>
          </View>
        )}
      </View>

      <View className="bg-black/40 rounded-[32px] border border-white/5 p-4">
        <View className="flex-row items-center justify-between mb-4 px-1">
          <Text className="text-white font-black text-xs uppercase tracking-[2px]">{reportTitle}</Text>
          <View className={`px-2.5 py-1 rounded-full border ${analytics.durationDelta >= 0 ? 'bg-emerald-500/15 border-emerald-500/20' : 'bg-red-500/15 border-red-500/20'}`}>
            <Text className={`font-black text-[10px] uppercase tracking-[1px] ${analytics.durationDelta >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {analytics.durationDelta >= 0 ? '+' : ''}{Math.round(analytics.durationDelta)}%
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-3">
          <View className="flex-1 min-w-[46%] bg-white/5 rounded-2xl p-4 border border-white/5">
            <Text className="text-white/70 text-[10px] uppercase tracking-[1px] mb-1">{thisMonthLabel}</Text>
            <Text className="text-white font-black text-2xl">{analytics.thisMonth.sessionsCount}</Text>
            <Text className="text-white/80 text-[11px] mt-1">{sessionsLabel}</Text>
            <Text className="text-white/80 text-[11px] mt-1">
              {formatMinutes(analytics.thisMonth.durationSeconds)} {durationLabel}
            </Text>
            <Text className="text-white/80 text-[11px] mt-1">
              {analytics.thisMonth.volume.toLocaleString()} {volumeLabel}
            </Text>
            <Text className="text-white/80 text-[11px] mt-1">
              {formatMinutes(analytics.thisMonth.avgDurationSeconds)} {avgDurationLabel}
            </Text>
          </View>

          <View className="flex-1 min-w-[46%] bg-white/5 rounded-2xl p-4 border border-white/5">
            <Text className="text-white/70 text-[10px] uppercase tracking-[1px] mb-1">{lastMonthLabel}</Text>
            <Text className="text-white font-black text-2xl">{analytics.lastMonth.sessionsCount}</Text>
            <Text className="text-white/80 text-[11px] mt-1">{sessionsLabel}</Text>
            <Text className="text-white/80 text-[11px] mt-1">
              {formatMinutes(analytics.lastMonth.durationSeconds)} {durationLabel}
            </Text>
            <Text className="text-white/80 text-[11px] mt-1">
              {analytics.lastMonth.volume.toLocaleString()} {volumeLabel}
            </Text>
            <Text className="text-white/80 text-[11px] mt-1">
              {formatMinutes(analytics.lastMonth.avgDurationSeconds)} {avgDurationLabel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
