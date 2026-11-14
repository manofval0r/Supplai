import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ui, useAppConfig } from '../lib/theme';
import { Art, type ArtName } from '../components/LineArt';
import { Press, ScreenBackdrop, SegmentedControl } from '../components/ui';
import { Stage3D } from '../components/Stage3D';

type ActivityFilter = 'all' | 'active' | 'done';

const HISTORY_ITEMS: {
  art: ArtName;
  title: string;
  sub: string;
  badge: string;
}[] = [
  {
    art: 'sachet',
    title: 'ORS 20.5 g, 20 sachets',
    sub: 'From Demo PHC B, yesterday',
    badge: 'Done',
  },
  {
    art: 'blister',
    title: 'Zinc 20 mg, 50 tablets',
    sub: 'Released to Ifo General, Tue',
    badge: 'Done',
  },
  {
    art: 'crate',
    title: 'ORS 20.5 g, 40 sachets',
    sub: 'From Ota LGA store, Oct 28',
    badge: 'Done',
  },
  {
    art: 'blister',
    title: 'Zinc 20 mg, 30 tablets',
    sub: 'From Papalanto PHC, Oct 21',
    badge: 'Done',
  },
];

export function ActivityScreen({
  onOpenLiveDelivery,
}: {
  onOpenLiveDelivery: () => void;
}) {
  const { colors, activeDelivery, simCommodity, simEtaMin, s } = useAppConfig();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const showActiveSection = filter === 'all' || filter === 'active';
  const showDoneSection = filter === 'all' || filter === 'done';

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenBackdrop
        spots={[
          {
            art: 'cyclist',
            top: 4,
            right: -14,
            size: 108,
            rotate: -6,
            withHighlight: true,
          },
          {
            art: 'crate',
            bottom: 80,
            left: -20,
            size: 104,
            rotate: 12,
          },
        ]}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[styles.pageTitle, { color: colors.ink, fontSize: s(28) }]}
        >
          Activity{'\u00A0'}
        </Text>

        {/* Stats Row */}
        <View style={styles.statRow}>
          <View style={[styles.statBox, { backgroundColor: colors.tile }]}>
            <Text
              style={[styles.statNum, { color: colors.ink, fontSize: s(26) }]}
            >
              12{'\u00A0'}
            </Text>
            <Text
              style={[styles.statLbl, { color: colors.mute, fontSize: s(12) }]}
            >
              Requests this month
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.tile }]}>
            <Text
              style={[styles.statNum, { color: colors.ink, fontSize: s(26) }]}
            >
              8{'\u00A0'}
            </Text>
            <Text
              style={[styles.statLbl, { color: colors.mute, fontSize: s(12) }]}
            >
              Released to others
            </Text>
          </View>
        </View>

        {/* Segmented Control */}
        <View style={{ marginBottom: 14 }}>
          <SegmentedControl<ActivityFilter>
            options={[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'done', label: 'Done' },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </View>

        {/* Live Delivery Card */}
        {showActiveSection && (
          <View style={{ marginBottom: 18 }}>
            {activeDelivery ? (
              <Press
                onPress={onOpenLiveDelivery}
                style={[
                  styles.liveCard,
                  { backgroundColor: colors.heroTileBg },
                ]}
              >
                <View style={styles.liveCardTop}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={[styles.liveTitle, { fontSize: s(16) }]}>
                      Courier on the way{'\u00A0'}
                    </Text>
                    <Text style={[styles.liveSub, { fontSize: s(13) }]}>
                      {simCommodity}, Ade Okafor
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.liveEta,
                      { color: colors.lime, fontSize: s(22) },
                    ]}
                  >
                    {simEtaMin} min{'\u00A0'}
                  </Text>
                </View>
                <View style={styles.liveTrack}>
                  <View
                    style={[
                      styles.liveFill,
                      { backgroundColor: colors.lime, width: '64%' },
                    ]}
                  />
                </View>
                <View style={styles.liveMeta}>
                  <Text style={styles.liveMetaText}>Picked up 09:34</Text>
                  <Text style={styles.liveMetaText}>Arrives 09:41</Text>
                </View>
                <View style={styles.liveCanvas} pointerEvents="none">
                  <Stage3D
                    kind="mini-trk"
                    width={76}
                    height={70}
                    interactive={false}
                  />
                </View>
              </Press>
            ) : (
              <View style={[styles.idleCard, { borderColor: colors.line }]}>
                <Text style={[styles.idleText, { color: colors.mute }]}>
                  Nothing on the way right now
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Earlier Section */}
        {showDoneSection && (
          <View>
            <Text style={[styles.secLbl, { color: colors.mute }]}>EARLIER</Text>
            <View style={[styles.groupCard, { backgroundColor: colors.tile }]}>
              {HISTORY_ITEMS.map((item, idx) => (
                <View
                  key={item.title + idx}
                  style={[
                    styles.row,
                    idx > 0 && {
                      borderTopWidth: 1,
                      borderTopColor: colors.line,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.thumb,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.line,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.thumbDot,
                        { backgroundColor: colors.lime },
                      ]}
                    />
                    <Art name={item.art} size={28} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text
                      style={[
                        styles.rowTitle,
                        { color: colors.ink, fontSize: s(15) },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.rowSub,
                        { color: colors.mute, fontSize: s(12.5) },
                      ]}
                    >
                      {item.sub}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.doneBadge,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.line,
                      },
                    ]}
                  >
                    <Text style={[styles.doneBadgeText, { color: colors.ink }]}>
                      {item.badge}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Read-only LGA Oversight Summary (matches /lga contract) */}
        <View style={{ marginTop: 18 }}>
          <Text
            style={[styles.secLbl, { color: colors.mute, fontSize: s(11.5) }]}
          >
            LGA OVERSIGHT · DEMO DATA
          </Text>
          <View
            style={[
              styles.groupCard,
              { backgroundColor: colors.tile, padding: 16, gap: 6 },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.ink, fontSize: s(14.5) },
                ]}
              >
                SUP-409 · Ota Ward → Aiyetoro PHC
              </Text>
              <Text
                style={{
                  fontFamily: ui.font.bold,
                  fontSize: s(11),
                  color: colors.cobalt,
                }}
              >
                IN TRANSIT
              </Text>
            </View>
            <Text
              style={[styles.rowSub, { color: colors.mute, fontSize: s(12.5) }]}
            >
              Attention: Awaiting 4-digit receiver PIN &amp; tamper seal #7842
              verification.
            </Text>
            <Text
              style={[styles.rowSub, { color: colors.mute, fontSize: s(12.5) }]}
            >
              Next owner: Aiyetoro Central PHC Receiver · Safety floor (&gt;=20
              units) verified.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  pageTitle: {
    fontFamily: ui.font.bold,
    fontSize: 28,
    letterSpacing: -0.8,
    lineHeight: 33,
    marginBottom: 14,
    paddingRight: 4,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statNum: {
    fontFamily: ui.font.bold,
    fontSize: 26,
    letterSpacing: -0.8,
    lineHeight: 30,
    paddingRight: 2,
  },
  statLbl: {
    fontFamily: ui.font.medium,
    fontSize: 12,
    marginTop: 4,
  },
  liveCard: {
    borderRadius: 22,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  liveCanvas: {
    position: 'absolute',
    right: 4,
    bottom: -6,
    width: 76,
    height: 70,
    opacity: 0.85,
  },
  liveCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveTitle: {
    fontFamily: ui.font.bold,
    fontSize: 16,
    color: '#ffffff',
    paddingRight: 2,
  },
  liveSub: {
    fontFamily: ui.font.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 2,
  },
  liveEta: {
    fontFamily: ui.font.bold,
    fontSize: 22,
    letterSpacing: -0.6,
    paddingRight: 2,
  },
  liveTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginTop: 14,
    overflow: 'hidden',
  },
  liveFill: {
    height: '100%',
    borderRadius: 3,
  },
  liveMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  liveMetaText: {
    fontFamily: ui.font.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  idleCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  idleText: {
    fontFamily: ui.font.medium,
    fontSize: 13.5,
  },
  secLbl: {
    fontFamily: ui.font.bold,
    fontSize: 12,
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  groupCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowCopy: {
    flex: 1,
    margin: 2,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    right: 4,
    top: 4,
  },
  rowTitle: {
    fontFamily: ui.font.semi,
    fontSize: 15,
    letterSpacing: -0.2,
    paddingRight: 2,
  },
  rowSub: {
    fontFamily: ui.font.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  doneBadge: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  doneBadgeText: {
    fontFamily: ui.font.bold,
    fontSize: 11.5,
    paddingRight: 1,
  },
});
