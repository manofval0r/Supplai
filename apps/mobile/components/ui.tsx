import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { ui, useAppConfig } from '../lib/theme';
import { Art, type ArtName } from './LineArt';

export interface SpotConfig {
  art: ArtName;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size?: number;
  rotate?: number;
  opacity?: number;
  withHighlight?: boolean;
}

export function ScreenBackdrop({ spots }: { spots: SpotConfig[] }) {
  const { isDark, artScale } = useAppConfig();
  const baseOpacity = isDark ? 0.19 : 0.24;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {spots.map((sp, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: sp.top,
            bottom: sp.bottom,
            left: sp.left,
            right: sp.right,
            transform: [{ rotate: `${sp.rotate ?? 0}deg` }],
          }}
        >
          <Art
            name={sp.art}
            size={Math.round((sp.size ?? 100) * artScale)}
            opacity={sp.opacity ?? baseOpacity}
            withHighlight={sp.withHighlight}
          />
        </View>
      ))}
    </View>
  );
}

export function Press({
  children,
  onPress,
  disabled,
  style,
  scaleTo = 0.97,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const flat = StyleSheet.flatten(style) || {};

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{
        flex: flat.flex,
        width: flat.width,
        alignSelf: flat.alignSelf,
      }}
    >
      <Animated.View
        style={[
          style,
          flat.flex !== undefined ? { flex: undefined, width: '100%' } : null,
          { transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function Button({
  children,
  variant = 'primary',
  onPress,
  disabled,
  style,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'lime';
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, s } = useAppConfig();
  const isPrimary = variant === 'primary';
  const isLime = variant === 'lime';
  const bg = isLime ? colors.lime : isPrimary ? colors.cobalt : colors.tile;
  const fg = isLime ? colors.limeInk : isPrimary ? '#ffffff' : colors.ink;

  return (
    <Press
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        {
          height: s(54),
          borderRadius: s(16),
          backgroundColor: bg,
        },
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: fg, fontSize: s(16) }]}>
        {children}
      </Text>
    </Press>
  );
}

export function KV({ rows }: { rows: [string, React.ReactNode][] }) {
  const { colors, s } = useAppConfig();
  return (
    <View style={[styles.kvWrap, { borderColor: colors.line }]}>
      {rows.map(([k, v], i) => (
        <View
          key={k}
          style={[
            styles.kvRow,
            { paddingVertical: s(14) },
            i > 0 && { borderTopWidth: 1, borderTopColor: colors.line },
          ]}
        >
          <Text style={[styles.kvKey, { color: colors.mute, fontSize: s(15) }]}>
            {k}
          </Text>
          {typeof v === 'string' || typeof v === 'number' ? (
            <Text
              style={[styles.kvVal, { color: colors.ink, fontSize: s(15) }]}
            >
              {v}
            </Text>
          ) : (
            v
          )}
        </View>
      ))}
    </View>
  );
}

export function Toggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: (next: boolean) => void;
}) {
  const { colors, isDark, reduceMotion } = useAppConfig();
  const knobAnim = useRef(new Animated.Value(value ? 18 : 0)).current;

  useEffect(() => {
    const target = value ? 18 : 0;
    if (reduceMotion) {
      knobAnim.setValue(target);
    } else {
      Animated.spring(knobAnim, {
        toValue: target,
        useNativeDriver: true,
        stiffness: 280,
        damping: 22,
        mass: 0.7,
      }).start();
    }
  }, [value, knobAnim, reduceMotion]);

  const activeBg = isDark ? colors.lime : colors.cobalt;
  const inactiveBg = isDark ? '#252b3d' : '#d5dbe6';
  const knobColor = value && isDark ? colors.limeInk : '#ffffff';

  return (
    <Press
      onPress={() => onToggle(!value)}
      scaleTo={0.94}
      style={[
        styles.toggleTrack,
        { backgroundColor: value ? activeBg : inactiveBg },
      ]}
    >
      <Animated.View
        style={[
          styles.toggleKnob,
          {
            backgroundColor: knobColor,
            transform: [{ translateX: knobAnim }],
          },
        ]}
      />
    </Press>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'surface',
  height,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  variant?: 'surface' | 'accent';
  height?: number;
}) {
  const { colors, isDark, reduceMotion, s } = useAppConfig();
  const [innerWidth, setInnerWidth] = useState(0);
  const count = Math.max(1, options.length);
  const activeIdx = Math.max(
    0,
    options.findIndex((o) => o.key === value),
  );
  const animIndex = useRef(new Animated.Value(activeIdx)).current;

  useEffect(() => {
    if (reduceMotion) {
      animIndex.setValue(activeIdx);
    } else {
      Animated.spring(animIndex, {
        toValue: activeIdx,
        useNativeDriver: true,
        stiffness: 240,
        damping: 22,
        mass: 0.75,
      }).start();
    }
  }, [activeIdx, animIndex, reduceMotion]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - 8; // 4px padding left + right
    if (w > 0) setInnerWidth(w);
  };

  const tabWidth = innerWidth > 0 ? innerWidth / count : 0;
  const inputRange = options.map((_, i) => i);
  const outputRange = options.map((_, i) => i * tabWidth);

  const translateX =
    tabWidth > 0 && count > 1
      ? animIndex.interpolate({
          inputRange,
          outputRange,
        })
      : 0;

  const isAccent = variant === 'accent';
  const pillBg = isAccent
    ? isDark
      ? colors.lime
      : colors.cobalt
    : colors.surface;
  const activeTextColor = isAccent
    ? isDark
      ? colors.limeInk
      : '#ffffff'
    : colors.ink;
  const btnHeight = height ? s(height) : s(36);

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.segWrap,
        { backgroundColor: colors.tile, borderRadius: s(14) },
      ]}
    >
      {tabWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.segPill,
            {
              width: tabWidth,
              borderRadius: s(10),
              backgroundColor: pillBg,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[styles.segBtn, { height: btnHeight }]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.segText,
                {
                  fontSize: s(13),
                  color: active ? activeTextColor : colors.mute,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Vector Icons (No emojis anywhere)
export function ChevronLeftIcon({ color }: { color?: string }) {
  const { colors } = useAppConfig();
  const c = color ?? colors.ink;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={c}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ color }: { color?: string }) {
  const { colors } = useAppConfig();
  const c = color ?? colors.mute;
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PlusIcon({ color }: { color?: string }) {
  const { colors } = useAppConfig();
  const c = color ?? colors.cobalt;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={c}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ArrowUpIcon({ color }: { color?: string }) {
  const { colors } = useAppConfig();
  const c = color ?? colors.cobalt;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 17V7m0 0L3 11m4-4l4 4M17 7v10m0 0l-4-4m4 4l4-4"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BikeIcon({ color }: { color?: string }) {
  const { colors } = useAppConfig();
  const c = color ?? colors.cobalt;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="17" r="3" stroke={c} strokeWidth={2} />
      <Circle cx="18" cy="17" r="3" stroke={c} strokeWidth={2} />
      <Path
        d="M9 17h6l-2-6H9l-3 6M13 11h4l2 3"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PinIcon({
  color,
  size = 20,
}: {
  color?: string;
  size?: number;
}) {
  const { colors } = useAppConfig();
  const c = color ?? colors.cobalt;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z"
        stroke={c}
        strokeWidth={2}
      />
      <Circle cx="12" cy="10" r="2.5" stroke={c} strokeWidth={2} />
    </Svg>
  );
}

export function PhoneIcon({ color }: { color?: string }) {
  const { colors } = useAppConfig();
  const c = color ?? colors.ink;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0122 16.9z"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChatIcon({ color }: { color?: string }) {
  const { colors } = useAppConfig();
  const c = color ?? colors.ink;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckIcon({
  size = 22,
  color = '#ffffff',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={color}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BackspaceIcon({ color }: { color?: string }) {
  const { colors } = useAppConfig();
  const c = color ?? colors.ink;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 6H9l-6 6 6 6h12a1 1 0 001-1V7a1 1 0 00-1-1zM17 10l-4 4m0-4l4 4"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HomeIcon({
  color,
  size = 18,
}: {
  color: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ActivityIcon({
  color,
  size = 18,
}: {
  color: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12h4l3-8 4 16 3-8h4"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function UserIcon({
  color,
  size = 18,
}: {
  color: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2.1} />
      <Path
        d="M4 20c1.8-3.8 5-6 8-6s6.2 2.2 8 6"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function GearIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={2} />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={c}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function CardIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="3"
        stroke={c}
        strokeWidth={2}
      />
      <Path d="M2 10h20" stroke={c} strokeWidth={2} />
    </Svg>
  );
}

export function HelpIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={2} />
      <Path
        d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ShieldIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l8 3.5v5.5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6.5L12 3z"
        stroke={c}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BellIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function VibrateIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect
        x="7"
        y="4"
        width="10"
        height="16"
        rx="2"
        stroke={c}
        strokeWidth={2}
      />
      <Path
        d="M3 8v8M21 8v8"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MotionIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={2} />
      <Path d="M8 12h8" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function GlobeIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={2} />
      <Path
        d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"
        stroke={c}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function SearchIcon({ color }: { color?: string }) {
  const { colors } = useAppConfig();
  const c = color ?? colors.mute;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={c} strokeWidth={2} />
      <Path
        d="M20 20l-3.5-3.5"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ClockIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={2} />
      <Path d="M12 7v5l3 2" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function FlagIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LockIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="11"
        width="16"
        height="10"
        rx="2"
        stroke={c}
        strokeWidth={2}
      />
      <Path
        d="M8 11V7a4 4 0 018 0v4"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function UsersIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke={c}
        strokeWidth={2}
      />
      <Circle cx="9" cy="7" r="4" stroke={c} strokeWidth={2} />
      <Path
        d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CodeIcon({ color }: { color?: string }) {
  const { colors, isDark } = useAppConfig();
  const c = color ?? (isDark ? colors.lime : colors.cobalt);
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 18l6-6-6-6M8 6l-6 6 6 6"
        stroke={c}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 18,
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnText: {
    fontFamily: ui.font.semi,
    fontSize: 16,
    letterSpacing: -0.2,
    paddingRight: 2,
  },
  kvWrap: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  kvKey: {
    fontFamily: ui.font.regular,
    fontSize: 15,
  },
  kvVal: {
    fontFamily: ui.font.semi,
    fontSize: 15,
    paddingRight: 2,
  },
  toggleTrack: {
    width: 46,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    shadowColor: '#030407',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2,
  },
  segWrap: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    alignItems: 'center',
  },
  segPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 10,
    shadowColor: '#030407',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  segBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segText: {
    fontFamily: ui.font.semi,
    fontSize: 13,
    paddingRight: 2,
  },
});
