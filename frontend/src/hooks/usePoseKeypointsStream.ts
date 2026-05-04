import { useEffect, useMemo, useRef, useState } from 'react';
import { PoseExerciseCode, PoseFrame, PoseJointName } from '../../../shared/types';
import { POSE_EXERCISE_PROFILE_BY_CODE } from '../constants/poseExerciseProfiles';

interface PoseKeypointsStreamOptions {
  enabled: boolean;
  exerciseCode: PoseExerciseCode;
  captureFrame?: () => Promise<{ base64: string; width: number; height: number } | null>;
  liveIntervalMs?: number;
}

type DetectorKeypoint = {
  name?: string;
  part?: string;
  x?: number;
  y?: number;
  score?: number;
};

type DetectorPose = {
  keypoints?: DetectorKeypoint[];
};

type PoseDetectorHandle = {
  dispose?: () => void;
};

type PoseStreamSource =
  | 'simulated'
  | 'detector-initializing'
  | 'detector-live'
  | 'detector-ready-no-frame-input'
  | 'detector-error';

const BONE_CONNECTIONS: Array<[PoseJointName, PoseJointName]> = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['right_hip', 'right_knee'],
];

function buildSimulatedFrame(
  exerciseCode: PoseExerciseCode,
  requiredJoints: PoseJointName[],
  now: number,
): PoseFrame {
  // When the camera stream is not ready, generate a deterministic motion pattern so the UI still animates.
  const t = now / 1000;
  const oscillation = Math.sin(t * 1.6);

  const isLowerBody = exerciseCode === 'squat' || exerciseCode === 'deadlift';
  const isCurl = exerciseCode === 'curl';
  const isPress = exerciseCode === 'bench_press' || exerciseCode === 'military_press';
  const isRow = exerciseCode === 'barbell_row' || exerciseCode === 'seated_row';

  const shoulderY = 0.27 + (isLowerBody ? oscillation * 0.012 : 0);
  const hipY = 0.52 + (isLowerBody ? oscillation * 0.03 : 0);
  const kneeY = 0.74 + (isLowerBody ? oscillation * 0.04 : 0);

  const elbowPull = Math.max(0, oscillation);
  const elbowPress = Math.max(0, -oscillation);
  const elbowYOffset = isCurl
    ? elbowPull * 0.03
    : isRow
      ? elbowPull * 0.018
      : isPress
        ? -elbowPress * 0.02
        : 0;
  const wristYOffset = isCurl
    ? elbowPull * 0.06
    : isRow
      ? elbowPull * 0.03
      : isPress
        ? -elbowPress * 0.045
        : 0;

  const base: Record<PoseJointName, { x: number; y: number }> = {
    left_shoulder: { x: 0.38, y: shoulderY },
    right_shoulder: { x: 0.62, y: shoulderY },
    left_elbow: { x: 0.34, y: 0.43 + elbowYOffset },
    right_elbow: { x: 0.66, y: 0.43 + elbowYOffset },
    left_wrist: { x: 0.33, y: 0.56 + wristYOffset },
    right_wrist: { x: 0.67, y: 0.56 + wristYOffset },
    left_hip: { x: 0.43, y: hipY },
    right_hip: { x: 0.57, y: hipY },
    left_knee: { x: 0.45, y: kneeY },
    right_knee: { x: 0.55, y: kneeY },
  };

  const joints = requiredJoints
    .map((name) => {
      const point = base[name];
      if (!point) return null;
      return {
        name,
        x: point.x,
        y: point.y,
        confidence: 0.93,
      };
    })
    .filter((joint): joint is NonNullable<typeof joint> => joint !== null);

  return {
    timestampMs: now,
    joints,
    modelConfidence: 0.93,
  };
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function _mapDetectorPoseToFrame(
  pose: DetectorPose,
  requiredJoints: PoseJointName[],
  width: number,
  height: number,
  now: number,
): PoseFrame | null {
  // Normalize detector coordinates into 0..1 values so the overlay works regardless of camera resolution.
  const keypoints = Array.isArray(pose?.keypoints) ? pose.keypoints : [];
  if (keypoints.length === 0 || width <= 0 || height <= 0) return null;

  const byName = new Map<string, DetectorKeypoint>();
  keypoints.forEach((kp) => {
    const key =
      typeof kp?.name === 'string' ? kp.name : typeof kp?.part === 'string' ? kp.part : null;
    if (key) byName.set(key, kp);
  });

  const joints = requiredJoints
    .map((name) => {
      const kp = byName.get(name);
      if (!kp || typeof kp.x !== 'number' || typeof kp.y !== 'number') return null;
      return {
        name,
        x: clamp01(kp.x / width),
        y: clamp01(kp.y / height),
        confidence: typeof kp.score === 'number' ? kp.score : 0.8,
      };
    })
    .filter((joint): joint is NonNullable<typeof joint> => joint !== null);

  if (joints.length === 0) return null;

  const avgConfidence =
    joints.reduce((sum, joint) => sum + (joint.confidence || 0), 0) / Math.max(1, joints.length);

  return {
    timestampMs: now,
    joints,
    modelConfidence: avgConfidence,
  };
}

export function usePoseKeypointsStream({
  enabled,
  exerciseCode,
  captureFrame,
  liveIntervalMs: _liveIntervalMs = 650,
}: PoseKeypointsStreamOptions) {
  const [frame, setFrame] = useState<PoseFrame | null>(null);
  const [source, setSource] = useState<PoseStreamSource>('simulated');
  const detectorRef = useRef<PoseDetectorHandle | null>(null);

  const requiredJoints = useMemo(() => {
    return POSE_EXERCISE_PROFILE_BY_CODE[exerciseCode]?.requiredJoints || [];
  }, [exerciseCode]);

  useEffect(() => {
    let cancelled = false;

    const bootstrapDetector = async () => {
      if (!enabled) {
        setSource('simulated');
        return;
      }

      try {
        // Load TensorFlow lazily so the app does not pay the startup cost when pose tracking is unused.
        setSource('detector-initializing');

        const tf = await import('@tensorflow/tfjs');
        const poseDetection = await import('@tensorflow-models/pose-detection');

        await tf.ready();

        // Warmup: ensure detector stack is available on the device.
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        });
        detectorRef.current = detector;

        if (!cancelled) {
          setSource('detector-ready-no-frame-input');
        }
      } catch {
        if (!cancelled) {
          setSource('detector-error');
        }
      }
    };

    bootstrapDetector();

    return () => {
      cancelled = true;
      if (detectorRef.current) {
        detectorRef.current.dispose?.();
        detectorRef.current = null;
      }
    };
  }, [enabled, captureFrame]);

  useEffect(() => {
    if (!enabled) {
      setFrame(null);
      return;
    }

    if (captureFrame && source === 'detector-live') {
      return;
    }

    // Fallback loop: keep the coach UI alive even before a real frame stream is wired in.
    // Placeholder stream until camera-frame input is connected to the detector.
    const interval = setInterval(() => {
      const now = Date.now();
      const nextFrame = buildSimulatedFrame(exerciseCode, requiredJoints, now);
      setFrame(nextFrame);
    }, 120);

    return () => clearInterval(interval);
  }, [enabled, exerciseCode, requiredJoints, captureFrame, source]);

  return {
    frame,
    requiredJoints,
    source,
    boneConnections: BONE_CONNECTIONS,
  };
}
