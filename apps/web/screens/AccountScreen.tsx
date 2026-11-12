import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  designTokens,
  ui,
  useAppConfig,
  type ThemeColors,
  type ThemeMode,
} from '../lib/theme';
import { Art } from '../components/LineArt';
import {
  Press,
  ScreenBackdrop,
  SegmentedControl,
  Toggle,
  ChevronLeftIcon,
  ChevronRightIcon,
  GearIcon,
  CardIcon,
  PinIcon,
  HelpIcon,
  ShieldIcon,
  BikeIcon,
  BellIcon,
  VibrateIcon,
  MotionIcon,
  GlobeIcon,
  PlusIcon,
  CheckIcon,
  SearchIcon,
  ChatIcon,
  PhoneIcon,
  ClockIcon,
  FlagIcon,
  LockIcon,
  UsersIcon,
  CodeIcon,
} from '../components/ui';
import {
  resolveSupplaiAssistantQuery,
  defaultChatQuickPrompts,
  type ChatMessage,
  type ChatContextCard,
} from '@supplai/contracts';
import { type DockTab } from '../components/FloatingDock';
import { type AppMode } from '../components/RolePicker';
import { ScenarioLabRunner } from '../components/ScenarioLabRunner';

export type AccountSubView =
  | 'hub'
  | 'settings'
  | 'developer'
  | 'saved-places'
  | 'payment'
  | 'support'
  | 'safety'
  | 'chat';

export function AccountScreen({
  initialSubView = 'hub',
  onSelectTab,
  onOpenMode,
  onSubViewChange,
  onBackFromSavedPlacesToHome,
  onSignOut,
}: {
  initialSubView?: AccountSubView;
  onSelectTab: (tab: DockTab) => void;
  onOpenMode?: (mode: AppMode) => void;
  onSubViewChange?: (sub: AccountSubView) => void;
  onBackFromSavedPlacesToHome?: () => void;
  onSignOut?: () => void;
}) {
  const {
    colors,
    isDark,
    themeMode,
    setThemeMode,
    activeDelivery,
    setActiveDelivery,
    savedPlace,
    setSavedPlace,
    savedPlaces,
    addSavedPlace,
    walletBalance,
    setWalletBalance,
    deliveryAlerts,
    setDeliveryAlerts,
    haptics,
    setHaptics,
    reduceMotion,
    setReduceMotion,
    shareLga,
    setShareLga,
    requireCode,
    setRequireCode,
    uiScale,
    setUiScale,
    artScale,
    setArtScale,
    expectedPin,
    setExpectedPin,
    courierSpeed,
    setCourierSpeed,
    simCommodity,
    setSimCommodity,
    simEtaMin,
    setSimEtaMin,
    simOrsStock,
    setSimOrsStock,
    simZincStock,
    setSimZincStock,
    triggerSplash,
    resetDemoState,
    s,
  } = useAppConfig();

  const [subView, setSubView] = useState<AccountSubView>(initialSubView);
  const [supportQuery, setSupportQuery] = useState('');
  const [supportToast, setSupportToast] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      threadId: 'th-mob-0',
      role: 'assistant',
      content:
        'Hello! I am your Supplai Clinical & Logistics Assistant. Ask me about nearby clinic stock availability, WHO/NAFDAC medicine transport rules, tamper seals, or handover codes.',
      timestamp: new Date().toISOString(),
      quickPrompts: defaultChatQuickPrompts,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleMobileSend = (query: string) => {
    const text = query.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `m-usr-${Date.now()}`,
      threadId: 'th-mob-0',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    const res = resolveSupplaiAssistantQuery(text);
    const asstMsg: ChatMessage = {
      id: `m-ast-${Date.now()}`,
      threadId: 'th-mob-0',
      role: 'assistant',
      content: res.reply,
      timestamp: new Date().toISOString(),
      contextCard: res.contextCard,
      quickPrompts: defaultChatQuickPrompts,
    };
    setChatMessages((prev) => [...prev, userMsg, asstMsg]);
    setChatInput('');
  };

  const changeSubView = (next: AccountSubView) => {
    setSubView(next);
    onSubViewChange?.(next);
  };

  useEffect(() => {
    setSubView(initialSubView);
    onSubViewChange?.(initialSubView);
  }, [initialSubView, onSubViewChange]);

  const handleBack = () => {
    if (subView === 'saved-places' && onBackFromSavedPlacesToHome) {
      onBackFromSavedPlacesToHome();
      return;
    }
    if (subView === 'chat') {
      changeSubView('support');
      return;
    }
    changeSubView('hub');
  };

  const iconBoxBg = isDark ? 'rgba(255, 199, 0, 0.12)' : colors.cobaltSoft;

  // 1. SETTINGS SUB-SCREEN
  if (subView === 'settings') {
    return (
      <View
        nativeID="web-account-screen"
        style={[styles.screen, { backgroundColor: colors.bg }]}
      >
        <ScreenBackdrop
          spots={[
            {
              art: 'sachet',
              bottom: 24,
              right: -18,
              size: 112,
              rotate: 12,
              withHighlight: true,
            },
          ]}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.subScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Press
              onPress={handleBack}
              style={[styles.backBtn, { backgroundColor: colors.tile }]}
            >
              <ChevronLeftIcon />
            </Press>
          </View>
          <Text
            style={[styles.pageTitle, { color: colors.ink, fontSize: s(28) }]}
          >
            Settings{'\u00A0'}
          </Text>

          <Text style={[styles.secLbl, { color: colors.mute }]}>
            APPEARANCE
          </Text>
          <View style={{ marginBottom: 12 }}>
            <SegmentedControl<ThemeMode>
              options={[
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
                { key: 'system', label: 'System' },
              ]}
              value={themeMode}
              onChange={setThemeMode}
            />
          </View>

          {/* 3 Palette Swatches */}
          <View style={styles.swatchRow}>
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor: '#030407',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.14)',
                },
              ]}
            >
              <Text style={[styles.swatchName, { color: '#ffffff' }]}>
                Midnight{'\n'}Black
              </Text>
              <Text
                style={[styles.swatchHex, { color: 'rgba(255,255,255,0.75)' }]}
              >
                #030407
              </Text>
            </View>
            <View style={[styles.swatch, { backgroundColor: '#1558C9' }]}>
              <Text style={[styles.swatchName, { color: '#ffffff' }]}>
                Electric{'\n'}Cobalt
              </Text>
              <Text
                style={[styles.swatchHex, { color: 'rgba(255,255,255,0.82)' }]}
              >
                #1558C9
              </Text>
            </View>
            <View style={[styles.swatch, { backgroundColor: '#D4FF24' }]}>
              <Text style={[styles.swatchName, { color: '#030407' }]}>
                Acid{'\n'}Lime
              </Text>
              <Text style={[styles.swatchHex, { color: 'rgba(3,4,7,0.75)' }]}>
                #D4FF24
              </Text>
            </View>
          </View>

          <Text style={[styles.secLbl, { color: colors.mute }]}>
            PREFERENCES
          </Text>
          <View style={[styles.groupCard, { backgroundColor: colors.tile }]}>
            <View style={styles.row}>
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <BikeIcon color={isDark ? colors.lime : colors.cobalt} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Active delivery
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Show courier on Home & Activity
                </Text>
              </View>
              <Toggle value={activeDelivery} onToggle={setActiveDelivery} />
            </View>

            <View
              style={[
                styles.row,
                { borderTopWidth: 1, borderTopColor: colors.line },
              ]}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <BellIcon />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Delivery alerts
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Push when courier is 2 min away
                </Text>
              </View>
              <Toggle value={deliveryAlerts} onToggle={setDeliveryAlerts} />
            </View>

            <View
              style={[
                styles.row,
                { borderTopWidth: 1, borderTopColor: colors.line },
              ]}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <VibrateIcon />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Haptics
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Vibrate on PIN and confirmation
                </Text>
              </View>
              <Toggle value={haptics} onToggle={setHaptics} />
            </View>

            <View
              style={[
                styles.row,
                { borderTopWidth: 1, borderTopColor: colors.line },
              ]}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <MotionIcon />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Reduce motion
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Simpler transitions
                </Text>
              </View>
              <Toggle value={reduceMotion} onToggle={setReduceMotion} />
            </View>

            <View
              style={[
                styles.row,
                { borderTopWidth: 1, borderTopColor: colors.line },
              ]}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <GlobeIcon />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Language
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  English
                </Text>
              </View>
              <ChevronRightIcon />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 2. DEVELOPER & SIMULATION SUB-SCREEN
  if (subView === 'developer') {
    return (
      <View
        nativeID="web-account-screen"
        style={[styles.screen, { backgroundColor: colors.bg }]}
      >
        <ScreenBackdrop
          spots={[
            {
              art: 'crate',
              bottom: 24,
              right: -18,
              size: 112,
              rotate: -8,
              withHighlight: true,
            },
            {
              art: 'route',
              top: 48,
              right: -18,
              size: 104,
              rotate: 6,
            },
          ]}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.subScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Press
              onPress={handleBack}
              style={[styles.backBtn, { backgroundColor: colors.tile }]}
            >
              <ChevronLeftIcon />
            </Press>
          </View>
          <Text
            style={[styles.pageTitle, { color: colors.ink, fontSize: s(28) }]}
          >
            Developer menu{'\u00A0'}
          </Text>
          <Text style={[styles.leadSub, { color: colors.mute }]}>
            Configure simulations, test PIN handover, and customize UI & 2D art
            scale.
          </Text>

          <View
            style={[
              styles.groupCard,
              {
                backgroundColor: colors.tile,
                marginBottom: 18,
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 14,
              },
            ]}
          >
            {/* UI Element Size Scale */}
            <View>
              <View style={styles.devHeaderRow}>
                <Text
                  style={[
                    styles.rowTitle,
                    { color: colors.ink, fontSize: s(14.5) },
                  ]}
                >
                  Element & text size
                </Text>
                <Text style={[styles.devBadgeText, { color: colors.cobalt }]}>
                  {Math.round(uiScale * 100)}%
                </Text>
              </View>
              <Text
                style={[styles.rowSub, { color: colors.mute, marginBottom: 8 }]}
              >
                Scale cards, buttons, dock, and typography across the app
              </Text>
              <SegmentedControl<'0.92' | '1' | '1.1' | '1.18'>
                options={[
                  { key: '0.92', label: '0.92x' },
                  { key: '1', label: '1.0x' },
                  { key: '1.1', label: '1.1x' },
                  { key: '1.18', label: '1.18x' },
                ]}
                value={String(uiScale) as '0.92' | '1' | '1.1' | '1.18'}
                onChange={(v) => setUiScale(Number(v))}
              />
            </View>

            <View style={{ height: 1, backgroundColor: colors.line }} />

            {/* 2D Line Art & Corridor Scale */}
            <View>
              <View style={styles.devHeaderRow}>
                <Text
                  style={[
                    styles.rowTitle,
                    { color: colors.ink, fontSize: s(14.5) },
                  ]}
                >
                  2D line art & corridor scale
                </Text>
                <Text style={[styles.devBadgeText, { color: colors.cobalt }]}>
                  {artScale}x
                </Text>
              </View>
              <Text
                style={[styles.rowSub, { color: colors.mute, marginBottom: 8 }]}
              >
                Resize background medical illustrations and corridor scene
              </Text>
              <SegmentedControl<'0.9' | '1' | '1.15' | '1.3'>
                options={[
                  { key: '0.9', label: '0.9x' },
                  { key: '1', label: '1.0x' },
                  { key: '1.15', label: '1.15x' },
                  { key: '1.3', label: '1.3x' },
                ]}
                value={String(artScale) as '0.9' | '1' | '1.15' | '1.3'}
                onChange={(v) => setArtScale(Number(v))}
              />
            </View>

            <View style={{ height: 1, backgroundColor: colors.line }} />

            {/* Handover PIN Simulation */}
            <View>
              <View style={styles.devHeaderRow}>
                <Text
                  style={[
                    styles.rowTitle,
                    { color: colors.ink, fontSize: s(14.5) },
                  ]}
                >
                  Handover PIN code
                </Text>
                <Text style={[styles.devBadgeText, { color: colors.cobalt }]}>
                  {expectedPin === 'ANY' ? 'Any 4 digits' : expectedPin}
                </Text>
              </View>
              <Text
                style={[styles.rowSub, { color: colors.mute, marginBottom: 8 }]}
              >
                Choose which 4-digit PIN unlocks custody transfer
              </Text>
              <SegmentedControl<'5082' | '1234' | '0000' | 'ANY'>
                options={[
                  { key: '5082', label: '5082' },
                  { key: '1234', label: '1234' },
                  { key: '0000', label: '0000' },
                  { key: 'ANY', label: 'Any 4' },
                ]}
                value={expectedPin as '5082' | '1234' | '0000' | 'ANY'}
                onChange={(v) => setExpectedPin(v)}
              />
              <View style={[styles.devInlineRow, { marginTop: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: colors.ink, fontSize: s(14) },
                    ]}
                  >
                    Require PIN on handover
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.mute }]}>
                    Turn off for 1-tap instant handover bypass
                  </Text>
                </View>
                <Toggle value={requireCode} onToggle={setRequireCode} />
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.line }} />

            {/* Courier & Corridor Animation Speed */}
            <View>
              <View style={styles.devHeaderRow}>
                <Text
                  style={[
                    styles.rowTitle,
                    { color: colors.ink, fontSize: s(14.5) },
                  ]}
                >
                  Courier & animation speed
                </Text>
                <Text style={[styles.devBadgeText, { color: colors.cobalt }]}>
                  {courierSpeed}x
                </Text>
              </View>
              <Text
                style={[styles.rowSub, { color: colors.mute, marginBottom: 8 }]}
              >
                Speeds up GPS map rider and 2D corridor cyclist
              </Text>
              <SegmentedControl<'0.5' | '1' | '2' | '4'>
                options={[
                  { key: '0.5', label: '0.5x' },
                  { key: '1', label: '1x' },
                  { key: '2', label: '2x' },
                  { key: '4', label: '4x' },
                ]}
                value={String(courierSpeed) as '0.5' | '1' | '2' | '4'}
                onChange={(v) => setCourierSpeed(Number(v))}
              />
            </View>

            <View style={{ height: 1, backgroundColor: colors.line }} />

            {/* Simulated Active Cargo & ETA */}
            <View>
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.ink, fontSize: s(14.5), marginBottom: 6 },
                ]}
              >
                Simulated active cargo
              </Text>
              <SegmentedControl<'Zinc 20 mg' | 'ORS 20.5 g'>
                options={[
                  { key: 'Zinc 20 mg', label: 'Zinc 20 mg' },
                  { key: 'ORS 20.5 g', label: 'ORS 20.5 g' },
                ]}
                value={simCommodity}
                onChange={setSimCommodity}
              />

              <View style={[styles.devInlineRow, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: colors.ink, fontSize: s(14) },
                    ]}
                  >
                    Simulated courier ETA
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.mute }]}>
                    Shown on Home & Activity cards
                  </Text>
                </View>
                <View style={styles.miniStepper}>
                  <Press
                    onPress={() => setSimEtaMin(Math.max(1, simEtaMin - 1))}
                    style={[
                      styles.miniStepBtn,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text style={[styles.miniStepTxt, { color: colors.ink }]}>
                      −
                    </Text>
                  </Press>
                  <Text style={[styles.miniStepVal, { color: colors.ink }]}>
                    {simEtaMin}m
                  </Text>
                  <Press
                    onPress={() => setSimEtaMin(Math.min(25, simEtaMin + 1))}
                    style={[
                      styles.miniStepBtn,
                      { backgroundColor: colors.cobalt },
                    ]}
                  >
                    <Text style={[styles.miniStepTxt, { color: '#ffffff' }]}>
                      +
                    </Text>
                  </Press>
                </View>
              </View>

              <View style={[styles.devInlineRow, { marginTop: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: colors.ink, fontSize: s(14) },
                    ]}
                  >
                    Donor PHC B stock (ORS / Zinc)
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.mute }]}>
                    {simOrsStock} sachets / {simZincStock} tablets
                  </Text>
                </View>
                <View style={styles.miniStepper}>
                  <Press
                    onPress={() => {
                      setSimOrsStock(Math.max(20, simOrsStock - 10));
                      setSimZincStock(Math.max(20, simZincStock - 10));
                    }}
                    style={[
                      styles.miniStepBtn,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text style={[styles.miniStepTxt, { color: colors.ink }]}>
                      −
                    </Text>
                  </Press>
                  <Text style={[styles.miniStepVal, { color: colors.ink }]}>
                    {simOrsStock}
                  </Text>
                  <Press
                    onPress={() => {
                      setSimOrsStock(Math.min(200, simOrsStock + 10));
                      setSimZincStock(Math.min(240, simZincStock + 10));
                    }}
                    style={[
                      styles.miniStepBtn,
                      { backgroundColor: colors.cobalt },
                    ]}
                  >
                    <Text style={[styles.miniStepTxt, { color: '#ffffff' }]}>
                      +
                    </Text>
                  </Press>
                </View>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.line }} />

            {/* Quick Launch Simulation Actions */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Press
                  onPress={() => onOpenMode?.('handover')}
                  style={[
                    styles.devActionBtn,
                    { backgroundColor: colors.cobalt, flex: 1 },
                  ]}
                >
                  <Text style={[styles.devActionTxt, { color: '#ffffff' }]}>
                    Test Handover PIN
                  </Text>
                </Press>
                <Press
                  onPress={() => {
                    onSelectTab('home');
                    triggerSplash();
                  }}
                  style={[
                    styles.devActionBtn,
                    { backgroundColor: colors.lime, flex: 1 },
                  ]}
                >
                  <Text
                    style={[styles.devActionTxt, { color: colors.limeInk }]}
                  >
                    Replay 2D Splash
                  </Text>
                </Press>
              </View>
              <Press
                onPress={resetDemoState}
                style={[
                  styles.devActionBtn,
                  {
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.line,
                  },
                ]}
              >
                <Text style={[styles.devActionTxt, { color: colors.ink }]}>
                  Reset All Simulation Defaults
                </Text>
              </Press>
            </View>
          </View>

          {/* SCENARIO LAB RUNNER (ROUND 7) */}
          <Text style={[styles.secLbl, { color: colors.mute, marginTop: 4 }]}>
            SCENARIO LAB RUNNER (ROUND 7)
          </Text>
          <View
            style={[
              styles.groupCard,
              {
                backgroundColor: colors.tile,
                marginBottom: 28,
                paddingVertical: 14,
                paddingHorizontal: 16,
              },
            ]}
          >
            <ScenarioLabRunner
              colors={colors}
              isDark={isDark}
              uiScale={uiScale}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // 3. SAVED PLACES SUB-SCREEN
  if (subView === 'saved-places') {
    return (
      <View
        nativeID="web-account-screen"
        style={[styles.screen, { backgroundColor: colors.bg }]}
      >
        <ScreenBackdrop
          spots={[
            {
              art: 'route',
              bottom: 24,
              right: -14,
              size: 118,
              rotate: -6,
              withHighlight: true,
            },
            { art: 'clinic', top: 54, right: -22, size: 100, rotate: 8 },
          ]}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.subScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Press
              onPress={handleBack}
              style={[styles.backBtn, { backgroundColor: colors.tile }]}
            >
              <ChevronLeftIcon />
            </Press>
          </View>
          <Text style={[styles.pageTitle, { color: colors.ink }]}>
            Saved places{'\u00A0'}
          </Text>
          <Text style={[styles.leadSub, { color: colors.mute }]}>
            Tap a clinic to set it as your default delivery spot on the Home
            screen.
          </Text>

          <View
            style={[
              styles.groupCard,
              { backgroundColor: colors.tile, marginBottom: 14 },
            ]}
          >
            {savedPlaces.map((pl, idx) => {
              const selected = savedPlace === pl.name;
              return (
                <Press
                  key={pl.name}
                  onPress={() => setSavedPlace(selected ? '' : pl.name)}
                  scaleTo={0.99}
                  style={[
                    styles.row,
                    idx > 0 && {
                      borderTopWidth: 1,
                      borderTopColor: colors.line,
                    },
                  ]}
                >
                  <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                    <PinIcon
                      color={isDark ? colors.lime : colors.cobalt}
                      size={18}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: colors.ink }]}>
                      {pl.name}
                    </Text>
                    <Text style={[styles.rowSub, { color: colors.mute }]}>
                      {pl.sub}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      selected
                        ? {
                            backgroundColor: colors.lime,
                            borderColor: colors.lime,
                          }
                        : {
                            borderColor: colors.mute,
                            backgroundColor: 'transparent',
                          },
                    ]}
                  >
                    {selected && <CheckIcon size={13} color={colors.limeInk} />}
                  </View>
                </Press>
              );
            })}
          </View>

          <View style={[styles.groupCard, { backgroundColor: colors.tile }]}>
            <Press
              onPress={() =>
                addSavedPlace({
                  name: 'Ifo General Hospital',
                  sub: 'Secondary referral hospital, Ogun',
                })
              }
              scaleTo={0.99}
              style={styles.row}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <PlusIcon color={isDark ? colors.lime : colors.cobalt} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Add a place
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Save another clinic or store
                </Text>
              </View>
              <ChevronRightIcon />
            </Press>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 3. PAYMENT (SIMULATED) SUB-SCREEN
  if (subView === 'payment') {
    return (
      <View
        nativeID="web-account-screen"
        style={[styles.screen, { backgroundColor: colors.bg }]}
      >
        <ScreenBackdrop
          spots={[
            {
              art: 'crate',
              bottom: 18,
              right: -18,
              size: 112,
              rotate: -10,
              withHighlight: true,
            },
          ]}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.subScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Press
              onPress={handleBack}
              style={[styles.backBtn, { backgroundColor: colors.tile }]}
            >
              <ChevronLeftIcon />
            </Press>
          </View>
          <Text style={[styles.pageTitle, { color: colors.ink }]}>
            Payment{'\u00A0'}
          </Text>

          {/* Simulated Wallet Card */}
          <View style={styles.walletCard}>
            <View style={styles.walletTop}>
              <Text style={styles.walletLabel}>SUPPLAI WALLET</Text>
              <View style={styles.walletChip} />
            </View>
            <Text style={styles.walletBal}>
              NGN {walletBalance.toLocaleString('en-US')}
              {'\u00A0'}
            </Text>
            <Text style={styles.walletSub}>
              Simulated. No real money moves.
            </Text>
            <View style={styles.walletActions}>
              <Press
                onPress={() => setWalletBalance((b) => b + 5000)}
                style={[styles.walletBtn, { backgroundColor: colors.lime }]}
              >
                <Text style={[styles.walletBtnText, { color: colors.limeInk }]}>
                  Top up 5,000
                </Text>
              </Press>
              <Press
                onPress={() => setWalletBalance((b) => Math.max(0, b - 2000))}
                style={[
                  styles.walletBtn,
                  { backgroundColor: 'rgba(255,255,255,0.16)' },
                ]}
              >
                <Text style={[styles.walletBtnText, { color: '#ffffff' }]}>
                  Withdraw
                </Text>
              </Press>
            </View>
          </View>

          <View
            style={[
              styles.groupCard,
              { backgroundColor: colors.tile, marginBottom: 14 },
            ]}
          >
            <View style={styles.row}>
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <CardIcon />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Test card, 4242
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Expires 08/28
                </Text>
              </View>
              <View style={[styles.limePill, { backgroundColor: colors.lime }]}>
                <Text style={[styles.limePillText, { color: colors.limeInk }]}>
                  DEFAULT
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.secLbl, { color: colors.mute }]}>RECENT</Text>
          <View style={[styles.groupCard, { backgroundColor: colors.tile }]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  ORS delivery fee
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Yesterday, REQ-0001
                </Text>
              </View>
              <Text style={[styles.txAmt, { color: colors.ink }]}>-600</Text>
            </View>
            <View
              style={[
                styles.row,
                { borderTopWidth: 1, borderTopColor: colors.line },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Zinc release credit
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Tue, REL-0042
                </Text>
              </View>
              <Text style={[styles.txAmt, { color: colors.ink }]}>-600</Text>
            </View>
            <View
              style={[
                styles.row,
                { borderTopWidth: 1, borderTopColor: colors.line },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  LGA monthly grant
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Oct 1, simulated top-up
                </Text>
              </View>
              <View style={[styles.limePill, { backgroundColor: colors.lime }]}>
                <Text style={[styles.limePillText, { color: colors.limeInk }]}>
                  +10,000
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 4. SUPPORT SUB-SCREEN
  if (subView === 'support') {
    return (
      <View
        nativeID="web-account-screen"
        style={[styles.screen, { backgroundColor: colors.bg }]}
      >
        <ScreenBackdrop
          spots={[
            {
              art: 'handover',
              bottom: 18,
              right: -14,
              size: 112,
              rotate: -6,
              withHighlight: true,
            },
          ]}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.subScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Press
              onPress={handleBack}
              style={[styles.backBtn, { backgroundColor: colors.tile }]}
            >
              <ChevronLeftIcon />
            </Press>
          </View>
          <Text style={[styles.pageTitle, { color: colors.ink }]}>
            Support{'\u00A0'}
          </Text>

          {/* Search bar */}
          <View style={[styles.searchBox, { backgroundColor: colors.tile }]}>
            <SearchIcon />
            <TextInput
              value={supportQuery}
              onChangeText={setSupportQuery}
              placeholder="How can we help?"
              placeholderTextColor={colors.mute}
              style={[styles.searchInput, { color: colors.ink }]}
            />
          </View>

          {supportToast ? (
            <View
              style={[
                styles.toastBanner,
                { backgroundColor: colors.cobaltSoft },
              ]}
            >
              <Text style={[styles.toastText, { color: colors.ink }]}>
                {supportToast}
              </Text>
            </View>
          ) : null}

          {/* Quick-action 2-column grid */}
          <View style={styles.supportGrid}>
            <Press
              onPress={() => changeSubView('chat')}
              style={[styles.supportTile, { backgroundColor: colors.tile }]}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <ChatIcon color={isDark ? colors.lime : colors.cobalt} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Chat Assistant
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Instant answers
                </Text>
              </View>
            </Press>

            <Press
              onPress={() =>
                setSupportToast('Calling Ogun LGA dispatch desk...')
              }
              style={[styles.supportTile, { backgroundColor: colors.tile }]}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <PhoneIcon color={isDark ? colors.lime : colors.cobalt} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Call dispatcher
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Ogun desk
                </Text>
              </View>
            </Press>
          </View>

          <Text style={[styles.secLbl, { color: colors.mute }]}>TOPICS</Text>
          <View style={[styles.groupCard, { backgroundColor: colors.tile }]}>
            {[
              {
                icon: <ClockIcon />,
                title: 'Delivery is taking long',
                sub: 'Check rider GPS or reassign',
                query:
                  'Where is my active delivery right now and what is the ETA?',
              },
              {
                icon: <FlagIcon />,
                title: 'Wrong or damaged items',
                sub: 'Report broken seal or count mismatch',
                query:
                  'The crate seal 7842 is broken or damaged. What is the refusal protocol?',
              },
              {
                icon: <LockIcon />,
                title: 'Handover code problems',
                sub: 'Reset 4-digit custody code',
                query: 'How do I verify handover code 5082 or reset it?',
              },
              {
                icon: <HelpIcon />,
                title: 'Medicine transport rules',
                sub: 'Ambient vs cold-chain standards',
                query:
                  'What are the transport and weather packaging rules for ORS and Zinc?',
              },
            ].map((topic, idx) => (
              <Press
                key={topic.title}
                onPress={() => {
                  handleMobileSend(topic.query);
                  changeSubView('chat');
                }}
                scaleTo={0.99}
                style={[
                  styles.row,
                  idx > 0 && {
                    borderTopWidth: 1,
                    borderTopColor: colors.line,
                  },
                ]}
              >
                <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                  {topic.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.ink }]}>
                    {topic.title}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.mute }]}>
                    {topic.sub}
                  </Text>
                </View>
                <ChevronRightIcon />
              </Press>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // 5. SAFETY SUB-SCREEN
  if (subView === 'safety') {
    return (
      <View
        nativeID="web-account-screen"
        style={[styles.screen, { backgroundColor: colors.bg }]}
      >
        <ScreenBackdrop
          spots={[
            {
              art: 'shield',
              bottom: 16,
              right: -16,
              size: 118,
              rotate: 6,
              withHighlight: true,
            },
          ]}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.subScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Press
              onPress={handleBack}
              style={[styles.backBtn, { backgroundColor: colors.tile }]}
            >
              <ChevronLeftIcon />
            </Press>
          </View>
          <Text style={[styles.pageTitle, { color: colors.ink }]}>
            Safety{'\u00A0'}
          </Text>

          <View style={[styles.safetyHero, { backgroundColor: colors.tile }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.safetyTitle, { color: colors.ink }]}>
                Seal and code on every handover
              </Text>
              <Text style={[styles.safetySub, { color: colors.mute }]}>
                Don't hand over or accept a crate if the seal number doesn't
                match the app.
              </Text>
            </View>
            <Art name="shield" size={56} withHighlight />
          </View>

          <Text style={[styles.secLbl, { color: colors.mute }]}>CONTROLS</Text>
          <View
            style={[
              styles.groupCard,
              { backgroundColor: colors.tile, marginBottom: 14 },
            ]}
          >
            <View style={styles.row}>
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <UsersIcon />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Share delivery with LGA
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  Live route visible to supervisor
                </Text>
              </View>
              <Toggle value={shareLga} onToggle={setShareLga} />
            </View>

            <View
              style={[
                styles.row,
                { borderTopWidth: 1, borderTopColor: colors.line },
              ]}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <LockIcon />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Require code on handover
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  4-digit PIN before custody changes
                </Text>
              </View>
              <Toggle value={requireCode} onToggle={setRequireCode} />
            </View>

            <View
              style={[
                styles.row,
                { borderTopWidth: 1, borderTopColor: colors.line },
              ]}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <PhoneIcon color={isDark ? colors.lime : colors.cobalt} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Emergency contact
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  +234 800 787 7524
                </Text>
              </View>
              <ChevronRightIcon />
            </View>
          </View>

          <Text style={[styles.secLbl, { color: colors.mute }]}>
            BEFORE YOU ACCEPT
          </Text>
          <View style={[styles.groupCard, { backgroundColor: colors.tile }]}>
            {[
              {
                title: 'Check seal 7842 is unbroken',
                sub: 'Matches the number on your screen',
              },
              {
                title: 'Keep ORS and Zinc dry',
                sub: 'Ambient-stable, no cold box needed',
              },
              {
                title: 'Count before entering code',
                sub: 'Code 5082 signs off the full quantity',
              },
            ].map((item, idx) => (
              <View
                key={item.title}
                style={[
                  styles.row,
                  idx > 0 && {
                    borderTopWidth: 1,
                    borderTopColor: colors.line,
                  },
                ]}
              >
                <View
                  style={[styles.checkBadge, { backgroundColor: colors.lime }]}
                >
                  <CheckIcon size={14} color={colors.limeInk} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.ink }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.mute }]}>
                    {item.sub}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // 7. CHAT ASSISTANT SUB-SCREEN
  if (subView === 'chat') {
    return (
      <View
        nativeID="web-account-screen"
        style={[styles.screen, { backgroundColor: colors.bg }]}
      >
        <ScreenBackdrop
          spots={[
            {
              art: 'pills',
              bottom: 18,
              right: -14,
              size: 110,
              rotate: -8,
              withHighlight: true,
            },
          ]}
        />
        <View style={styles.topRow}>
          <Press
            onPress={handleBack}
            style={[styles.backBtn, { backgroundColor: colors.tile }]}
          >
            <ChevronLeftIcon />
          </Press>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.chatHeaderTitle, { color: colors.ink }]}>
              Supplai Assistant
            </Text>
            <Text style={[styles.chatHeaderSub, { color: colors.mute }]}>
              Clinical safety & dispatch copilot
            </Text>
          </View>
        </View>

        {/* Message Thread */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.mobileBubbleRow,
                msg.role === 'user'
                  ? styles.bubbleRowUser
                  : styles.bubbleRowAsst,
              ]}
            >
              <View
                style={[
                  styles.mobileBubble,
                  msg.role === 'user'
                    ? { backgroundColor: colors.cobalt }
                    : {
                        backgroundColor: colors.tile,
                        borderColor: colors.line,
                        borderWidth: 1,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.mobileBubbleText,
                    { color: msg.role === 'user' ? '#fff' : colors.ink },
                  ]}
                >
                  {msg.content}
                </Text>

                {/* Render Rich Context Card */}
                {msg.contextCard && (
                  <View style={styles.mobileCardWrap}>
                    <MobileContextCard
                      card={msg.contextCard}
                      colors={colors}
                      isDark={isDark}
                      onRequest={() => {
                        onOpenMode?.('request');
                      }}
                    />
                  </View>
                )}

                <Text
                  style={[
                    styles.mobileBubbleTime,
                    {
                      color:
                        msg.role === 'user'
                          ? 'rgba(255,255,255,0.7)'
                          : colors.mute,
                    },
                  ]}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Suggested Quick Prompts */}
        <View
          style={[
            styles.mobilePromptBar,
            { backgroundColor: colors.bg, borderTopColor: colors.line },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {defaultChatQuickPrompts.map((p) => (
              <Press
                key={p.id}
                onPress={() => handleMobileSend(p.query)}
                style={[
                  styles.mobilePromptChip,
                  { backgroundColor: colors.tile, borderColor: colors.line },
                ]}
              >
                <Text style={[styles.mobilePromptText, { color: colors.ink }]}>
                  {p.label}
                </Text>
              </Press>
            ))}
          </ScrollView>
        </View>

        {/* Chat Input Bar */}
        <View
          style={[
            styles.mobileInputBar,
            { backgroundColor: colors.tile, borderTopColor: colors.line },
          ]}
        >
          <TextInput
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Ask about nearby stock, safety rules, or PIN..."
            placeholderTextColor={colors.mute}
            style={[
              styles.mobileTextInput,
              { color: colors.ink, backgroundColor: colors.bg },
            ]}
            onSubmitEditing={() => handleMobileSend(chatInput)}
          />
          <Press
            onPress={() => handleMobileSend(chatInput)}
            style={[styles.mobileSendBtn, { backgroundColor: colors.cobalt }]}
          >
            <ChatIcon color="#fff" />
          </Press>
        </View>
      </View>
    );
  }

  // DEFAULT: ACCOUNT HUB
  return (
    <View
      nativeID="web-account-screen"
      style={[styles.screen, { backgroundColor: colors.bg }]}
    >
      <ScreenBackdrop
        spots={[
          {
            art: 'clinic',
            top: 8,
            right: -16,
            size: 112,
            rotate: 6,
            withHighlight: true,
          },
          {
            art: 'pills',
            bottom: 120,
            left: -18,
            size: 100,
            rotate: -12,
          },
        ]}
      />

      <ScrollView
        nativeID="web-account-content"
        style={{ flex: 1 }}
        contentContainerStyle={styles.hubScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profCard}>
          <View style={[styles.profAvatarRing, { borderColor: colors.lime }]}>
            <View
              style={[styles.profAvatar, { backgroundColor: colors.cobalt }]}
            >
              <Text style={styles.profAvatarText}>DA{'\u00A0'}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profName, { color: colors.ink }]}>
              Demo PHC A{'\u00A0'}
            </Text>
            <Text style={[styles.profSub, { color: colors.mute }]}>
              Aiyetoro Central, facility lead
            </Text>
          </View>
        </View>

        {/* Primary Menu Group */}
        <View
          style={[
            styles.groupCard,
            { backgroundColor: colors.tile, marginBottom: 14 },
          ]}
        >
          <Press
            onPress={() => changeSubView('settings')}
            scaleTo={0.99}
            style={styles.row}
          >
            <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
              <GearIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.ink, fontSize: s(15) },
                ]}
              >
                Settings
              </Text>
              <Text
                style={[
                  styles.rowSub,
                  { color: colors.mute, fontSize: s(12.5) },
                ]}
              >
                Appearance, dark mode, alerts, haptics
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>

          <Press
            onPress={() => changeSubView('developer')}
            scaleTo={0.99}
            style={[
              styles.row,
              { borderTopWidth: 1, borderTopColor: colors.line },
            ]}
          >
            <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
              <CodeIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.ink, fontSize: s(15) },
                ]}
              >
                Developer menu
              </Text>
              <Text
                style={[
                  styles.rowSub,
                  { color: colors.mute, fontSize: s(12.5) },
                ]}
              >
                Simulations, handover PIN test, UI scale
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>

          <Press
            onPress={() => changeSubView('payment')}
            scaleTo={0.99}
            style={[
              styles.row,
              { borderTopWidth: 1, borderTopColor: colors.line },
            ]}
          >
            <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
              <CardIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.ink, fontSize: s(15) },
                ]}
              >
                Payment
              </Text>
              <Text
                style={[
                  styles.rowSub,
                  { color: colors.mute, fontSize: s(12.5) },
                ]}
              >
                Simulated wallet, NGN {walletBalance.toLocaleString('en-US')}
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>

          <Press
            onPress={() => changeSubView('saved-places')}
            scaleTo={0.99}
            style={[
              styles.row,
              { borderTopWidth: 1, borderTopColor: colors.line },
            ]}
          >
            <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
              <PinIcon color={isDark ? colors.lime : colors.cobalt} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.ink, fontSize: s(15) },
                ]}
              >
                Saved places
              </Text>
              <Text
                style={[
                  styles.rowSub,
                  { color: colors.mute, fontSize: s(12.5) },
                ]}
              >
                {savedPlace
                  ? `${savedPlace} selected`
                  : 'None selected — tap to pick one'}
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>
        </View>

        {/* Secondary Menu Group */}
        <View
          style={[
            styles.groupCard,
            { backgroundColor: colors.tile, marginBottom: 14 },
          ]}
        >
          <Press
            onPress={() => changeSubView('support')}
            scaleTo={0.99}
            style={styles.row}
          >
            <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
              <HelpIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.ink, fontSize: s(15) },
                ]}
              >
                Support
              </Text>
              <Text
                style={[
                  styles.rowSub,
                  { color: colors.mute, fontSize: s(12.5) },
                ]}
              >
                Call dispatcher or report issue
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>

          <Press
            onPress={() => changeSubView('safety')}
            scaleTo={0.99}
            style={[
              styles.row,
              { borderTopWidth: 1, borderTopColor: colors.line },
            ]}
          >
            <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
              <ShieldIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.ink, fontSize: s(15) },
                ]}
              >
                Safety
              </Text>
              <Text
                style={[
                  styles.rowSub,
                  { color: colors.mute, fontSize: s(12.5) },
                ]}
              >
                Seal check, handover rules
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>
        </View>

        {/* Sign Out */}
        <Press
          onPress={() => {
            if (onSignOut) {
              onSignOut();
              return;
            }
            onSelectTab('home');
            resetDemoState();
            triggerSplash();
          }}
          scaleTo={0.99}
          style={[styles.signOutBtn, { backgroundColor: colors.tile }]}
        >
          <Text
            style={[styles.signOutText, { color: colors.red, fontSize: s(15) }]}
          >
            Sign out
          </Text>
        </Press>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
  },
  hubScroll: {
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  subScroll: {
    paddingTop: 10,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  topRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontFamily: ui.font.bold,
    fontSize: 28,
    letterSpacing: -0.8,
    lineHeight: 33,
    marginBottom: 14,
    paddingRight: 4,
  },
  leadSub: {
    fontFamily: ui.font.regular,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: -6,
    marginBottom: 14,
  },
  profCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 4,
    paddingBottom: 16,
  },
  profAvatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profAvatarText: {
    fontFamily: ui.font.bold,
    fontSize: 19,
    color: '#ffffff',
    paddingRight: 2,
  },
  profName: {
    fontFamily: ui.font.bold,
    fontSize: 20,
    letterSpacing: -0.4,
    paddingRight: 2,
  },
  profSub: {
    fontFamily: ui.font.regular,
    fontSize: 13,
    marginTop: 2,
  },
  secLbl: {
    fontFamily: ui.font.bold,
    fontSize: 12,
    letterSpacing: 0.7,
    marginBottom: 8,
    marginTop: 4,
  },
  groupCard: {
    borderWidth: designTokens.border.card,
    borderColor: designTokens.border.ink,
    borderRadius: designTokens.radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowIco: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  signOutBtn: {
    height: 48,
    borderWidth: designTokens.border.card,
    borderColor: designTokens.border.ink,
    borderRadius: designTokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontFamily: ui.font.semi,
    fontSize: 15,
    paddingRight: 2,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  swatch: {
    flex: 1,
    height: 82,
    borderWidth: designTokens.border.card,
    borderColor: designTokens.border.ink,
    borderRadius: designTokens.radius.md,
    padding: 10,
    justifyContent: 'space-between',
  },
  swatchName: {
    fontFamily: ui.font.bold,
    fontSize: 12,
    lineHeight: 14,
  },
  swatchHex: {
    fontFamily: ui.font.bold,
    fontSize: 10.5,
    letterSpacing: 0.4,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCard: {
    borderWidth: designTokens.border.card,
    borderColor: designTokens.border.ink,
    borderRadius: designTokens.radius.lg,
    padding: 20,
    backgroundColor: designTokens.colors.forest,
    marginBottom: 14,
    shadowColor: designTokens.colors.forest,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontFamily: ui.font.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.78)',
  },
  walletChip: {
    width: 34,
    height: 24,
    borderRadius: 6,
    backgroundColor: designTokens.colors.yellow,
  },
  walletBal: {
    fontFamily: ui.font.bold,
    fontSize: 32,
    letterSpacing: -1,
    color: '#ffffff',
    marginTop: 10,
    paddingRight: 4,
  },
  walletSub: {
    fontFamily: ui.font.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 2,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  walletBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletBtnText: {
    fontFamily: ui.font.bold,
    fontSize: 13.5,
    paddingRight: 2,
  },
  limePill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  limePillText: {
    fontFamily: ui.font.bold,
    fontSize: 11,
    letterSpacing: 0.3,
    paddingRight: 1,
  },
  txAmt: {
    fontFamily: ui.font.bold,
    fontSize: 14.5,
    paddingRight: 2,
  },
  searchBox: {
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: ui.font.medium,
    fontSize: 14,
    paddingVertical: 0,
  },
  toastBanner: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  toastText: {
    fontFamily: ui.font.semi,
    fontSize: 13,
  },
  supportGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  supportTile: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  safetyHero: {
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  safetyTitle: {
    fontFamily: ui.font.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  safetySub: {
    fontFamily: ui.font.regular,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  devBadgeText: {
    fontFamily: ui.font.bold,
    fontSize: 12.5,
  },
  devInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  miniStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniStepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStepTxt: {
    fontFamily: ui.font.bold,
    fontSize: 18,
    lineHeight: 20,
  },
  miniStepVal: {
    fontFamily: ui.font.bold,
    fontSize: 13.5,
    minWidth: 32,
    textAlign: 'center',
  },
  devActionBtn: {
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  devActionTxt: {
    fontFamily: ui.font.bold,
    fontSize: 12.5,
    letterSpacing: -0.1,
    paddingRight: 2,
  },
  chatHeaderTitle: {
    fontFamily: ui.font.bold,
    fontSize: 18,
    letterSpacing: -0.4,
  },
  chatHeaderSub: {
    fontFamily: ui.font.medium,
    fontSize: 12,
    marginTop: 2,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  mobileBubbleRow: {
    width: '100%',
    flexDirection: 'row',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAsst: {
    justifyContent: 'flex-start',
  },
  mobileBubble: {
    maxWidth: '86%',
    padding: 12,
    borderRadius: 16,
  },
  mobileBubbleText: {
    fontFamily: ui.font.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  mobileBubbleTime: {
    fontFamily: ui.font.regular,
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right',
  },
  mobileCardWrap: {
    marginTop: 10,
  },
  mobilePromptBar: {
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  mobilePromptChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  mobilePromptText: {
    fontFamily: ui.font.bold,
    fontSize: 12,
  },
  mobileInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  mobileTextInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    fontFamily: ui.font.medium,
    fontSize: 14,
  },
  mobileSendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  mCardTitle: {
    fontFamily: ui.font.bold,
    fontSize: 14,
  },
  mCardSub: {
    fontFamily: ui.font.medium,
    fontSize: 11,
    marginTop: 2,
  },
  mCardStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  mCardStat: {
    alignItems: 'center',
  },
  mCardStatLabel: {
    fontFamily: ui.font.medium,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  mCardStatVal: {
    fontFamily: ui.font.bold,
    fontSize: 14,
    marginTop: 2,
  },
  mCardLot: {
    fontFamily: ui.font.medium,
    fontSize: 11,
    marginTop: 4,
  },
  mCardCta: {
    marginTop: 10,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mCardCtaText: {
    fontFamily: ui.font.bold,
    fontSize: 12,
  },
  mCardWarn: {
    padding: 8,
    borderRadius: 6,
    marginVertical: 6,
  },
  mCardRule: {
    fontFamily: ui.font.medium,
    fontSize: 12,
    marginTop: 3,
  },
});

function MobileContextCard({
  card,
  colors,
  isDark,
  onRequest,
}: {
  card: ChatContextCard;
  colors: ThemeColors;
  isDark: boolean;
  onRequest: () => void;
}) {
  if (card.type === 'facility_availability') {
    return (
      <View
        style={[
          styles.mCard,
          {
            backgroundColor: isDark ? '#0b0e15' : '#f0f4f9',
            borderColor: colors.line,
          },
        ]}
      >
        <Text style={[styles.mCardTitle, { color: colors.ink }]}>
          {card.facilityName}
        </Text>
        <Text style={[styles.mCardSub, { color: colors.mute }]}>
          {card.distanceKm} km away · ~{card.etaMinutes} min by rider
        </Text>
        <View style={styles.mCardStatRow}>
          <View style={styles.mCardStat}>
            <Text style={[styles.mCardStatLabel, { color: colors.mute }]}>
              On hand
            </Text>
            <Text style={[styles.mCardStatVal, { color: colors.ink }]}>
              {card.quantityOnHand}
            </Text>
          </View>
          <View style={styles.mCardStat}>
            <Text style={[styles.mCardStatLabel, { color: colors.mute }]}>
              Safety floor
            </Text>
            <Text style={[styles.mCardStatVal, { color: colors.ink }]}>
              {card.quantityOnHand - card.transferableQuantity}
            </Text>
          </View>
          <View style={styles.mCardStat}>
            <Text style={[styles.mCardStatLabel, { color: colors.mute }]}>
              Transferable
            </Text>
            <Text
              style={[
                styles.mCardStatVal,
                { color: isDark ? colors.lime : colors.cobalt },
              ]}
            >
              {card.transferableQuantity}
            </Text>
          </View>
        </View>
        <Text style={[styles.mCardLot, { color: colors.mute }]}>
          Batch {card.batchNumber} · Exp {card.expiresOn}
        </Text>
        {card.canRequest && (
          <Press
            onPress={onRequest}
            style={[
              styles.mCardCta,
              { backgroundColor: isDark ? colors.lime : colors.cobalt },
            ]}
          >
            <Text
              style={[
                styles.mCardCtaText,
                { color: isDark ? colors.limeInk : '#fff' },
              ]}
            >
              {card.requestActionText}
            </Text>
          </Press>
        )}
      </View>
    );
  }

  if (card.type === 'safety_guideline') {
    return (
      <View
        style={[
          styles.mCard,
          {
            backgroundColor: isDark ? '#0b0e15' : '#f0f4f9',
            borderColor: colors.line,
          },
        ]}
      >
        <Text style={[styles.mCardTitle, { color: colors.ink }]}>
          {card.medicineName} Safety Guide
        </Text>
        <Text style={[styles.mCardSub, { color: colors.mute }]}>
          {card.temperatureRange} · {card.storageType}
        </Text>
        {card.warnings.length > 0 && (
          <View
            style={[
              styles.mCardWarn,
              { backgroundColor: 'rgba(237, 76, 92, 0.12)' },
            ]}
          >
            <Text style={{ color: '#ed4c5c', fontSize: 12, fontWeight: '700' }}>
              {card.warnings[0]}
            </Text>
          </View>
        )}
        <Text style={[styles.mCardRule, { color: colors.ink }]}>
          • Packaging: {card.packagingRule}
        </Text>
        <Text style={[styles.mCardRule, { color: colors.ink }]}>
          • Compliance: {card.nafdacGsdpRule}
        </Text>
        <Text style={[styles.mCardLot, { color: colors.mute }]}>
          Tamper seal required:{' '}
          {card.tamperSealRequired ? 'Yes (4-digit)' : 'No'}
        </Text>
      </View>
    );
  }

  if (card.type === 'handover_help') {
    return (
      <View
        style={[
          styles.mCard,
          {
            backgroundColor: isDark ? '#0b0e15' : '#f0f4f9',
            borderColor: colors.line,
          },
        ]}
      >
        <Text style={[styles.mCardTitle, { color: colors.ink }]}>
          Handover PIN Verification
        </Text>
        <Text style={[styles.mCardSub, { color: colors.mute }]}>
          Expected code: {card.expectedPin} · Seal #{card.sealNumber}
        </Text>
        {card.refusalChecklist.map((c, i) => (
          <Text key={i} style={[styles.mCardRule, { color: colors.ink }]}>
            {i + 1}. {c}
          </Text>
        ))}
      </View>
    );
  }

  return null;
}
