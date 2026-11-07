import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { useAppConfig } from '../lib/theme';

export type ArtName =
  | 'cyclist'
  | 'sachet'
  | 'blister'
  | 'clinic'
  | 'crate'
  | 'route'
  | 'pills'
  | 'handover'
  | 'shield';

export function Art({
  name,
  size = 110,
  color,
  fill,
  hlColor,
  withHighlight = false,
  opacity = 1,
}: {
  name: ArtName;
  size?: number;
  color?: string;
  fill?: string;
  hlColor?: string;
  withHighlight?: boolean;
  opacity?: number;
}) {
  const { colors } = useAppConfig();
  const c = color ?? colors.artStroke;
  const f = fill ?? colors.artFill;
  const hl = hlColor ?? colors.artHighlight;
  const p = {
    stroke: c,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" opacity={opacity}>
      {withHighlight && <Circle cx="82" cy="38" r="22" fill={hl} />}
      {name === 'cyclist' && (
        <G {...p}>
          <Circle cx="30" cy="84" r="16" fill={f} />
          <Circle cx="30" cy="84" r="4" />
          <Circle cx="90" cy="84" r="16" fill={f} />
          <Circle cx="90" cy="84" r="4" />
          <Path d="M30 84 L52 56 L78 56 L60 84 Z" />
          <Path d="M78 56 L90 84 M52 56 L46 44 M40 44 H52" />
          <Path d="M78 56 L84 44 H94" />
          <Rect x="22" y="42" width="20" height="14" rx="3" fill={f} />
          <Path d="M32 45 V53 M28 49 H36" />
          <Circle cx="66" cy="30" r="8" fill={f} />
          <Path d="M60 40 L52 56 M66 40 L78 50" />
          <Path d="M6 68 H16 M2 78 H12" opacity={0.6} />
        </G>
      )}
      {name === 'sachet' && (
        <G {...p}>
          <Rect x="28" y="18" width="64" height="84" rx="8" fill={f} />
          <Path d="M28 30 H92 M28 90 H92" />
          <Path d="M36 22 V26 M48 22 V26 M60 22 V26 M72 22 V26 M84 22 V26" />
          <Path d="M36 94 V98 M48 94 V98 M60 94 V98 M72 94 V98 M84 94 V98" />
          <Circle cx="60" cy="56" r="14" fill="#fff" />
          <Path d="M60 49 V63 M53 56 H67" />
          <Path d="M44 78 H76" />
        </G>
      )}
      {name === 'blister' && (
        <G {...p}>
          <Rect x="22" y="26" width="76" height="68" rx="10" fill={f} />
          <Circle cx="40" cy="46" r="8" fill="#fff" />
          <Circle cx="60" cy="46" r="8" fill="#fff" />
          <Circle cx="80" cy="46" r="8" fill="#fff" />
          <Circle cx="40" cy="72" r="8" fill="#fff" />
          <Circle cx="60" cy="72" r="8" fill="#fff" />
          <Circle cx="80" cy="72" r="8" fill="#fff" />
          <Path d="M35 46 H45 M55 46 H65 M75 46 H85 M35 72 H45 M55 72 H65 M75 72 H85" />
        </G>
      )}
      {name === 'clinic' && (
        <G {...p}>
          <Path d="M18 96 H102" />
          <Rect x="28" y="44" width="64" height="52" rx="4" fill={f} />
          <Path d="M22 46 L60 22 L98 46" />
          <Rect x="52" y="70" width="16" height="26" fill="#fff" />
          <Rect x="36" y="56" width="12" height="12" fill="#fff" />
          <Rect x="72" y="56" width="12" height="12" fill="#fff" />
          <Path d="M60 30 V42 M54 36 H66" />
        </G>
      )}
      {name === 'crate' && (
        <G {...p}>
          <Path d="M22 44 L60 26 L98 44 L98 84 L60 102 L22 84 Z" fill={f} />
          <Path d="M22 44 L60 62 L98 44 M60 62 V102" />
          <Path d="M38 35 L76 53" />
          <Path d="M76 68 V80 M70 74 H82" />
        </G>
      )}
      {name === 'route' && (
        <G {...p}>
          <Path d="M22 92 C 26 56, 94 64, 96 28" strokeDasharray="4, 5" />
          <Circle cx="22" cy="92" r="8" fill={f} />
          <Path
            d="M96 14 C88 14 82 20 82 28 C82 38 96 50 96 50 C96 50 110 38 110 28 C110 20 104 14 96 14 Z"
            fill={f}
          />
          <Circle cx="96" cy="28" r="4" fill="#fff" />
        </G>
      )}
      {name === 'pills' && (
        <G {...p}>
          <G transform="rotate(-28 46 52)">
            <Rect x="26" y="40" width="40" height="22" rx="11" fill={f} />
            <Path d="M46 40 V62" />
          </G>
          <Circle cx="82" cy="74" r="16" fill={f} />
          <Path d="M72 74 H92" />
          <Circle cx="42" cy="86" r="8" fill="#fff" />
        </G>
      )}
      {name === 'handover' && (
        <G {...p}>
          <Rect x="42" y="24" width="36" height="28" rx="4" fill={f} />
          <Path d="M60 32 V44 M54 38 H66" />
          <Path d="M18 74 C30 64 42 64 52 72 L64 72 C74 64 88 64 102 74" />
          <Path d="M18 88 H46 M74 88 H102" />
        </G>
      )}
      {name === 'shield' && (
        <G {...p}>
          <Path
            d="M60 18 L94 32 V60 C94 82 78 98 60 104 C42 98 26 82 26 60 V32 Z"
            fill={f}
          />
          <Path d="M46 60 L56 70 L76 48" strokeWidth={3} />
        </G>
      )}
    </Svg>
  );
}

/** Clinic-to-clinic corridor banner scene shown on the Home screen */
export function HomeCorridorScene() {
  const { colors } = useAppConfig();
  const c = colors.artStroke;
  const f = colors.artFill;
  const hl = colors.artHighlight;
  const p = {
    stroke: c,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
  return (
    <View style={{ width: '100%', height: 64, marginTop: 4 }}>
      <Svg width="100%" height="100%" viewBox="0 0 360 72">
        <Circle cx="108" cy="38" r="21" fill={hl} />
        <Circle cx="212" cy="38" r="21" fill={hl} />
        <G {...p}>
          {/* Ground & dashed corridor route */}
          <Path d="M8 62 H352" opacity={0.35} />
          <Path
            d="M64 56 Q 180 28 296 56"
            strokeDasharray="3, 5"
            opacity={0.55}
          />

          {/* Left clinic */}
          <Rect x="16" y="34" width="38" height="28" rx="3" fill={f} />
          <Path d="M12 36 L35 20 L58 36" />
          <Path d="M35 25 V33 M31 29 H39" />
          <Rect x="31" y="48" width="8" height="14" fill="#fff" />

          {/* Floating ORS sachet */}
          <G transform="translate(88,16)">
            <Rect x="0" y="0" width="28" height="36" rx="4" fill={f} />
            <Path d="M0 6 H28 M0 30 H28" />
            <Circle cx="14" cy="18" r="6" fill="#fff" />
            <Path d="M14 15 V21 M11 18 H17" />
          </G>

          {/* Center courier cyclist */}
          <G transform="translate(148,18)">
            <Circle cx="14" cy="36" r="8" fill={f} />
            <Circle cx="48" cy="36" r="8" fill={f} />
            <Path d="M14 36 L26 20 L42 20 L32 36 Z" />
            <Path d="M42 20 L48 36" />
            <Rect x="8" y="12" width="12" height="8" rx="2" fill={f} />
            <Circle cx="34" cy="6" r="4.5" fill={f} />
            <Path d="M31 12 L26 20 M35 12 L42 17" />
          </G>

          {/* Floating tablet & capsule */}
          <G transform="translate(232,18)">
            <Circle cx="12" cy="12" r="9" fill={f} />
            <Path d="M6 12 H18" />
            <Circle cx="30" cy="26" r="6" fill="#fff" />
            <Path d="M26 26 H34" />
          </G>

          {/* Right clinic */}
          <Rect x="306" y="34" width="38" height="28" rx="3" fill={f} />
          <Path d="M302 36 L325 20 L348 36" />
          <Path d="M325 25 V33 M321 29 H329" />
          <Rect x="321" y="48" width="8" height="14" fill="#fff" />
        </G>
      </Svg>
    </View>
  );
}
