'use client';

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GlassNav } from '@zakisheriff/liquid-glass';
import { useAppConfig } from '../lib/theme';
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
  const { colors, isDark, s } = useAppConfig();
  const activeIdx = Math.max(
    0,
    TABS.findIndex((t) => t.key === activeTab),
  );
  const activeTint = isDark ? colors.lime : colors.cobalt;

  const items = TABS.map((tab) => {
    const iconColor = tab.key === activeTab ? activeTint : colors.mute;
    const icon =
      tab.key === 'home' ? (
        <HomeIcon color={iconColor} size={s(17)} />
      ) : tab.key === 'activity' ? (
        <ActivityIcon color={iconColor} size={s(17)} />
      ) : (
        <UserIcon color={iconColor} size={s(17)} />
      );
    return { label: tab.label, icon };
  });

  return (
    <View nativeID="web-dock-wrap" style={styles.dockWrap}>
      <div id="web-dock" style={{ width: '100%' }}>
        <GlassNav
          items={items}
          activeIndex={activeIdx}
          onChange={(idx) => {
            const next = TABS[idx];
            if (next) onSelectTab(next.key);
          }}
          intensity={6}
          aria-label="Primary navigation"
          style={{ width: '100%' }}
        />
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrap: {
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
  },
});
