import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  ListRenderItemInfo,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight, Clock, Dumbbell, X } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutService } from '../../api/workoutService';
import type { RecentWorkoutSession } from '../../api/workoutService';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useWorkoutSessionDetailStore } from '../../store/useWorkoutSessionDetailStore';

const SW = Dimensions.get('window').width;
const ITEM_W = 58,
  ITEM_GAP = 10,
  ITEM_TOTAL = ITEM_W + ITEM_GAP;
const SIDE_PAD = (SW - ITEM_W) / 2;
const PAST = 60,
  FUT = 14,
  TODAY_IDX = PAST,
  TOTAL = PAST + 1 + FUT;

const ALL_DAYS: Date[] = Array.from({ length: TOTAL }, (_, i) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (PAST - i));
  return d;
});

type HistorySession = RecentWorkoutSession;

const getSessionDay = (session: HistorySession) => {
  const source = session.completed_at;
  if (!source) return null;
  const day = new Date(source);
  day.setHours(0, 0, 0, 0);
  return day;
};

type DayTimelineItemProps = {
  item: Date;
  index: number;
  selectedIndex: number;
  todayIndex: number;
  locale: string;
  workoutSet: Set<string>;
  onSelectDay: (index: number) => void;
};

function DayTimelineItem({
  item,
  index,
  selectedIndex,
  todayIndex,
  locale,
  workoutSet,
  onSelectDay,
}: DayTimelineItemProps) {
  const sel = index === selectedIndex;
  const isToday = index === todayIndex;
  const future = index > todayIndex;
  const hasWorkout = workoutSet.has(item.toDateString());

  return (
    <TouchableOpacity
      onPress={() => onSelectDay(index)}
      activeOpacity={0.7}
      style={{
        width: ITEM_W,
        marginRight: ITEM_GAP,
        height: sel ? 88 : 72,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: sel ? '#10B981' : future ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.3)',
        borderWidth: 1,
        borderColor: sel ? '#10B981' : 'rgba(255,255,255,0.08)',
      }}
    >
      <Text
        style={{
          color: sel ? 'rgba(0,0,0,0.6)' : '#FFFFFF',
          fontSize: 9,
          fontWeight: '800',
          textTransform: 'uppercase',
        }}
      >
        {item.toLocaleDateString(locale, { weekday: 'short' })}
      </Text>
      <Text
        style={{
          color: sel ? '#000' : isToday ? '#10B981' : future ? '#374151' : '#FFF',
          fontSize: sel ? 26 : 20,
          fontWeight: '900',
          marginVertical: 2,
        }}
      >
        {item.getDate()}
      </Text>
      <View style={{ height: 7, alignItems: 'center', justifyContent: 'center' }}>
        {hasWorkout && (
          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: sel ? '#000' : '#10B981',
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

type SessionCardProps = {
  session: HistorySession;
  t: (key: string) => string;
  onOpen: (session: HistorySession) => void;
};

function SessionCard({ session, t, onOpen }: SessionCardProps) {
  const mins = Math.floor((session.duration_seconds || 0) / 60);
  const vol = session.total_volume || 0;
  const sets = session.performed_sets?.length || 0;
  const name = session.workout_templates?.name || 'Freestyle';

  return (
    <TouchableOpacity
      onPress={() => onOpen(session)}
      className="bg-black/40 border border-white/10 rounded-[32px] overflow-hidden mb-4"
    >
      <View className="flex-row items-center p-5 pb-4 border-b border-white/5">
        <View className="bg-blue-500/10 p-3 rounded-2xl mr-4 border border-blue-500/20">
          <Dumbbell size={24} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-black text-lg tracking-tight" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-white font-bold text-[10px] uppercase tracking-widest mt-1">
            {t('history.completed')}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center px-6 py-4">
        <View className="items-center">
          <Clock size={14} color="#FFFFFF" />
          <Text className="text-white font-black text-sm mt-1">{mins} min</Text>
          <Text className="text-white font-bold text-[9px] uppercase tracking-widest">
            {t('history.time')}
          </Text>
        </View>
        <View className="w-px h-7 bg-white/10" />
        <View className="items-center">
          <Dumbbell size={14} color="#FFFFFF" />
          <Text className="text-white font-black text-sm mt-1">{vol.toLocaleString()} kg</Text>
          <Text className="text-white font-bold text-[9px] uppercase tracking-widest">
            {t('history.volume')}
          </Text>
        </View>
        <View className="w-px h-7 bg-white/10" />
        <View className="items-center">
          <Text className="text-white font-black text-sm">{sets}</Text>
          <Text className="text-white font-bold text-[9px] uppercase tracking-widest">
            {t('history.sets')}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center px-6 py-3 border-t border-white/5">
        <Text className="text-white font-bold text-xs uppercase tracking-widest">
          {t('history.view_details')}
        </Text>
        <ChevronRight size={16} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

function FutureDayState({ t }: { t: (key: string) => string }) {
  return (
    <View className="items-center mt-10">
      <Clock size={40} color="#10B981" />
      <Text className="text-white font-bold text-lg mt-3">{t('history.future_title')}</Text>
      <Text className="text-white text-sm mt-1 text-center">{t('history.future_subtitle')}</Text>
    </View>
  );
}

function RestDayState({ t }: { t: (key: string) => string }) {
  return (
    <View className="items-center mt-10">
      <Dumbbell size={48} color="#FFFFFF" />
      <Text className="text-white font-bold text-lg mt-3">{t('history.rest_day')}</Text>
      <Text className="text-white text-sm mt-1">{t('history.no_workouts')}</Text>
    </View>
  );
}

type CalendarBottomSheetProps = {
  visible: boolean;
  locale: string;
  calMonth: { y: number; m: number };
  selDate: Date;
  today: Date;
  startOff: number;
  daysInMonth: number;
  workoutSet: Set<string>;
  onClose: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
  t: (key: string) => string;
};

function CalendarBottomSheet({
  visible,
  locale,
  calMonth,
  selDate,
  today,
  startOff,
  daysInMonth,
  workoutSet,
  onClose,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  t,
}: CalendarBottomSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View
          style={{
            width: '100%',
            backgroundColor: '#171717',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            overflow: 'hidden',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 44,
          }}
        >
          <LinearGradient
            colors={['#171717', '#D1D5DB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['rgba(16,185,129,0.25)', 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100 }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: 'rgba(16,185,129,0.5)',
            }}
          />
          <View className="w-10 h-1.5 bg-white/30 rounded-full self-center mb-5" />
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={onPrevMonth}
              className="bg-white/10 rounded-full p-1.5 border border-white/10"
            >
              <ChevronLeft size={20} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-black">
              {new Date(calMonth.y, calMonth.m).toLocaleDateString(locale, {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <TouchableOpacity
              onPress={onNextMonth}
              className="bg-white/10 rounded-full p-1.5 border border-white/10"
            >
              <ChevronRight size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View className="flex-row mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <Text
                key={d}
                style={{ width: (SW - 40) / 7, textAlign: 'center' }}
                className="text-white text-[10px] font-black uppercase"
              >
                {d}
              </Text>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {Array.from({ length: startOff }).map((_, i) => (
              <View key={`e${i}`} style={{ width: (SW - 40) / 7, height: 48 }} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const cell = new Date(calMonth.y, calMonth.m, day);
              cell.setHours(0, 0, 0, 0);
              const isToday = cell.toDateString() === today.toDateString();
              const isSelected = cell.toDateString() === selDate.toDateString();
              const hasWorkout = workoutSet.has(cell.toDateString());
              const isFuture = cell > today;

              return (
                <TouchableOpacity
                  key={day}
                  disabled={isFuture}
                  onPress={() => onSelectDate(cell)}
                  style={{
                    width: (SW - 40) / 7,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 14,
                    marginBottom: 4,
                    backgroundColor: isSelected
                      ? '#10B981'
                      : isToday
                        ? 'rgba(16,185,129,0.15)'
                        : 'transparent',
                    borderWidth: isToday && !isSelected ? 1 : 0,
                    borderColor: 'rgba(16,185,129,0.4)',
                  }}
                >
                  <Text
                    style={{
                      color: isSelected
                        ? '#000'
                        : isToday
                          ? '#10B981'
                          : isFuture
                            ? '#374151'
                            : '#FFF',
                      fontSize: 15,
                      fontWeight: isSelected || isToday ? '900' : '700',
                    }}
                  >
                    {day}
                  </Text>
                  {hasWorkout && (
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: isSelected ? '#000' : '#10B981',
                        marginTop: 2,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="flex-row items-center justify-center bg-white/10 border border-white/10 rounded-[30px] py-3.5 mt-5 gap-x-2"
          >
            <X size={18} color="#FFF" />
            <Text className="text-white font-bold text-sm">{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const { openSessionDetail } = useWorkoutSessionDetailStore();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [selIdx, setSelIdx] = useState(TODAY_IDX);
  const [calOpen, setCalOpen] = useState(false);
  const [calMonth, setCalMonth] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const flatRef = useRef<FlatList<Date>>(null);

  const selDate = ALL_DAYS[selIdx];

  const { data: sessions, isLoading } = useQuery<HistorySession[]>({
    queryKey: ['recentSessions', user?.id],
    queryFn: () => WorkoutService.getRecentSessions(user!.id),
    enabled: !!user?.id,
  });

  const workoutSet = useMemo(
    () =>
      new Set(
        sessions
          ?.map((s) => getSessionDay(s)?.toDateString())
          .filter((value): value is string => Boolean(value)) ?? [],
      ),
    [sessions],
  );

  const daySessions = useMemo(
    () =>
      sessions?.filter((s) => {
        const d = getSessionDay(s);
        return d?.toDateString() === selDate.toDateString();
      }) ?? [],
    [sessions, selDate],
  );

  const scrollTo = useCallback((idx: number, animated = true) => {
    flatRef.current?.scrollToOffset({ offset: idx * ITEM_TOTAL, animated });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => scrollTo(TODAY_IDX, false), 80);
    return () => clearTimeout(t);
  }, [scrollTo]);

  const selectDay = useCallback(
    (idx: number) => {
      setSelIdx(idx);
      scrollTo(idx);
    },
    [scrollTo],
  );
  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setSelIdx(
      Math.max(0, Math.min(Math.round(e.nativeEvent.contentOffset.x / ITEM_TOTAL), TOTAL - 1)),
    );
  }, []);

  const firstDay = new Date(calMonth.y, calMonth.m, 1).getDay();
  const startOff = firstDay === 0 ? 6 : firstDay - 1;
  const daysInM = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
  const prevCal = () =>
    setCalMonth((p) => (p.m === 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: p.m - 1 }));
  const nextCal = () =>
    setCalMonth((p) => (p.m === 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: p.m + 1 }));

  const renderDay = useCallback(
    ({ item, index }: ListRenderItemInfo<Date>) => (
      <DayTimelineItem
        item={item}
        index={index}
        selectedIndex={selIdx}
        todayIndex={TODAY_IDX}
        locale={i18n.language}
        workoutSet={workoutSet}
        onSelectDay={selectDay}
      />
    ),
    [selIdx, i18n.language, workoutSet, selectDay],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<Date> | null | undefined, i: number) => ({
      length: ITEM_TOTAL,
      offset: i * ITEM_TOTAL,
      index: i,
    }),
    [],
  );

  const openSessionDetails = useCallback(
    (session: HistorySession) => {
      openSessionDetail(session);
    },
    [openSessionDetail],
  );

  const onSelectCalendarDate = useCallback(
    (cell: Date) => {
      const diff = Math.round((today.getTime() - cell.getTime()) / 86400000);
      const idx = TODAY_IDX - diff;
      if (idx >= 0 && idx < TOTAL) selectDay(idx);
      setCalOpen(false);
    },
    [today, selectDay],
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#171717', '#D1D5DB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View className="px-5 pt-8 pb-3">
          <ScreenHeader
            subtitle={t('history.chronology_title')}
            className="mb-3"
            rightAction={
              selIdx !== TODAY_IDX ? (
                <TouchableOpacity
                  onPress={() => selectDay(TODAY_IDX)}
                  className="bg-[#10B981]/15 px-4 py-1.5 rounded-full border border-[#10B981]/30"
                >
                  <Text className="text-[#10B981] text-[11px] font-black uppercase tracking-widest">
                    {t('common.today')}
                  </Text>
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>

        <View className="flex-row justify-between items-center px-5 mb-3">
          <TouchableOpacity
            onPress={() => {
              setCalMonth({ y: selDate.getFullYear(), m: selDate.getMonth() });
              setCalOpen(true);
            }}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-xl font-black tracking-tight mr-1">
              {selDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
            </Text>
            <ChevronRight size={18} color="#10B981" />
          </TouchableOpacity>
          <View className="flex-row gap-x-2">
            <TouchableOpacity
              onPress={() => selIdx > 0 && selectDay(selIdx - 1)}
              style={{ opacity: selIdx === 0 ? 0.2 : 1 }}
              className="bg-white/10 rounded-full p-1.5 border border-white/10"
            >
              <ChevronLeft size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => selIdx < TOTAL - 1 && selectDay(selIdx + 1)}
              style={{ opacity: selIdx === TOTAL - 1 ? 0.2 : 1 }}
              className="bg-white/10 rounded-full p-1.5 border border-white/10"
            >
              <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={flatRef}
          data={ALL_DAYS}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderDay}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_TOTAL}
          decelerationRate="fast"
          getItemLayout={getItemLayout}
          contentContainerStyle={{ paddingHorizontal: SIDE_PAD }}
          onMomentumScrollEnd={onScrollEnd}
          removeClippedSubviews
          maxToRenderPerBatch={20}
          windowSize={10}
          initialNumToRender={20}
          style={{ flexGrow: 0, marginBottom: 8 }}
        />

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 240 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-white text-2xl font-[1000] tracking-tighter mb-4">
            {selIdx === TODAY_IDX
              ? t('common.today')
              : selDate.toLocaleDateString(i18n.language, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
          </Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
          ) : selIdx > TODAY_IDX ? (
            <FutureDayState t={t} />
          ) : daySessions.length === 0 ? (
            <RestDayState t={t} />
          ) : (
            daySessions.map((session) => (
              <SessionCard key={session.id} session={session} t={t} onOpen={openSessionDetails} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <CalendarBottomSheet
        visible={calOpen}
        locale={i18n.language}
        calMonth={calMonth}
        selDate={selDate}
        today={today}
        startOff={startOff}
        daysInMonth={daysInM}
        workoutSet={workoutSet}
        onClose={() => setCalOpen(false)}
        onPrevMonth={prevCal}
        onNextMonth={nextCal}
        onSelectDate={onSelectCalendarDate}
        t={t}
      />
    </View>
  );
}
