import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ui, useAppConfig, type ThemeMode } from '../lib/theme';
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
} from '../components/ui';
import { FloatingDock, type DockTab } from '../components/FloatingDock';

export type AccountSubView =
  'hub' | 'settings' | 'saved-places' | 'payment' | 'support' | 'safety';

export function AccountScreen({
  initialSubView = 'hub',
  onSelectTab,
  onBackFromSavedPlacesToHome,
}: {
  initialSubView?: AccountSubView;
  onSelectTab: (tab: DockTab) => void;
  onBackFromSavedPlacesToHome?: () => void;
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
  } = useAppConfig();

  const [subView, setSubView] = useState<AccountSubView>(initialSubView);
  const [supportQuery, setSupportQuery] = useState('');
  const [supportToast, setSupportToast] = useState<string | null>(null);

  useEffect(() => {
    setSubView(initialSubView);
  }, [initialSubView]);

  const handleBack = () => {
    if (subView === 'saved-places' && onBackFromSavedPlacesToHome) {
      onBackFromSavedPlacesToHome();
      return;
    }
    setSubView('hub');
  };

  const iconBoxBg = isDark ? 'rgba(212, 255, 36, 0.12)' : colors.cobaltSoft;

  // 1. SETTINGS SUB-SCREEN
  if (subView === 'settings') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
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
          <Text style={[styles.pageTitle, { color: colors.ink }]}>
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

  // 2. SAVED PLACES SUB-SCREEN
  if (subView === 'saved-places') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
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
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
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
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
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
              onPress={() =>
                setSupportToast('Dispatcher chat connected (Ogun desk).')
              }
              style={[styles.supportTile, { backgroundColor: colors.tile }]}
            >
              <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
                <ChatIcon color={isDark ? colors.lime : colors.cobalt} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>
                  Chat
                </Text>
                <Text style={[styles.rowSub, { color: colors.mute }]}>
                  2 min reply
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
              },
              {
                icon: <FlagIcon />,
                title: 'Wrong or damaged items',
                sub: 'Report broken seal or count mismatch',
              },
              {
                icon: <LockIcon />,
                title: 'Handover code problems',
                sub: 'Reset 4-digit custody code',
              },
              {
                icon: <HelpIcon />,
                title: 'Help centre',
                sub: 'Guides for clinic leads',
              },
            ].map((topic, idx) => (
              <Press
                key={topic.title}
                onPress={() => setSupportToast(`Opened: ${topic.title}`)}
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
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
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

  // DEFAULT: ACCOUNT HUB
  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
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
            onPress={() => setSubView('settings')}
            scaleTo={0.99}
            style={styles.row}
          >
            <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
              <GearIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.ink }]}>
                Settings
              </Text>
              <Text style={[styles.rowSub, { color: colors.mute }]}>
                Dark mode, alerts, motion
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>

          <Press
            onPress={() => setSubView('payment')}
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
              <Text style={[styles.rowTitle, { color: colors.ink }]}>
                Payment
              </Text>
              <Text style={[styles.rowSub, { color: colors.mute }]}>
                Simulated wallet, NGN {walletBalance.toLocaleString('en-US')}
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>

          <Press
            onPress={() => setSubView('saved-places')}
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
              <Text style={[styles.rowTitle, { color: colors.ink }]}>
                Saved places
              </Text>
              <Text style={[styles.rowSub, { color: colors.mute }]}>
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
            onPress={() => setSubView('support')}
            scaleTo={0.99}
            style={styles.row}
          >
            <View style={[styles.rowIco, { backgroundColor: iconBoxBg }]}>
              <HelpIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.ink }]}>
                Support
              </Text>
              <Text style={[styles.rowSub, { color: colors.mute }]}>
                Call dispatcher or report issue
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>

          <Press
            onPress={() => setSubView('safety')}
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
              <Text style={[styles.rowTitle, { color: colors.ink }]}>
                Safety
              </Text>
              <Text style={[styles.rowSub, { color: colors.mute }]}>
                Seal check, handover rules
              </Text>
            </View>
            <ChevronRightIcon />
          </Press>
        </View>

        {/* Sign Out */}
        <Press
          onPress={() => onSelectTab('home')}
          scaleTo={0.99}
          style={[styles.signOutBtn, { backgroundColor: colors.tile }]}
        >
          <Text style={[styles.signOutText, { color: colors.red }]}>
            Sign out
          </Text>
        </Press>
      </ScrollView>

      <FloatingDock activeTab="account" onSelectTab={onSelectTab} />
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
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#1558C9',
    marginBottom: 14,
    shadowColor: '#1558C9',
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
    backgroundColor: '#D4FF24',
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
});
