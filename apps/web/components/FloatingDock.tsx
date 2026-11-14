import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { ui, useAppConfig } from '../lib/theme';
import { HomeIcon, ActivityIcon, UserIcon } from './ui';

export type DockTab = 'home' | 'activity' | 'account';

const TABS: { key: DockTab; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'activity', label: 'Activity' },
  { key: 'account', label: 'Account' },
];

export function FloatingDock({
  activeTab,
  onSelectTab,
}: {
  activeTab: DockTab;
  onSelectTab: (tab: DockTab) => void;
}) {
  const { colors, reduceMotion, s } = useAppConfig();
  const [innerWidth, setInnerWidth] = useState(0);
  const activeIdx = Math.max(
    0,
    TABS.findIndex((t) => t.key === activeTab),
  );
  const animIndex = useRef(new Animated.Value(activeIdx)).current;
  const tabScaleRefs = useRef(TABS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    if (reduceMotion) {
      animIndex.setValue(activeIdx);
    } else {
      Animated.spring(animIndex, {
        useNativeDriver: false,
        toValue: activeIdx,
        stiffness: 240,
        damping: 22,
        mass: 0.75,
      }).start();
    }
  }, [activeIdx, animIndex, reduceMotion]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - 12; // 6px padding left + right
    if (w > 0) setInnerWidth(w);
  };

  const tabWidth = innerWidth > 0 ? innerWidth / 3 : 0;
  const translateX =
    tabWidth > 0
      ? animIndex.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [0, tabWidth, tabWidth * 2],
        })
      : 0;

  return (
    <View
      nativeID="web-dock-wrap"
      style={[styles.dockWrap, { backgroundColor: colors.bg }]}
    >
      <View
        nativeID="web-dock"
        onLayout={handleLayout}
        style={[
          styles.dock,
          {
            height: s(58),
            borderRadius: s(29),
            backgroundColor: colors.dockBg,
            borderColor: colors.dockBorder,
          },
        ]}
      >
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              {
                width: tabWidth,
                borderRadius: s(23),
                backgroundColor: colors.dockActiveBg,
                transform: [{ translateX }],
              },
            ]}
          />
        )}
        {TABS.map((tab, idx) => {
          const isActive = tab.key === activeTab;
          const iconColor = isActive ? colors.dockActiveInk : colors.mute;
          const scale = tabScaleRefs[idx];

          const onPressIn = () => {
            Animated.spring(scale, {
              useNativeDriver: false,
              toValue: 0.93,
              speed: 50,
              bounciness: 4,
            }).start();
          };
          const onPressOut = () => {
            Animated.spring(scale, {
              useNativeDriver: false,
              toValue: 1,
              speed: 40,
              bounciness: 6,
            }).start();
          };

          return (
            <Pressable
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={styles.tabPressable}
            >
              <Animated.View
                style={[styles.tabInner, { transform: [{ scale }] }]}
              >
                {tab.key === 'home' && (
                  <HomeIcon color={iconColor} size={s(17)} />
                )}
                {tab.key === 'activity' && (
                  <ActivityIcon color={iconColor} size={s(17)} />
                )}
                {tab.key === 'account' && (
                  <UserIcon color={iconColor} size={s(17)} />
                )}
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      fontSize: s(13),
                      color: isActive ? colors.dockActiveInk : colors.mute,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrap: {
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  dock: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#030407',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
  pill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 6,
    borderRadius: 23,
    shadowColor: '#1558C9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  tabPressable: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  tabLabel: {
    fontFamily: ui.font.semi,
    fontSize: 13,
    letterSpacing: -0.15,
    paddingRight: 2,
  },
});
