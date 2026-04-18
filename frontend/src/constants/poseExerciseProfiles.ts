import { PoseExerciseProfile } from '../../../shared/types';

const CORE_JOINTS: PoseExerciseProfile['requiredJoints'] = [
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
];

export const POSE_EXERCISE_PROFILES: PoseExerciseProfile[] = [
  {
    code: 'squat',
    displayName: 'Squat',
    requiredJoints: [...CORE_JOINTS],
    primaryAngles: ['knee', 'hip', 'trunk'],
    phases: ['setup', 'descent', 'bottom', 'ascent', 'lockout'],
  },
  {
    code: 'bench_press',
    displayName: 'Panca Piana',
    requiredJoints: [...CORE_JOINTS],
    primaryAngles: ['elbow', 'shoulder', 'wrist', 'trunk'],
    phases: ['setup', 'descent', 'bottom', 'ascent', 'lockout'],
  },
  {
    code: 'curl',
    displayName: 'Curl',
    requiredJoints: [...CORE_JOINTS],
    primaryAngles: ['elbow', 'shoulder', 'wrist'],
    phases: ['setup', 'eccentric', 'concentric', 'lockout'],
  },
  {
    code: 'deadlift',
    displayName: 'Stacco',
    requiredJoints: [...CORE_JOINTS],
    primaryAngles: ['hip', 'knee', 'trunk', 'shoulder'],
    phases: ['setup', 'ascent', 'lockout', 'descent'],
  },
  {
    code: 'military_press',
    displayName: 'Military Press',
    requiredJoints: [...CORE_JOINTS],
    primaryAngles: ['elbow', 'shoulder', 'wrist', 'trunk'],
    phases: ['setup', 'ascent', 'lockout', 'descent'],
  },
  {
    code: 'barbell_row',
    displayName: 'Rematore',
    requiredJoints: [...CORE_JOINTS],
    primaryAngles: ['elbow', 'shoulder', 'hip', 'trunk'],
    phases: ['setup', 'concentric', 'eccentric'],
  },
  {
    code: 'seated_row',
    displayName: 'Vogatore',
    requiredJoints: [...CORE_JOINTS],
    primaryAngles: ['elbow', 'shoulder', 'trunk'],
    phases: ['setup', 'concentric', 'eccentric'],
  },
  {
    code: 'running',
    displayName: 'Corsa',
    requiredJoints: [...CORE_JOINTS],
    primaryAngles: ['knee', 'hip', 'trunk', 'elbow', 'shoulder'],
    phases: ['setup', 'concentric', 'eccentric'],
  },
];

export const POSE_EXERCISE_PROFILE_BY_CODE = Object.fromEntries(
  POSE_EXERCISE_PROFILES.map((profile) => [profile.code, profile]),
);
