import { useEffect, useMemo, useState } from 'react';
import { PoseExerciseCode, PoseFrame, PoseJointName } from '../../../shared/types';
import { POSE_EXERCISE_PROFILE_BY_CODE } from '../constants/poseExerciseProfiles';

interface PoseKeypointsStreamOptions {
  enabled: boolean;
  exerciseCode: PoseExerciseCode;
}

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

function buildSimulatedFrame(requiredJoints: PoseJointName[], now: number): PoseFrame {
  const t = now / 1000;
  const shoulderY = 0.27 + Math.sin(t * 0.9) * 0.015;
  const hipY = 0.52 + Math.sin(t * 1.1) * 0.03;
  const kneeY = 0.74 + Math.sin(t * 1.2) * 0.04;

  const base: Record<PoseJointName, { x: number; y: number }> = {
    left_shoulder: { x: 0.38, y: shoulderY },
    right_shoulder: { x: 0.62, y: shoulderY },
    left_elbow: { x: 0.34, y: 0.43 + Math.sin(t * 1.2) * 0.02 },
    right_elbow: { x: 0.66, y: 0.43 + Math.sin(t * 1.2) * 0.02 },
    left_wrist: { x: 0.33, y: 0.56 + Math.sin(t * 1.3) * 0.02 },
    right_wrist: { x: 0.67, y: 0.56 + Math.sin(t * 1.3) * 0.02 },
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

export function usePoseKeypointsStream({ enabled, exerciseCode }: PoseKeypointsStreamOptions) {
  const [frame, setFrame] = useState<PoseFrame | null>(null);

  const requiredJoints = useMemo(() => {
    return POSE_EXERCISE_PROFILE_BY_CODE[exerciseCode]?.requiredJoints || [];
  }, [exerciseCode]);

  useEffect(() => {
    if (!enabled) {
      setFrame(null);
      return;
    }

    // Placeholder stream: keeps overlay pipeline and UI timing stable while real detector is integrated.
    const interval = setInterval(() => {
      const now = Date.now();
      const nextFrame = buildSimulatedFrame(requiredJoints, now);
      setFrame(nextFrame);
    }, 120);

    return () => clearInterval(interval);
  }, [enabled, requiredJoints]);

  return {
    frame,
    requiredJoints,
    source: 'simulated' as const,
    boneConnections: BONE_CONNECTIONS,
  };
}
