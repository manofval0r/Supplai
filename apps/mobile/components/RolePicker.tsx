import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ui, useAppConfig } from '../lib/theme';
import { Stage3D } from './Stage3D';
import { Art, HomeCorridorScene } from './LineArt';
import { Press, ScreenBackdrop, PinIcon, ChevronRightIcon } from './ui';
import { FloatingDock, type DockTab } from './FloatingDock';

export type AppMode =
  | 'home'
  | 'request'
  | 'release'
  | 'rider'
  | 'handover'
  | 'activity'
  | 'account'
  | 'saved-places';

export function RolePicker({
  onSelectMode,
  onSelectTab,
}: {
  onSelectMode: (mode: AppMode) => void;
  onSelectTab: (tab: DockTab) => void;
}) {
  const { colors, activeDelivery, savedPlace } = useAppConfig();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenBackdrop
        spots={[
          {
            art: 'sachet',
            top: 8,
            right: -18,
            size: 112,
            rotate: 12,
            withHighlight: true,
          },
          { art: 'pills', top: 310, left: -24, size: 100, rotate: -14 },
          {
            art: 'route',
            bottom: 130,
            right: -18,
            size: 108,
            rotate: -6,
            withHighlight: true,
          },
        ]}
      />

      <View style={styles.body}>
        <Text
          style={[styles.heroHeadline, { color: colors.ink }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Medicine, moved in minutes.{'\u00A0'}
        </Text>

        {savedPlace ? (
          <Press
            onPress={() => onSelectMode('saved-places')}
            scaleTo={0.98}
            style={[styles.placeChip, { backgroundColor: colors.tile }]}
          >
            <View style={[styles.placePin, { backgroundColor: colors.lime }]}>
              <PinIcon color={colors.limeInk} size={14} />
            </View>
            <Text
              style={[styles.placeText, { color: colors.mute }]}
              numberOfLines={1}
            >
              Delivering to{' '}
              <Text style={[styles.placeBold, { color: colors.ink }]}>
                {savedPlace}
              </Text>
            </Text>
            <ChevronRightIcon color={colors.mute} />
          </Press>
        ) : null}

        {/* Bento Grid */}
        <View style={styles.bento}>
          <View style={styles.bentoRow}>
            {/* Tile 1: Request stock */}
            <Press
              onPress={() => onSelectMode('request')}
              style={[styles.tileLg, { backgroundColor: colors.tile }]}
            >
              <View>
                <Text style={[styles.tileTitle, { color: colors.ink }]}>
                  Request stock{'\u00A0'}
                </Text>
                <Text style={[styles.tileSub, { color: colors.mute }]}>
                  Nearest clinic is 7 min away
                </Text>
              </View>
              <View style={styles.miniCanvasLg} pointerEvents="none">
                <Stage3D
                  kind="mini-req"
                  width={106}
                  height={98}
                  interactive={false}
                />
              </View>
            </Press>

            {/* Tile 2: Release surplus */}
            <Press
              onPress={() => onSelectMode('release')}
              style={[styles.tileLg, { backgroundColor: colors.tile }]}
            >
              <View>
                <Text style={[styles.tileTitle, { color: colors.ink }]}>
                  Release surplus{'\u00A0'}
                </Text>
                <Text style={[styles.tileSub, { color: colors.mute }]}>
                  Send what you can spare
                </Text>
              </View>
              <View style={styles.miniCanvasLg} pointerEvents="none">
                <Stage3D
                  kind="mini-rel"
                  width={106}
                  height={98}
                  interactive={false}
                />
              </View>
            </Press>
          </View>

          {/* Tile 3: Conditional Track Delivery / Idle Tile */}
          {activeDelivery ? (
            <Press
              onPress={() => onSelectMode('rider')}
              style={[styles.tileWide, { backgroundColor: colors.heroTileBg }]}
            >
              <View style={styles.tileWideCopy}>
                <Text style={[styles.tileTitle, { color: '#ffffff' }]}>
                  Track delivery{'\u00A0'}
                </Text>
                <Text
                  style={[
                    styles.tileSub,
                    { color: colors.heroSubColor, maxWidth: '100%' },
                  ]}
                  numberOfLines={1}
                >
                  Zinc 20 mg,{' '}
                  <Text
                    style={{
                      color: colors.lime,
                      fontFamily: ui.font.bold,
                    }}
                  >
                    4 min away{'\u00A0'}
                  </Text>
                </Text>
              </View>
              <View style={styles.miniCanvasWide} pointerEvents="none">
                <Stage3D
                  kind="mini-trk"
                  width={96}
                  height={88}
                  interactive={false}
                />
              </View>
            </Press>
          ) : (
            <View
              style={[
                styles.tileIdle,
                {
                  borderColor: colors.line,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.tileTitle, { color: colors.ink }]}>
                  No delivery on the way{'\u00A0'}
                </Text>
                <Text style={[styles.tileSub, { color: colors.mute }]}>
                  Orders you place show up here
                </Text>
              </View>
              <View style={{ opacity: 0.45 }}>
                <Art name="cyclist" size={44} />
              </View>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <HomeCorridorScene />
      </View>

      <FloatingDock activeTab="home" onSelectTab={onSelectTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  body: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 2,
  },
  heroHeadline: {
    fontFamily: ui.font.bold,
    fontSize: 22.5,
    letterSpacing: -0.7,
    lineHeight: 28,
    marginBottom: 14,
    paddingRight: 4,
  },
  placeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 16,
    maxWidth: '100%',
  },
  placePin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeText: {
    fontFamily: ui.font.medium,
    fontSize: 13,
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  placeBold: {
    fontFamily: ui.font.bold,
  },
  bento: {
    gap: 12,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tileLg: {
    flex: 1,
    height: 176,
    borderRadius: 24,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  tileTitle: {
    fontFamily: ui.font.bold,
    fontSize: 17,
    letterSpacing: -0.35,
    lineHeight: 20,
    paddingRight: 2,
  },
  tileSub: {
    fontFamily: ui.font.medium,
    fontSize: 12.5,
    lineHeight: 16,
    marginTop: 4,
    maxWidth: 132,
  },
  miniCanvasLg: {
    position: 'absolute',
    right: -4,
    bottom: -6,
    width: 106,
    height: 98,
  },
  tileWide: {
    width: '100%',
    height: 104,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  tileWideCopy: {
    flex: 1,
    paddingRight: 96,
  },
  miniCanvasWide: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 96,
    height: 88,
  },
  tileIdle: {
    width: '100%',
    height: 84,
    borderRadius: 24,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
});
