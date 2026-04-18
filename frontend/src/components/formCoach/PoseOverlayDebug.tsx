import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { PoseFrame, PoseJointName } from '../../../../shared/types';

interface Props {
  frame: PoseFrame | null;
  width: number;
  height: number;
  boneConnections: Array<[PoseJointName, PoseJointName]>;
}

export default function PoseOverlayDebug({ frame, width, height, boneConnections }: Props) {
  const pointByName = useMemo(() => {
    const map = new Map<PoseJointName, { x: number; y: number }>();
    (frame?.joints || []).forEach((joint) => {
      map.set(joint.name, {
        x: joint.x * width,
        y: joint.y * height,
      });
    });
    return map;
  }, [frame, width, height]);

  if (!frame || width <= 0 || height <= 0) return null;

  return (
    <View style={{ position: 'absolute', inset: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>
        {boneConnections.map(([a, b]) => {
          const p1 = pointByName.get(a);
          const p2 = pointByName.get(b);
          if (!p1 || !p2) return null;

          return (
            <Line
              key={`${a}-${b}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgba(16,185,129,0.75)"
              strokeWidth={3}
            />
          );
        })}

        {(frame.joints || []).map((joint) => {
          const p = pointByName.get(joint.name);
          if (!p) return null;
          return (
            <Circle
              key={joint.name}
              cx={p.x}
              cy={p.y}
              r={4.5}
              fill={joint.confidence > 0.85 ? '#10B981' : '#F59E0B'}
            />
          );
        })}
      </Svg>
    </View>
  );
}
