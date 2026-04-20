import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Play, CheckCircle2, RotateCcw, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useFormCoachStore } from '../../store/useFormCoachStore';
import { resolvePoseExerciseCode } from '../../utils/poseProfileResolver';
import { usePoseKeypointsStream } from '../../hooks/usePoseKeypointsStream';
import PoseOverlayDebug from './PoseOverlayDebug';
import ExerciseVideoPlayer from '../exercises/ExerciseVideoPlayer';
import { PoseExerciseCode, PoseFrame, PoseJointName } from '../../../../shared/types';

type TrackingProfile = {
  metricType: 'elbow_angle' | 'hip_depth';
  contractionDirection: 'increase' | 'decrease';
  startThreshold: number;
  repThreshold: number;
  recoveryThreshold: number;
  romRange: number;
  tempoWarning: number;
};

type TrackingIssueCounters = {
  insufficientDepth: number;
  tempoFast: number;
  torsoDrift: number;
};

const DEFAULT_HINT = 'coach.hints.keep_back_neutral';

const getTrackingProfile = (exerciseCode: PoseExerciseCode): TrackingProfile => {
  switch (exerciseCode) {
    case 'curl':
      return {
        metricType: 'elbow_angle',
        contractionDirection: 'decrease',
        startThreshold: 8,
        repThreshold: 28,
        recoveryThreshold: 6,
        romRange: 70,
        tempoWarning: 0.02,
      };
    case 'military_press':
    case 'bench_press':
      return {
        metricType: 'elbow_angle',
        contractionDirection: 'increase',
        startThreshold: 8,
        repThreshold: 24,
        recoveryThreshold: 6,
        romRange: 60,
        tempoWarning: 0.025,
      };
    case 'barbell_row':
    case 'seated_row':
      return {
        metricType: 'elbow_angle',
        contractionDirection: 'decrease',
        startThreshold: 8,
        repThreshold: 24,
        recoveryThreshold: 6,
        romRange: 55,
        tempoWarning: 0.025,
      };
    case 'deadlift':
    case 'squat':
    default:
      return {
        metricType: 'hip_depth',
        contractionDirection: 'decrease',
        startThreshold: 0.012,
        repThreshold: 0.03,
        recoveryThreshold: 0.008,
        romRange: 0.045,
        tempoWarning: 0.0009,
      };
  }
};

const getSourceStatusText = (source: string) => {
  switch (source) {
    case 'detector-initializing':
      return 'Detector: inizializzazione...';
    case 'detector-ready-no-frame-input':
      return 'Detector: pronto, ma nessun frame camera valido';
    case 'detector-live':
      return 'Detector: LIVE';
    case 'detector-error':
      return 'Detector: errore inizializzazione';
    default:
      return 'Detector: simulato';
  }
};

const getAngleDeg = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
) => {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magAB = Math.hypot(abx, aby);
  const magCB = Math.hypot(cbx, cby);
  const denom = Math.max(1e-6, magAB * magCB);
  const cosTheta = Math.min(1, Math.max(-1, dot / denom));
  return (Math.acos(cosTheta) * 180) / Math.PI;
};

const buildJointMap = (frame: PoseFrame | null) =>
  new Map(frame?.joints.map((joint) => [joint.name, joint]) || []);

const resetTrackingRuntime = (
  phaseRef: React.MutableRefObject<'up' | 'down'>,
  topDepthRef: React.MutableRefObject<number | null>,
  minDepthRef: React.MutableRefObject<number | null>,
  lastDepthRef: React.MutableRefObject<number | null>,
  lastTsRef: React.MutableRefObject<number | null>,
  lastRepTsRef: React.MutableRefObject<number>,
  lastHintRef: React.MutableRefObject<string>,
  issueCountsRef: React.MutableRefObject<TrackingIssueCounters>,
  setLiveRom: (value: number) => void,
  setLiveTempo: (value: number) => void,
) => {
  phaseRef.current = 'up';
  topDepthRef.current = null;
  minDepthRef.current = null;
  lastDepthRef.current = null;
  lastTsRef.current = null;
  lastRepTsRef.current = 0;
  lastHintRef.current = DEFAULT_HINT;
  issueCountsRef.current = {
    insufficientDepth: 0,
    tempoFast: 0,
    torsoDrift: 0,
  };
  setLiveRom(0);
  setLiveTempo(0);
};

const finalizeTrackingSummary = (issues: TrackingIssueCounters) => {
  const mistakes: string[] = [];

  if (issues.insufficientDepth > 0) mistakes.push('coach.mistakes.inconsistent_depth');
  if (issues.tempoFast > 2) mistakes.push('coach.mistakes.too_fast_eccentric');
  if (issues.torsoDrift > 2) mistakes.push('coach.mistakes.trunk_unstable');
  if (mistakes.length === 0) mistakes.push('coach.mistakes.none_detected');

  return {
    mistakes,
    tips: [
      'coach.tips.pause_bottom',
      'coach.tips.stable_torso',
      'coach.tips.breath_before_descent',
    ],
  };
};

type ProcessTrackingFrameParams = {
  frame: PoseFrame;
  source: string;
  profile: TrackingProfile;
  phaseRef: React.MutableRefObject<'up' | 'down'>;
  topDepthRef: React.MutableRefObject<number | null>;
  minDepthRef: React.MutableRefObject<number | null>;
  lastDepthRef: React.MutableRefObject<number | null>;
  lastTsRef: React.MutableRefObject<number | null>;
  lastRepTsRef: React.MutableRefObject<number>;
  issueCountsRef: React.MutableRefObject<TrackingIssueCounters>;
  setHintIfChanged: (hintKey: string) => void;
  incrementRep: () => void;
  setLiveRom: (value: number) => void;
  setLiveTempo: (value: number) => void;
};

type TrackingFrameContext = {
  metric: number;
  now: number;
  shoulderX: number;
  hipX: number;
};

const extractTrackingFrameContext = (
  frame: PoseFrame,
  profile: TrackingProfile,
  setHintIfChanged: (hintKey: string) => void,
): TrackingFrameContext | null => {
  const jointMap = buildJointMap(frame);
  const leftHip = jointMap.get('left_hip');
  const rightHip = jointMap.get('right_hip');
  const leftKnee = jointMap.get('left_knee');
  const rightKnee = jointMap.get('right_knee');
  const leftShoulder = jointMap.get('left_shoulder');
  const rightShoulder = jointMap.get('right_shoulder');
  const leftElbow = jointMap.get('left_elbow');
  const rightElbow = jointMap.get('right_elbow');
  const leftWrist = jointMap.get('left_wrist');
  const rightWrist = jointMap.get('right_wrist');

  const hasCoreLower = !!leftHip && !!rightHip && !!leftKnee && !!rightKnee;
  const hasCoreUpper =
    !!leftShoulder && !!rightShoulder && !!leftElbow && !!rightElbow && !!leftWrist && !!rightWrist;

  if ((profile.metricType === 'hip_depth' && !hasCoreLower) || !leftShoulder || !rightShoulder) {
    setHintIfChanged('coach.keep_body_visible');
    return null;
  }

  const hipY = hasCoreLower ? (leftHip!.y + rightHip!.y) / 2 : 0;
  const kneeY = hasCoreLower ? (leftKnee!.y + rightKnee!.y) / 2 : 0;
  const shoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const hipX = hasCoreLower ? (leftHip!.x + rightHip!.x) / 2 : shoulderX;

  const leftElbowAngle = hasCoreUpper
    ? getAngleDeg(leftShoulder!, leftElbow!, leftWrist!)
    : undefined;
  const rightElbowAngle = hasCoreUpper
    ? getAngleDeg(rightShoulder!, rightElbow!, rightWrist!)
    : undefined;
  const elbowAngle =
    leftElbowAngle !== undefined && rightElbowAngle !== undefined
      ? (leftElbowAngle + rightElbowAngle) / 2
      : undefined;

  const depth = kneeY - hipY;
  const metric = profile.metricType === 'hip_depth' ? depth : elbowAngle;

  if (metric === undefined) {
    setHintIfChanged('coach.keep_body_visible');
    return null;
  }

  return {
    metric,
    now: frame.timestampMs,
    shoulderX,
    hipX,
  };
};

const updateLiveMetrics = (
  metric: number,
  profile: TrackingProfile,
  topDepth: number,
  lastDepthRef: React.MutableRefObject<number | null>,
  lastTsRef: React.MutableRefObject<number | null>,
  now: number,
  setLiveRom: (value: number) => void,
  setLiveTempo: (value: number) => void,
) => {
  const prevDepth = lastDepthRef.current ?? metric;
  const prevTs = lastTsRef.current ?? now;
  const dt = Math.max(1, now - prevTs);
  const speed = Math.abs((metric - prevDepth) / dt);

  const romRaw =
    profile.contractionDirection === 'decrease'
      ? (topDepth - metric) / profile.romRange
      : (metric - topDepth) / profile.romRange;

  setLiveRom(Math.max(0, Math.min(1, romRaw)));
  setLiveTempo(speed * 1000);

  return { speed, topDepth };
};

const updateFeedbackCounters = (
  profile: TrackingProfile,
  shoulderX: number,
  hipX: number,
  speed: number,
  issueCountsRef: React.MutableRefObject<TrackingIssueCounters>,
  setHintIfChanged: (hintKey: string) => void,
) => {
  const torsoShift = Math.abs(shoulderX - hipX);
  if (profile.metricType === 'hip_depth' && torsoShift > 0.05) {
    issueCountsRef.current.torsoDrift += 1;
    setHintIfChanged('coach.hints.keep_back_neutral');
  }

  if (speed > profile.tempoWarning) {
    issueCountsRef.current.tempoFast += 1;
    setHintIfChanged('coach.hints.control_up_phase');
  }
};

const maybeCountRep = (
  metric: number,
  now: number,
  profile: TrackingProfile,
  phaseRef: React.MutableRefObject<'up' | 'down'>,
  topDepth: number,
  minDepthRef: React.MutableRefObject<number | null>,
  lastRepTsRef: React.MutableRefObject<number>,
  issueCountsRef: React.MutableRefObject<TrackingIssueCounters>,
  incrementRep: () => void,
  setHintIfChanged: (hintKey: string) => void,
) => {
  const descentTrigger =
    profile.contractionDirection === 'decrease'
      ? topDepth - profile.startThreshold
      : topDepth + profile.startThreshold;
  const bottomTrigger =
    profile.contractionDirection === 'decrease'
      ? topDepth - profile.repThreshold
      : topDepth + profile.repThreshold;

  const crossedStart =
    profile.contractionDirection === 'decrease' ? metric < descentTrigger : metric > descentTrigger;

  if (phaseRef.current === 'up' && crossedStart) {
    phaseRef.current = 'down';
    minDepthRef.current = metric;
    setHintIfChanged('coach.hints.go_deeper');
    return;
  }

  if (phaseRef.current !== 'down') return;

  if (profile.contractionDirection === 'decrease') {
    minDepthRef.current = Math.min(minDepthRef.current ?? metric, metric);
  } else {
    minDepthRef.current = Math.max(minDepthRef.current ?? metric, metric);
  }

  const minDepth = minDepthRef.current ?? metric;
  const repCooldownOk = now - lastRepTsRef.current > 700;
  const recoveredNearTop =
    profile.contractionDirection === 'decrease'
      ? metric > topDepth - profile.recoveryThreshold
      : metric < topDepth + profile.recoveryThreshold;

  if (!recoveredNearTop || !repCooldownOk) return;

  const achievedRepDepth =
    profile.contractionDirection === 'decrease'
      ? minDepth < bottomTrigger
      : minDepth > bottomTrigger;

  if (achievedRepDepth) {
    incrementRep();
    setHintIfChanged('coach.hints.good_rep');
  } else {
    issueCountsRef.current.insufficientDepth += 1;
    setHintIfChanged('coach.hints.go_deeper');
  }

  phaseRef.current = 'up';
  lastRepTsRef.current = now;
  minDepthRef.current = metric;
};

const processTrackingFrame = ({
  frame,
  source,
  profile,
  phaseRef,
  topDepthRef,
  minDepthRef,
  lastDepthRef,
  lastTsRef,
  lastRepTsRef,
  issueCountsRef,
  setHintIfChanged,
  incrementRep,
  setLiveRom,
  setLiveTempo,
}: ProcessTrackingFrameParams) => {
  if (source !== 'detector-live') {
    setHintIfChanged('coach.hints.detector_not_ready');
    return;
  }

  const context = extractTrackingFrameContext(frame, profile, setHintIfChanged);
  if (!context) return;

  const { metric, now, shoulderX, hipX } = context;

  if (topDepthRef.current === null) {
    topDepthRef.current = metric;
    minDepthRef.current = metric;
    lastDepthRef.current = metric;
    lastTsRef.current = now;
    return;
  }

  if (phaseRef.current === 'up') {
    if (profile.contractionDirection === 'decrease') {
      topDepthRef.current = Math.max(topDepthRef.current * 0.96 + metric * 0.04, metric);
    } else {
      topDepthRef.current = Math.min(topDepthRef.current * 0.96 + metric * 0.04, metric);
    }
  }

  const { speed, topDepth } = updateLiveMetrics(
    metric,
    profile,
    topDepthRef.current,
    lastDepthRef,
    lastTsRef,
    now,
    setLiveRom,
    setLiveTempo,
  );

  updateFeedbackCounters(profile, shoulderX, hipX, speed, issueCountsRef, setHintIfChanged);

  maybeCountRep(
    metric,
    now,
    profile,
    phaseRef,
    topDepth,
    minDepthRef,
    lastRepTsRef,
    issueCountsRef,
    incrementRep,
    setHintIfChanged,
  );

  lastDepthRef.current = metric;
  lastTsRef.current = now;
};

type FormCoachBodyProps = {
  mode: 'intro' | 'calibration' | 'tracking' | 'summary' | 'error';
  t: (key: string) => string;
  mediaUrl: string | null;
  mediaUrls: string[];
  handleStartCalibration: () => void;
  handleStartTracking: () => void;
  handleCompleteTracking: () => void;
  toggleCameraFacing: () => void;
  cameraFacing: 'front' | 'back';
  permissionGranted: boolean;
  cameraRef: React.MutableRefObject<CameraView | null>;
  handleCameraReady: () => void;
  setTrackingLayout: (layout: { width: number; height: number }) => void;
  frame: PoseFrame | null;
  trackingLayout: { width: number; height: number };
  boneConnections: Array<[PoseJointName, PoseJointName]>;
  liveHint: string;
  repCount: number;
  liveRom: number;
  liveTempo: number;
  getLocalizedCoachText: (value: string) => string;
  source: string;
  summary: { repCount?: number; mistakes?: string[]; tips?: string[] } | null;
  backToIntro: () => void;
  closeCoach: () => void;
};

function FormCoachBody({
  mode,
  t,
  mediaUrl,
  mediaUrls,
  handleStartCalibration,
  handleStartTracking,
  handleCompleteTracking,
  toggleCameraFacing,
  cameraFacing,
  permissionGranted,
  cameraRef,
  handleCameraReady,
  setTrackingLayout,
  frame,
  trackingLayout,
  boneConnections,
  liveHint,
  repCount,
  liveRom,
  liveTempo,
  getLocalizedCoachText,
  source,
  summary,
  backToIntro,
  closeCoach,
}: FormCoachBodyProps) {
  return (
    <View className="flex-1 px-6 pb-8">
      {mode === 'intro' ? (
        <View className="flex-1">
          <View className="bg-black/35 border border-white/10 rounded-3xl p-5 mb-4">
            <Text className="text-gray-300 text-sm mb-3">{t('coach.intro_description')}</Text>
            <View className="rounded-2xl bg-black/40 border border-white/10 h-52 items-center justify-center">
              {mediaUrl ? (
                <View className="w-full h-full p-2">
                  <ExerciseVideoPlayer imageUrl={mediaUrl} imageUrls={mediaUrls} fillParent />
                </View>
              ) : (
                <Text className="text-gray-500 text-xs px-4 text-center">
                  {t('coach.media_missing')}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleStartCalibration}
            className="mt-auto bg-[#10B981] rounded-2xl py-4 items-center"
          >
            <View className="flex-row items-center">
              <Play size={18} color="#000" />
              <Text className="text-black font-black uppercase tracking-widest text-sm ml-2">
                {t('coach.start_coach')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {mode === 'calibration' ? (
        <View className="flex-1">
          <View className="bg-black/35 border border-white/10 rounded-3xl p-5 mb-4">
            <Text className="text-white font-black text-lg mb-2">{t('coach.calibration')}</Text>
            <Text className="text-gray-300 text-sm">{t('coach.calibration_description')}</Text>
          </View>

          <View
            className="rounded-3xl bg-black/40 border border-white/10 flex-1 overflow-hidden relative"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setTrackingLayout({ width, height });
            }}
          >
            <TouchableOpacity
              onPress={toggleCameraFacing}
              className="absolute top-3 right-3 z-20 bg-black/50 border border-white/15 rounded-full px-3 py-2 flex-row items-center"
            >
              <RotateCcw size={14} color="#FFF" />
              <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-2">
                {cameraFacing === 'front' ? t('coach.front') : t('coach.back')}
              </Text>
            </TouchableOpacity>

            {permissionGranted ? (
              <CameraView
                ref={cameraRef}
                style={{ position: 'absolute', inset: 0 }}
                facing={cameraFacing}
                mute={true}
                onCameraReady={handleCameraReady}
              />
            ) : (
              <View className="flex-1 items-center justify-center px-6">
                <Camera size={52} color="#10B981" />
                <Text className="text-gray-300 text-sm mt-3 text-center">
                  {t('coach.camera_permission_calibration')}
                </Text>
              </View>
            )}

            <View className="absolute top-3 left-3 right-3 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
              <Text className="text-gray-200 text-xs">{t('coach.keep_body_visible')}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleStartTracking}
            className="mt-4 bg-[#10B981] rounded-2xl py-4 items-center"
          >
            <Text className="text-black font-black uppercase tracking-widest text-sm">
              {t('coach.start_tracking')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {mode === 'tracking' ? (
        <View className="flex-1">
          <View className="rounded-3xl bg-black/40 border border-white/10 p-5 mb-4">
            <Text className="text-gray-400 text-xs uppercase tracking-widest">
              {t('coach.repetitions')}
            </Text>
            <Text className="text-white font-black text-5xl tracking-tight mt-1">{repCount}</Text>
            <Text className="text-[#10B981] font-bold text-sm mt-3">
              {getLocalizedCoachText(liveHint)}
            </Text>
            <Text className="text-gray-300 text-xs mt-2">
              {t('coach.metrics_label')}: ROM {Math.round(liveRom * 100)}% • Tempo{' '}
              {liveTempo.toFixed(2)}
            </Text>
          </View>

          <View
            className="rounded-3xl bg-black/40 border border-white/10 flex-1 overflow-hidden relative"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setTrackingLayout({ width, height });
            }}
          >
            <TouchableOpacity
              onPress={toggleCameraFacing}
              className="absolute top-3 right-3 z-20 bg-black/50 border border-white/15 rounded-full px-3 py-2 flex-row items-center"
            >
              <RotateCcw size={14} color="#FFF" />
              <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-2">
                {cameraFacing === 'front' ? t('coach.front') : t('coach.back')}
              </Text>
            </TouchableOpacity>

            {permissionGranted ? (
              <CameraView
                ref={cameraRef}
                style={{ position: 'absolute', inset: 0 }}
                facing={cameraFacing}
                mute={true}
                onCameraReady={handleCameraReady}
              />
            ) : (
              <View className="flex-1 items-center justify-center px-6">
                <Text className="text-gray-300 text-sm text-center">
                  {t('coach.camera_not_available')}
                </Text>
              </View>
            )}

            <PoseOverlayDebug
              frame={frame}
              width={trackingLayout.width}
              height={trackingLayout.height}
              boneConnections={boneConnections}
            />

            <View className="absolute top-3 left-3 right-3 bg-black/45 border border-white/10 rounded-xl px-3 py-2">
              <Text className="text-[#A7F3D0] font-bold text-xs">
                {t('coach.live_hint_label')}: {getLocalizedCoachText(liveHint)}
              </Text>
              <Text className="text-gray-300 text-[10px] mt-1">
                {t('coach.pose_stream_label')}: {getSourceStatusText(source)}
              </Text>
            </View>

            <View className="absolute bottom-3 left-3 right-3 bg-black/45 border border-white/10 rounded-xl px-3 py-2">
              <Text className="text-gray-200 text-xs text-center">
                {t('coach.overlay_next_step')}
              </Text>
            </View>
          </View>

          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={handleCompleteTracking}
              className="flex-1 bg-[#10B981] rounded-2xl py-4 items-center"
            >
              <Text className="text-black font-black uppercase tracking-widest text-xs">
                {t('coach.finish_set')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {mode === 'summary' ? (
        <View className="flex-1">
          <View className="rounded-3xl bg-black/40 border border-white/10 p-5 mb-4">
            <View className="flex-row items-center mb-3">
              <CheckCircle2 size={22} color="#10B981" />
              <Text className="text-white font-black text-lg ml-2">{t('coach.summary_title')}</Text>
            </View>
            <Text className="text-gray-300 text-sm">
              {t('coach.detected_reps')}: {summary?.repCount ?? 0}
            </Text>
          </View>

          <View className="rounded-3xl bg-black/40 border border-white/10 p-5 mb-4">
            <Text className="text-white font-black text-sm uppercase tracking-widest mb-2">
              {t('coach.main_errors')}
            </Text>
            {(summary?.mistakes || []).map((mistake, idx) => (
              <Text key={`${mistake}-${idx}`} className="text-gray-300 text-sm mb-1">
                - {getLocalizedCoachText(mistake)}
              </Text>
            ))}
          </View>

          <View className="rounded-3xl bg-black/40 border border-white/10 p-5">
            <Text className="text-white font-black text-sm uppercase tracking-widest mb-2">
              {t('coach.how_to_improve')}
            </Text>
            {(summary?.tips || []).map((tip, idx) => (
              <Text key={`${tip}-${idx}`} className="text-[#A7F3D0] text-sm mb-1">
                - {getLocalizedCoachText(tip)}
              </Text>
            ))}
          </View>

          <View className="flex-row mt-auto">
            <TouchableOpacity
              onPress={backToIntro}
              className="flex-1 bg-white/10 border border-white/15 rounded-2xl py-4 items-center mr-2"
            >
              <Text className="text-white font-black uppercase tracking-widest text-xs">
                {t('coach.new_set')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={closeCoach}
              className="flex-1 bg-[#10B981] rounded-2xl py-4 items-center ml-2"
            >
              <Text className="text-black font-black uppercase tracking-widest text-xs">
                {t('coach.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function FormCoachScreen() {
  const { t } = useTranslation();
  const {
    isOpen,
    mode,
    exerciseName,
    mediaUrl,
    mediaUrls,
    repCount,
    liveHint,
    summary,
    closeCoach,
    startCalibration,
    startTracking,
    incrementRep,
    setLiveHint,
    completeTracking,
    backToIntro,
  } = useFormCoachStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [trackingLayout, setTrackingLayout] = useState({ width: 0, height: 0 });
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [liveRom, setLiveRom] = useState(0);
  const [liveTempo, setLiveTempo] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const phaseRef = useRef<'up' | 'down'>('up');
  const topDepthRef = useRef<number | null>(null);
  const minDepthRef = useRef<number | null>(null);
  const lastDepthRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const lastRepTsRef = useRef(0);
  const lastHintRef = useRef<string>('coach.hints.keep_back_neutral');
  const issueCountsRef = useRef({
    insufficientDepth: 0,
    tempoFast: 0,
    torsoDrift: 0,
  });

  const exerciseCode = resolvePoseExerciseCode(exerciseName);
  const captureFrame = useCallback(async () => {
    if (!cameraRef.current || !cameraReady) return null;

    try {
      const shot = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.15,
        skipProcessing: false,
      });

      if (!shot?.base64) return null;
      return {
        base64: shot.base64,
        width: shot.width,
        height: shot.height,
      };
    } catch {
      return null;
    }
  }, [cameraReady]);

  const { frame, source, boneConnections } = usePoseKeypointsStream({
    enabled: isOpen && mode === 'tracking' && !!permission?.granted,
    exerciseCode,
    captureFrame,
  });

  const ensureCameraPermission = async () => {
    if (permission?.granted) return true;
    const response = await requestPermission();
    return response.granted;
  };

  const handleStartCalibration = async () => {
    const granted = await ensureCameraPermission();
    if (!granted) return;
    startCalibration();
  };

  const handleStartTracking = async () => {
    const granted = await ensureCameraPermission();
    if (!granted) return;
    startTracking();
  };

  const toggleCameraFacing = () => {
    setCameraFacing((currentFacing) => (currentFacing === 'front' ? 'back' : 'front'));
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const getLocalizedCoachText = (value: string) => (value.startsWith('coach.') ? t(value) : value);

  const setHintIfChanged = useCallback(
    (hintKey: string) => {
      if (lastHintRef.current === hintKey) return;
      lastHintRef.current = hintKey;
      setLiveHint(hintKey);
    },
    [setLiveHint],
  );
  const trackingProfile = getTrackingProfile(exerciseCode);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'tracking') return;

    resetTrackingRuntime(
      phaseRef,
      topDepthRef,
      minDepthRef,
      lastDepthRef,
      lastTsRef,
      lastRepTsRef,
      lastHintRef,
      issueCountsRef,
      setLiveRom,
      setLiveTempo,
    );
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'tracking' || !frame) return;

    processTrackingFrame({
      frame,
      source,
      profile: trackingProfile,
      phaseRef,
      topDepthRef,
      minDepthRef,
      lastDepthRef,
      lastTsRef,
      lastRepTsRef,
      issueCountsRef,
      setHintIfChanged,
      incrementRep,
      setLiveRom,
      setLiveTempo,
    });
  }, [isOpen, frame, mode, source, incrementRep, setHintIfChanged, trackingProfile]);

  const handleCompleteTracking = () => {
    completeTracking(finalizeTrackingSummary(issueCountsRef.current));
  };

  if (!isOpen) return null;

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 240 }}>
      <LinearGradient
        colors={['#171717', '#4B5563']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <View className="flex-row items-center justify-between px-6 pt-16 pb-3">
        <Text className="text-white font-black text-base uppercase tracking-widest">
          {t('coach.title')}
        </Text>
        <TouchableOpacity
          onPress={closeCoach}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/15"
        >
          <X size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-4">
        <Text className="text-3xl text-white font-black tracking-tight">{exerciseName}</Text>
      </View>

      <FormCoachBody
        mode={mode}
        t={t}
        mediaUrl={mediaUrl}
        mediaUrls={mediaUrls}
        handleStartCalibration={handleStartCalibration}
        handleStartTracking={handleStartTracking}
        handleCompleteTracking={handleCompleteTracking}
        toggleCameraFacing={toggleCameraFacing}
        cameraFacing={cameraFacing}
        permissionGranted={Boolean(permission?.granted)}
        cameraRef={cameraRef}
        handleCameraReady={handleCameraReady}
        setTrackingLayout={setTrackingLayout}
        frame={frame}
        trackingLayout={trackingLayout}
        boneConnections={boneConnections}
        liveHint={liveHint}
        repCount={repCount}
        liveRom={liveRom}
        liveTempo={liveTempo}
        getLocalizedCoachText={getLocalizedCoachText}
        source={source}
        summary={summary}
        backToIntro={backToIntro}
        closeCoach={closeCoach}
      />
    </View>
  );
}
