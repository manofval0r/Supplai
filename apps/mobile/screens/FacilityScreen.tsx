import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Animated,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';

import { supplaiApi, type OrderDetail } from '../lib/api';
import {
  registerForRemoteNotificationsAsync,
  scheduleCriticalAlert,
} from '../lib/notifications';
import { ui, useAppConfig } from '../lib/theme';
import { Stage3D } from '../components/Stage3D';
import {
  ScreenBackdrop,
  Press,
  Button,
  KV,
  SegmentedControl,
  ChevronLeftIcon,
  PinIcon,
  CheckIcon,
} from '../components/ui';

const DRUGS = {
  ors: {
    short: 'ORS, 20.5 g',
    name: 'Oral Rehydration Salts',
    unit: 'sachets',
    step: 10,
    stock: 80,
    OrderName: 'ORS sachets',
  },
  zinc: {
    short: 'Zinc, 20 mg',
    name: 'Zinc Sulfate 20 mg',
    unit: 'tablets',
    step: 10,
    stock: 120,
    OrderName: 'Zinc tablets',
  },
} as const;

export function FacilityScreen({
  facilityName = 'Aiyetoro Central',
  mode = 'request',
  onSwitchRole,
  onOpenRider,
}: {
  facilityName?: string;
  mode?: 'request' | 'release' | 'handover';
  onSwitchRole?: () => void;
  onOpenRider?: () => void;
}) {
  const {
    colors,
    isDark,
    haptics,
    savedPlace,
    expectedPin,
    requireCode,
    simOrsStock,
    simZincStock,
    s,
  } = useAppConfig();
  const activeFacility = savedPlace || facilityName;

  const [drug, setDrug] = useState<'ors' | 'zinc'>('ors');
  const [reqQty, setReqQty] = useState<number>(20);
  const [relQty, setRelQty] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);

  // Sub-step states
  const [requestSent, setRequestSent] = useState(false);
  const [releaseDone, setReleaseDone] = useState(false);

  // Native Keyboard Handover PIN state & micro-interaction animations
  const [pin, setPin] = useState('');
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);
  const [pinState, setPinState] = useState<'idle' | 'error' | 'ok'>('idle');
  const [handoverConfirmed, setHandoverConfirmed] = useState(false);
  const [okSlots, setOkSlots] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  const pinInputRef = useRef<{ focus: () => void } | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slotScales = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;
  const rowShake = useRef(new Animated.Value(0)).current;
  const rowConvergeScale = useRef(new Animated.Value(1)).current;
  const rowConvergeOpacity = useRef(new Animated.Value(1)).current;
  const confirmedCardScale = useRef(new Animated.Value(0.88)).current;
  const confirmedCardOpacity = useRef(new Animated.Value(0)).current;

  const [activeOrder, setActiveOrder] = useState<OrderDetail | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const ord = await supplaiApi.getOrder('REQ-0001');
      setActiveOrder(ord);
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    void registerForRemoteNotificationsAsync();
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (handoverConfirmed) {
      confirmedCardScale.setValue(0.92);
      confirmedCardOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(confirmedCardScale, {
          toValue: 1,
          useNativeDriver: true,
          stiffness: 240,
          damping: 18,
        }),
        Animated.timing(confirmedCardOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [handoverConfirmed, confirmedCardOpacity, confirmedCardScale]);

  useEffect(() => {
    setRequestSent(false);
    setReleaseDone(false);
    setPin('');
    setRevealedIndex(null);
    setPinState('idle');
    setHandoverConfirmed(false);
    setOkSlots([false, false, false, false]);
    rowConvergeScale.setValue(1);
    rowConvergeOpacity.setValue(1);
  }, [mode, rowConvergeOpacity, rowConvergeScale]);

  const d = DRUGS[drug];

  const handleCreateRequest = async () => {
    setSubmitting(true);
    try {
      const created = await supplaiApi.createRequest({
        facilityPhone: '+2348010000001',
        commodity: drug,
        quantity: reqQty,
      });
      await scheduleCriticalAlert({
        title: 'Request sent',
        body: `Order ${created.requestReference ?? 'REQ-0001'}: ${reqQty} ${d.OrderName} from Demo PHC B.`,
        data: { reference: created.requestReference ?? 'REQ-0001' },
      });
      await loadOrders();
    } catch {
      // Proceed in demo mode even if API already has active seed
    } finally {
      setSubmitting(false);
      setRequestSent(true);
    }
  };

  const handlePublishSurplus = async () => {
    setSubmitting(true);
    try {
      await supplaiApi.actOnOrder('REQ-0001', {
        action: 'release_surplus',
        actorPhone: '+2348010000002',
      });
      await scheduleCriticalAlert({
        title: 'Listed for nearby clinics',
        body: `${relQty} ${d.unit} of ${d.name} made available.`,
      });
    } catch {
      // Proceed in demo mode
    } finally {
      setSubmitting(false);
      setReleaseDone(true);
    }
  };

  const triggerConfirmedTransition = useCallback(
    async (enteredPin: string) => {
      if (haptics) Vibration.vibrate([0, 20, 40, 30]);
      setPinState('ok');

      // Staggered Acid Lime slot wave
      [0, 1, 2, 3].forEach((idx) => {
        setTimeout(() => {
          setOkSlots((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
          Animated.sequence([
            Animated.spring(slotScales[idx], {
              toValue: 1.1,
              useNativeDriver: true,
              speed: 50,
              bounciness: 10,
            }),
            Animated.spring(slotScales[idx], {
              toValue: 1,
              useNativeDriver: true,
              speed: 40,
              bounciness: 6,
            }),
          ]).start();
        }, idx * 65);
      });

      const ref = activeOrder?.reference ?? 'REQ-0001';
      try {
        await supplaiApi.actOnOrder(ref, {
          action: 'confirm_delivery',
          handoverCode: enteredPin,
          actorPhone: '+2348010000001',
        });
      } catch {
        // Offline / demo fallback
      }
      await scheduleCriticalAlert({
        title: 'Custody transferred',
        body: `20 ORS sachets added to ${activeFacility}.`,
        data: { reference: ref },
      });

      // Converge slots & morph into Custody Transferred screen
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(rowConvergeScale, {
            toValue: 0.86,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(rowConvergeOpacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Keyboard.dismiss();
          setHandoverConfirmed(true);
        });
      }, 420);
    },
    [
      activeFacility,
      activeOrder?.reference,
      confirmedCardOpacity,
      confirmedCardScale,
      haptics,
      rowConvergeOpacity,
      rowConvergeScale,
      slotScales,
    ],
  );

  const triggerErrorShake = useCallback(() => {
    if (haptics) Vibration.vibrate([0, 35, 50, 35]);
    setPinState('error');
    Animated.sequence([
      Animated.timing(rowShake, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(rowShake, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(rowShake, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(rowShake, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(rowShake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setPin('');
      setRevealedIndex(null);
      setPinState('idle');
    }, 520);
  }, [haptics, rowShake]);

  const handlePinChange = (raw: string) => {
    if (pinState === 'ok') return;
    const cleaned = raw.replace(/\D/g, '').slice(0, 4);
    const prevLen = pin.length;
    setPin(cleaned);

    if (cleaned.length > prevLen) {
      const idx = cleaned.length - 1;
      if (haptics) Vibration.vibrate(12);
      setRevealedIndex(idx);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      revealTimerRef.current = setTimeout(() => {
        setRevealedIndex(null);
      }, 260);

      Animated.sequence([
        Animated.spring(slotScales[idx], {
          toValue: 1.12,
          useNativeDriver: true,
          speed: 60,
          bounciness: 10,
        }),
        Animated.spring(slotScales[idx], {
          toValue: 1,
          useNativeDriver: true,
          speed: 45,
          bounciness: 6,
        }),
      ]).start();
    } else {
      setRevealedIndex(null);
      setPinState('idle');
    }

    if (cleaned.length === 4) {
      if (expectedPin === 'ANY' || cleaned === expectedPin) {
        void triggerConfirmedTransition(cleaned);
      } else {
        triggerErrorShake();
      }
    }
  };

  const runDemoAutoType = () => {
    if (pinState === 'ok') return;
    setPin('');
    setPinState('idle');
    setOkSlots([false, false, false, false]);
    const code = expectedPin === 'ANY' ? '5082' : expectedPin;
    [0, 1, 2, 3].forEach((i) => {
      setTimeout(() => {
        handlePinChange(code.slice(0, i + 1));
      }, i * 110);
    });
  };

  // 1. REQUEST SENT CONFIRMATION SCREEN
  if (mode === 'request' && requestSent) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <ScreenBackdrop
          spots={[
            {
              art: 'cyclist',
              top: 24,
              right: -12,
              size: 132,
              rotate: -6,
              withHighlight: true,
            },
            {
              art: 'clinic',
              bottom: 105,
              left: -18,
              size: 118,
              rotate: 6,
            },
            {
              art: 'sachet',
              bottom: 120,
              right: -18,
              size: 104,
              rotate: 16,
              withHighlight: true,
            },
          ]}
        />
        <View style={styles.topBar}>
          <Press
            onPress={() => setRequestSent(false)}
            style={[styles.backBtn, { backgroundColor: colors.tile }]}
          >
            <ChevronLeftIcon />
          </Press>
        </View>
        <View style={styles.confirmBody}>
          <View style={styles.confirmCenter}>
            <View
              style={[styles.checkCircle, { backgroundColor: colors.lime }]}
            >
              <CheckIcon size={28} color={colors.limeInk} />
            </View>
            <Text style={[styles.h1, { color: colors.ink }]}>
              Request sent{'\u00A0'}
            </Text>
            <Text style={[styles.subText, { color: colors.mute }]}>
              Ade Okafor is heading to Demo PHC B to pick up {reqQty} {d.unit}{' '}
              of {d.name}.
            </Text>

            <View style={[styles.timelineBox, { borderTopColor: colors.line }]}>
              {[
                [true, 'Demo PHC B accepted', 'Just now'],
                [
                  true,
                  'Courier assigned, Ade Okafor',
                  '1 min away from pickup',
                ],
                [false, `Arrives at ${activeFacility}`, 'About 7 min'],
              ].map(([done, title, sub], i) => (
                <View key={String(title)} style={styles.tlRow}>
                  <View style={styles.tlCol}>
                    <View
                      style={[
                        styles.tlDot,
                        done
                          ? { backgroundColor: colors.lime }
                          : {
                              backgroundColor: 'transparent',
                              borderWidth: 2,
                              borderColor: colors.mute,
                            },
                      ]}
                    >
                      {done ? (
                        <CheckIcon size={11} color={colors.limeInk} />
                      ) : null}
                    </View>
                    {i < 2 && (
                      <View
                        style={[
                          styles.tlLine,
                          {
                            backgroundColor: done ? colors.lime : colors.line,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.tlContent}>
                    <Text style={[styles.tlTitle, { color: colors.ink }]}>
                      {String(title)}
                    </Text>
                    <Text style={[styles.tlSub, { color: colors.mute }]}>
                      {String(sub)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Button onPress={onOpenRider}>Watch on map</Button>
        </View>
      </View>
    );
  }

  // 2. RELEASE CONFIRMED SCREEN
  if (mode === 'release' && releaseDone) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <ScreenBackdrop
          spots={[
            {
              art: 'crate',
              top: 28,
              right: -14,
              size: 128,
              rotate: 10,
              withHighlight: true,
            },
            {
              art: 'route',
              bottom: 110,
              left: -16,
              size: 118,
              rotate: -8,
            },
            {
              art: 'pills',
              bottom: 125,
              right: -14,
              size: 104,
              rotate: 14,
            },
          ]}
        />
        <View style={styles.topBar}>
          <Press
            onPress={() => setReleaseDone(false)}
            style={[styles.backBtn, { backgroundColor: colors.tile }]}
          >
            <ChevronLeftIcon />
          </Press>
        </View>
        <View style={styles.confirmBody}>
          <View style={styles.confirmCenter}>
            <View
              style={[styles.checkCircle, { backgroundColor: colors.lime }]}
            >
              <CheckIcon size={28} color={colors.limeInk} />
            </View>
            <Text style={[styles.h1, { color: colors.ink }]}>
              Listed for nearby clinics{'\u00A0'}
            </Text>
            <Text style={[styles.subText, { color: colors.mute }]}>
              {relQty} {d.unit} of {d.name} can now be requested. A courier will
              collect with seal 7842 when matched.
            </Text>
            <View style={{ marginTop: 28, width: '100%' }}>
              <KV
                rows={[
                  ['Item', `${relQty} ${d.unit}`],
                  ['Batch', 'B209, Exp 10/2027'],
                  ['Tamper seal', '7842'],
                  ['Visible to', '4 clinics within 5 km'],
                ]}
              />
            </View>
          </View>
          <Button variant="secondary" onPress={onSwitchRole}>
            Back to home
          </Button>
        </View>
      </View>
    );
  }

  // 3. HANDOVER CONFIRMED SCREEN
  if (mode === 'handover' && handoverConfirmed) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <ScreenBackdrop
          spots={[
            {
              art: 'handover',
              top: 24,
              right: -12,
              size: 128,
              rotate: -6,
              withHighlight: true,
            },
            {
              art: 'clinic',
              bottom: 110,
              left: -18,
              size: 118,
              rotate: 8,
            },
            {
              art: 'sachet',
              bottom: 120,
              right: -16,
              size: 102,
              rotate: 14,
            },
          ]}
        />
        <View style={styles.topBar}>
          <Press
            onPress={onSwitchRole}
            style={[styles.backBtn, { backgroundColor: colors.tile }]}
          >
            <ChevronLeftIcon />
          </Press>
        </View>
        <Animated.View
          style={[
            styles.confirmBody,
            {
              opacity: confirmedCardOpacity,
              transform: [{ scale: confirmedCardScale }],
            },
          ]}
        >
          <View style={styles.confirmCenter}>
            <View
              style={[styles.checkCircle, { backgroundColor: colors.lime }]}
            >
              <CheckIcon size={28} color={colors.limeInk} />
            </View>
            <Text style={[styles.h1, { color: colors.ink }]}>
              Custody transferred{'\u00A0'}
            </Text>
            <Text style={[styles.subText, { color: colors.mute }]}>
              20 ORS sachets added to {activeFacility}.
            </Text>
            <View style={{ marginTop: 28, width: '100%' }}>
              <KV
                rows={[
                  ['Reference', activeOrder?.reference ?? 'REQ-0001'],
                  ['Seal', '7842, intact'],
                  ['Signed by', 'Demo PHC A'],
                  ['Time', '09:41'],
                ]}
              />
            </View>
          </View>
          <Button variant="secondary" onPress={onSwitchRole}>
            Done
          </Button>
        </Animated.View>
      </View>
    );
  }

  // 4. HANDOVER PIN ENTRY SCREEN (NATIVE KEYBOARD + MICRO-INTERACTIONS)
  if (mode === 'handover') {
    const progressPct = (pin.length / 4) * 100;
    const displayPinHint = expectedPin === 'ANY' ? 'any 4 digits' : expectedPin;
    const statusText =
      pinState === 'ok'
        ? 'Code verified — transferring custody...'
        : pinState === 'error'
          ? `Wrong code — check courier's screen (${displayPinHint})`
          : pin.length === 0
            ? 'Tap slots to open your phone keyboard'
            : `${4 - pin.length} more digit${4 - pin.length === 1 ? '' : 's'}...`;

    const statusColor =
      pinState === 'ok'
        ? isDark
          ? colors.lime
          : colors.cobalt
        : pinState === 'error'
          ? colors.red
          : colors.mute;

    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <ScreenBackdrop
          spots={[
            {
              art: 'handover',
              top: 12,
              right: -14,
              size: 118,
              rotate: -6,
              withHighlight: true,
            },
            {
              art: 'crate',
              top: 230,
              left: -26,
              size: 102,
              rotate: 12,
            },
          ]}
        />
        <View style={styles.topBar}>
          <Press
            onPress={onOpenRider ?? onSwitchRole}
            style={[styles.backBtn, { backgroundColor: colors.tile }]}
          >
            <ChevronLeftIcon />
          </Press>
        </View>
        <View style={styles.handoverBody}>
          <Text style={[styles.h1, { color: colors.ink }]}>
            Confirm handover{'\u00A0'}
          </Text>
          <Text
            style={[styles.subText, { color: colors.mute, marginBottom: 16 }]}
          >
            Ask Ade Okafor for the 4-digit code on his phone. Check seal{' '}
            <Text style={{ color: colors.ink, fontFamily: ui.font.bold }}>
              7842
            </Text>{' '}
            before accepting.
          </Text>

          {/* Summary Card */}
          <View style={[styles.handoverCard, { backgroundColor: colors.tile }]}>
            <View style={styles.handoverCardTop}>
              <Text style={[styles.handoverItem, { color: colors.ink }]}>
                20 ORS sachets
              </Text>
              <View style={[styles.sealPill, { backgroundColor: colors.lime }]}>
                <Text style={[styles.sealPillText, { color: colors.limeInk }]}>
                  SEAL 7842
                </Text>
              </View>
            </View>
            <Text style={[styles.handoverFrom, { color: colors.mute }]}>
              From Demo PHC B, courier Ade Okafor
            </Text>
          </View>

          {/* 4 PIN Slots with overlaid native TextInput */}
          <Press
            onPress={() => {
              pinInputRef.current?.focus();
            }}
            scaleTo={1}
            style={styles.pinAreaWrap}
          >
            <Animated.View
              style={[
                styles.pinRow,
                {
                  opacity: rowConvergeOpacity,
                  transform: [
                    { translateX: rowShake },
                    { scale: rowConvergeScale },
                  ],
                },
              ]}
            >
              {[0, 1, 2, 3].map((i) => {
                const ch = pin[i];
                const isActive = i === pin.length && pinState === 'idle';
                const isFilled = Boolean(ch);
                const isOk = okSlots[i];
                const isErr = pinState === 'error';

                const borderColor = isOk
                  ? colors.lime
                  : isErr
                    ? colors.red
                    : isActive
                      ? colors.cobalt
                      : isFilled
                        ? colors.ink
                        : colors.line;

                const slotBg = isOk
                  ? colors.lime
                  : isActive
                    ? colors.surface
                    : colors.tile;

                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.pinSlot,
                      {
                        backgroundColor: slotBg,
                        borderColor,
                        transform: [{ scale: slotScales[i] }],
                      },
                    ]}
                  >
                    {isOk ? (
                      <CheckIcon size={22} color={colors.limeInk} />
                    ) : isFilled ? (
                      revealedIndex === i ? (
                        <Text style={[styles.pinDigit, { color: colors.ink }]}>
                          {ch}
                        </Text>
                      ) : (
                        <View
                          style={[
                            styles.pinDot,
                            {
                              backgroundColor: isErr ? colors.red : colors.ink,
                            },
                          ]}
                        />
                      )
                    ) : null}
                  </Animated.View>
                );
              })}
            </Animated.View>

            <TextInput
              ref={(el) => {
                pinInputRef.current = el;
              }}
              value={pin}
              onChangeText={handlePinChange}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              caretHidden
              contextMenuHidden
              style={styles.hiddenPinInput}
            />
          </Press>

          {/* Progress Bar under slots */}
          <View style={[styles.pinProgBar, { backgroundColor: colors.line }]}>
            <View
              style={[
                styles.pinProgFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor:
                    pin.length === 4 ? colors.lime : colors.cobalt,
                },
              ]}
            />
          </View>

          <Text style={[styles.pinStatus, { color: statusColor }]}>
            {statusText}
          </Text>

          <View style={styles.demoHelperWrap}>
            <Press
              onPress={runDemoAutoType}
              style={[styles.demoChip, { backgroundColor: colors.tile }]}
            >
              <Text style={[styles.demoChipText, { color: colors.ink }]}>
                Demo code:{' '}
                <Text style={{ fontFamily: ui.font.bold }}>
                  {expectedPin === 'ANY' ? 'ANY (5082)' : expectedPin}
                </Text>{' '}
                (tap to auto-enter)
              </Text>
            </Press>
            {!requireCode && (
              <View style={{ width: '100%', marginTop: 12 }}>
                <Button
                  variant="lime"
                  onPress={() => {
                    void triggerConfirmedTransition(
                      expectedPin === 'ANY' ? '5082' : expectedPin,
                    );
                  }}
                >
                  Confirm Handover (PIN Bypassed)
                </Button>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // 5. REQUEST STOCK & RELEASE SURPLUS SCREENS
  const isRequest = mode === 'request';
  const qty = isRequest ? reqQty : relQty;
  const setQty = isRequest ? setReqQty : setRelQty;
  const maxStock = drug === 'ors' ? simOrsStock : simZincStock;
  const pct = Math.min(100, Math.round((qty / maxStock) * 100));

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScreenBackdrop
        spots={
          isRequest
            ? [
                {
                  art: 'sachet',
                  top: 8,
                  right: -20,
                  size: 112,
                  rotate: 14,
                  withHighlight: true,
                },
                {
                  art: 'pills',
                  top: 230,
                  left: -26,
                  size: 98,
                  rotate: -18,
                },
                {
                  art: 'route',
                  bottom: 88,
                  right: -20,
                  size: 116,
                  rotate: -8,
                  withHighlight: true,
                },
                {
                  art: 'cyclist',
                  bottom: 92,
                  left: -22,
                  size: 102,
                  rotate: 6,
                },
              ]
            : [
                {
                  art: 'crate',
                  top: 8,
                  right: -18,
                  size: 114,
                  rotate: -10,
                  withHighlight: true,
                },
                {
                  art: 'blister',
                  top: 235,
                  left: -24,
                  size: 98,
                  rotate: 14,
                },
                {
                  art: 'cyclist',
                  bottom: 88,
                  right: -16,
                  size: 112,
                  rotate: -6,
                  withHighlight: true,
                },
                {
                  art: 'clinic',
                  bottom: 92,
                  left: -22,
                  size: 98,
                  rotate: 8,
                },
              ]
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Press
            onPress={onSwitchRole}
            style={[styles.backBtn, { backgroundColor: colors.tile }]}
          >
            <ChevronLeftIcon />
          </Press>
        </View>

        <Text style={[styles.h1, { color: colors.ink, fontSize: s(28) }]}>
          {isRequest ? 'Request stock\u00A0' : 'Release surplus\u00A0'}
        </Text>

        {/* Fluid Spring Segmented Control */}
        <View style={{ marginTop: isRequest ? 8 : 6 }}>
          <SegmentedControl<'ors' | 'zinc'>
            options={[
              { key: 'ors', label: DRUGS.ors.short },
              { key: 'zinc', label: DRUGS.zinc.short },
            ]}
            value={drug}
            onChange={setDrug}
            height={38}
          />
        </View>

        {/* Interactive 3D Stage */}
        <Stage3D
          kind={isRequest ? 'drug' : 'crate'}
          drug={drug}
          height={isRequest ? 190 : 185}
          style={{ marginTop: 4 }}
        />
        <Text style={[styles.stageHint, { color: colors.mute }]}>
          {isRequest
            ? 'Drag to inspect package'
            : 'Sealed crate with tamper tag 7842'}
        </Text>

        {/* Quantity & Details Card */}
        <View style={[styles.qtyCard, { backgroundColor: colors.tile }]}>
          <View style={styles.qtyRow}>
            <View style={styles.qtyLeft}>
              <Text style={[styles.qtyNum, { color: colors.ink }]}>
                {qty}
                {'\u00A0'}
              </Text>
              <Text style={[styles.qtyUnit, { color: colors.mute }]}>
                {d.unit}
              </Text>
            </View>
            <View style={styles.stepGroup}>
              <Press
                onPress={() => setQty(Math.max(d.step, qty - d.step))}
                style={[styles.stepBtn, { backgroundColor: colors.surface }]}
              >
                <Text style={[styles.stepBtnText, { color: colors.ink }]}>
                  −
                </Text>
              </Press>
              <Press
                onPress={() => setQty(Math.min(maxStock, qty + d.step))}
                style={[styles.stepBtn, { backgroundColor: colors.cobalt }]}
              >
                <Text style={[styles.stepBtnText, { color: '#ffffff' }]}>
                  +
                </Text>
              </Press>
            </View>
          </View>

          {isRequest ? (
            <>
              <View style={styles.stockWrap}>
                <View
                  style={[styles.stockBar, { backgroundColor: colors.line }]}
                >
                  <View
                    style={[
                      styles.stockFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: colors.lime,
                      },
                    ]}
                  />
                </View>
                <View style={styles.stockMeta}>
                  <Text style={[styles.stockMetaText, { color: colors.mute }]}>
                    Demo PHC B has{' '}
                    <Text style={[styles.stockMetaBold, { color: colors.ink }]}>
                      {maxStock}
                    </Text>
                  </Text>
                  <Text style={[styles.stockMetaText, { color: colors.mute }]}>
                    <Text style={[styles.stockMetaBold, { color: colors.ink }]}>
                      {maxStock - qty}
                    </Text>{' '}
                    left after
                  </Text>
                </View>
              </View>

              <View style={[styles.facRow, { borderTopColor: colors.line }]}>
                <View
                  style={[styles.facIcon, { backgroundColor: colors.lime }]}
                >
                  <PinIcon color={colors.limeInk} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.facTitle, { color: colors.ink }]}>
                    Demo PHC B
                  </Text>
                  <Text style={[styles.facSub, { color: colors.mute }]}>
                    1.8 km away, about 7 min by rider
                  </Text>
                </View>
                <View
                  style={[styles.etaBadge, { backgroundColor: colors.lime }]}
                >
                  <Text
                    style={[styles.etaBadgeText, { color: colors.limeInk }]}
                  >
                    7 MIN
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={{ marginTop: 14 }}>
              <KV
                rows={[
                  ['Batch', 'B209, Exp 10/2027'],
                  ['Storage', 'Ambient, dry'],
                  ['Pickup from', activeFacility],
                ]}
              />
            </View>
          )}
        </View>

        <View style={{ flex: 1, minHeight: 14 }} />

        <Button
          onPress={() => {
            void (isRequest ? handleCreateRequest() : handlePublishSurplus());
          }}
          disabled={submitting}
        >
          {isRequest ? 'Request from Demo PHC B' : 'Make available'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  topBar: {
    height: 48,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  h1: {
    fontFamily: ui.font.bold,
    fontSize: 28,
    letterSpacing: -0.8,
    lineHeight: 33,
    paddingRight: 4,
  },
  subText: {
    fontFamily: ui.font.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  seg: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnActive: {
    shadowColor: '#030407',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segText: {
    fontFamily: ui.font.semi,
    fontSize: 13.5,
    paddingRight: 2,
  },
  stageHint: {
    textAlign: 'center',
    fontFamily: ui.font.regular,
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
  },
  qtyCard: {
    borderRadius: 22,
    padding: 16,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  qtyNum: {
    fontFamily: ui.font.bold,
    fontSize: 44,
    letterSpacing: -1.8,
    lineHeight: 50,
    paddingRight: 4,
  },
  qtyUnit: {
    fontFamily: ui.font.medium,
    fontSize: 15,
    marginLeft: 4,
  },
  stepGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontFamily: ui.font.medium,
    fontSize: 22,
    lineHeight: 24,
  },
  stockWrap: {
    marginTop: 12,
  },
  stockBar: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  stockFill: {
    height: '100%',
    borderRadius: 4,
  },
  stockMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stockMetaText: {
    fontFamily: ui.font.regular,
    fontSize: 13,
  },
  stockMetaBold: {
    fontFamily: ui.font.bold,
  },
  facRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  facIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facTitle: {
    fontFamily: ui.font.semi,
    fontSize: 15,
    paddingRight: 2,
  },
  facSub: {
    fontFamily: ui.font.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  etaBadge: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  etaBadgeText: {
    fontFamily: ui.font.bold,
    fontSize: 11,
    letterSpacing: 0.3,
    paddingRight: 1,
  },
  confirmBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  confirmCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  checkCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timelineBox: {
    marginTop: 26,
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 18,
  },
  tlRow: {
    flexDirection: 'row',
    gap: 14,
  },
  tlCol: {
    alignItems: 'center',
    width: 18,
  },
  tlDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlLine: {
    width: 2,
    height: 30,
    marginVertical: 4,
  },
  tlContent: {
    paddingBottom: 14,
    flex: 1,
  },
  tlTitle: {
    fontFamily: ui.font.semi,
    fontSize: 15,
  },
  tlSub: {
    fontFamily: ui.font.regular,
    fontSize: 13,
    marginTop: 2,
  },
  handoverBody: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  handoverCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  handoverCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  handoverItem: {
    fontFamily: ui.font.bold,
    fontSize: 15.5,
    paddingRight: 2,
  },
  sealPill: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  sealPillText: {
    fontFamily: ui.font.bold,
    fontSize: 11,
    letterSpacing: 0.3,
    paddingRight: 1,
  },
  handoverFrom: {
    fontFamily: ui.font.regular,
    fontSize: 13,
    marginTop: 4,
  },
  pinAreaWrap: {
    position: 'relative',
    width: '100%',
  },
  pinRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pinSlot: {
    flex: 1,
    height: 68,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: {
    fontFamily: ui.font.bold,
    fontSize: 28,
    letterSpacing: -0.8,
  },
  pinDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
  },
  hiddenPinInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
    fontSize: 1,
  },
  pinProgBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  pinProgFill: {
    height: '100%',
    borderRadius: 2,
  },
  pinStatus: {
    textAlign: 'center',
    fontFamily: ui.font.semi,
    fontSize: 13,
    marginTop: 12,
    minHeight: 20,
  },
  demoHelperWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  demoChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  demoChipText: {
    fontFamily: ui.font.medium,
    fontSize: 13,
  },
});
