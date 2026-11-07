import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { supplaiApi, type OrderDetail } from '../lib/api';
import {
  registerForRemoteNotificationsAsync,
  scheduleCriticalAlert,
} from '../lib/notifications';
import { ui, useAppConfig } from '../lib/theme';
import { OsmMap } from '../components/OsmMap';
import { Press, ChevronLeftIcon, PhoneIcon, ChatIcon } from '../components/ui';

export function RiderScreen({
  riderName = 'Ade Okafor',
  onSwitchRole,
  onOpenHandover,
}: {
  riderName?: string;
  onSwitchRole?: () => void;
  onOpenHandover?: () => void;
}) {
  const { colors, isDark, savedPlace, courierSpeed, simCommodity, s } =
    useAppConfig();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [progress, setProgress] = useState<number>(0.45);

  const fetchOrder = useCallback(async (ref: string) => {
    try {
      const data = await supplaiApi.getOrder(ref);
      setOrder(data);
    } catch {
      // Fallback to demo values if offline
    }
  }, []);

  useEffect(() => {
    void registerForRemoteNotificationsAsync();
    void fetchOrder('REQ-0001');
  }, [fetchOrder]);

  const advanceCourierState = async () => {
    if (order?.reference) {
      try {
        const nextAction = order.allowedActions.includes('mark_picked_up')
          ? 'mark_picked_up'
          : order.allowedActions.includes('mark_in_transit')
            ? 'mark_in_transit'
            : null;
        if (nextAction) {
          const payload: Record<string, unknown> = {
            action: nextAction,
            actorPhone: '+2348010000003',
          };
          if (nextAction === 'mark_picked_up') payload.riderName = riderName;
          const res = await supplaiApi.actOnOrder(order.reference, payload);
          if (res.accepted) {
            await fetchOrder(order.reference);
            await scheduleCriticalAlert({
              title:
                nextAction === 'mark_picked_up'
                  ? 'Pickup recorded'
                  : 'Transfer in transit',
              body: `Courier ${riderName} updated order ${order.reference}.`,
              data: { reference: order.reference },
            });
            return;
          }
        }
      } catch {
        // Proceed to handover screen
      }
    }
    onOpenHandover?.();
  };

  const originName = order?.sourceFacility ?? 'Demo PHC B';
  const destName =
    savedPlace || order?.requestingFacility || 'Aiyetoro Central';
  const cargoLabel = order
    ? `Delivering ${order.quantity} ${
        order.commodity === 'ors' ? 'ORS sachets' : 'zinc blisters'
      }`
    : `Delivering 20 ${simCommodity}`;

  const distKm = ((1 - progress) * 2.8).toFixed(2);
  const etaMin = Math.max(
    1,
    Math.ceil(((1 - progress) * 7) / Math.max(0.5, courierSpeed)),
  );
  const speedKmh = Math.round(34 * courierSpeed);
  const pct = Math.max(8, Math.min(100, Math.round(progress * 100)));
  const initials = riderName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isDark ? '#0b0e15' : '#e8ecf2' },
      ]}
    >
      {/* Full-Screen OpenStreetMap with Live Interpolated Courier */}
      <OsmMap
        origin={originName}
        dest={destName}
        moving
        topPad={150}
        bottomPad={290}
        onProgress={(u) => {
          if (Number.isFinite(u)) setProgress(u);
        }}
      />

      {/* Top Translucent Glass Navigation Capsule */}
      <View
        style={[
          styles.hud,
          {
            backgroundColor: isDark
              ? 'rgba(13, 16, 24, 0.92)'
              : 'rgba(255, 255, 255, 0.92)',
          },
        ]}
      >
        <Press
          onPress={onSwitchRole}
          style={[
            styles.backBtn,
            { backgroundColor: isDark ? colors.tile : '#ffffff' },
          ]}
        >
          <ChevronLeftIcon />
        </Press>
        <View style={{ flex: 1 }}>
          <Text style={[styles.hudTitle, { color: colors.ink }]}>
            To {destName}
          </Text>
          <Text style={[styles.hudSub, { color: colors.mute }]}>
            {cargoLabel}
          </Text>
        </View>
      </View>

      {/* Bottom Floating Sheet */}
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={[styles.grab, { backgroundColor: colors.line }]} />

        <View style={styles.etaRow}>
          <View style={styles.etaLeft}>
            <Text
              style={[
                styles.etaBig,
                { color: colors.ink, fontSize: s(44), lineHeight: s(48) },
              ]}
            >
              {etaMin}
            </Text>
            <Text
              style={[styles.etaUnit, { color: colors.ink, fontSize: s(20) }]}
            >
              min
            </Text>
          </View>
          <View style={styles.etaRight}>
            <Text
              style={[styles.distBold, { color: colors.ink, fontSize: s(15) }]}
            >
              {distKm} km
            </Text>
            <Text style={[styles.speedSub, { color: colors.mute }]}>
              {speedKmh} km/h
            </Text>
          </View>
        </View>

        <View style={[styles.barTrack, { backgroundColor: colors.line }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${pct}%`,
                backgroundColor: isDark ? colors.lime : colors.cobalt,
              },
            ]}
          />
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.mute }]}>
            Picked up{' '}
            <Text style={[styles.metaBold, { color: colors.ink }]}>09:34</Text>
          </Text>
          <Text style={[styles.metaText, { color: colors.mute }]}>
            Arrives{' '}
            <Text style={[styles.metaBold, { color: colors.ink }]}>09:41</Text>
          </Text>
        </View>

        <Press
          onPress={() => {
            void advanceCourierState();
          }}
          style={[styles.courRow, { borderTopColor: colors.line }]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.cobalt }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.courName, { color: colors.ink }]}>
              {riderName}
            </Text>
            <Text style={[styles.courSub, { color: colors.mute }]}>
              Courier, Honda CG 125
            </Text>
          </View>
          <View style={styles.actGroup}>
            <Press
              onPress={onOpenHandover}
              style={[styles.actCircle, { backgroundColor: colors.tile }]}
            >
              <PhoneIcon />
            </Press>
            <Press
              onPress={onOpenHandover}
              style={[styles.actCircle, { backgroundColor: colors.tile }]}
            >
              <ChatIcon />
            </Press>
          </View>
        </Press>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  hud: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
    paddingRight: 20,
    shadowColor: '#030407',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#030407',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  hudTitle: {
    fontFamily: ui.font.semi,
    fontSize: 15,
    letterSpacing: -0.2,
    paddingRight: 2,
  },
  hudSub: {
    fontFamily: ui.font.regular,
    fontSize: 12.5,
    marginTop: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 28,
    shadowColor: '#030407',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 12,
  },
  grab: {
    width: 38,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  etaLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  etaBig: {
    fontFamily: ui.font.bold,
    fontSize: 44,
    letterSpacing: -1.6,
    lineHeight: 48,
    paddingRight: 4,
  },
  etaUnit: {
    fontFamily: ui.font.semi,
    fontSize: 20,
    letterSpacing: -0.3,
    marginLeft: 4,
    paddingRight: 2,
  },
  etaRight: {
    alignItems: 'flex-end',
  },
  distBold: {
    fontFamily: ui.font.semi,
    fontSize: 15,
    paddingRight: 2,
  },
  speedSub: {
    fontFamily: ui.font.regular,
    fontSize: 13.5,
    marginTop: 2,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 18,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metaText: {
    fontFamily: ui.font.regular,
    fontSize: 13.5,
  },
  metaBold: {
    fontFamily: ui.font.semi,
  },
  courRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: ui.font.semi,
    fontSize: 16,
    color: '#ffffff',
  },
  courName: {
    fontFamily: ui.font.semi,
    fontSize: 16,
    letterSpacing: -0.2,
    paddingRight: 2,
  },
  courSub: {
    fontFamily: ui.font.regular,
    fontSize: 13.5,
    marginTop: 2,
  },
  actGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  actCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
