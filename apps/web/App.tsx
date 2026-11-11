'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { RolePicker, type AppMode } from './components/RolePicker';
import { FloatingDock, type DockTab } from './components/FloatingDock';
import { AnimatedSplash } from './components/AnimatedSplash';
import { FacilityScreen } from './screens/FacilityScreen';
import { RiderScreen } from './screens/RiderScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { AccountScreen, type AccountSubView } from './screens/AccountScreen';
import { AppConfigProvider, useAppConfig } from './lib/theme';

function MainNavigator() {
  const { colors, isDark, showSplash, setShowSplash, resetDemoState } =
    useAppConfig();
  const router = useRouter();
  const [mode, setMode] = useState<AppMode>('home');
  const [accountSubView, setAccountSubView] = useState<AccountSubView>('hub');

  const handleFinishSplash = useCallback(() => {
    setShowSplash(false);
  }, [setShowSplash]);

  const handleSelectTab = useCallback((tab: DockTab) => {
    if (tab === 'account') {
      setAccountSubView('hub');
    }
    setMode(tab);
  }, []);

  const handleSignOut = useCallback(() => {
    resetDemoState();
    router.push('/');
  }, [resetDemoState, router]);

  const showDock =
    !showSplash &&
    (mode === 'home' ||
      mode === 'activity' ||
      (mode === 'account' && accountSubView === 'hub'));

  const activeDockTab: DockTab =
    mode === 'activity' ? 'activity' : mode === 'account' ? 'account' : 'home';

  return (
    <SafeAreaView
      nativeID="web-app-shell"
      style={[
        styles.safeArea,
        {
          backgroundColor: showSplash
            ? isDark
              ? '#081811'
              : colors.bg
            : mode === 'rider'
              ? colors.bgSoft
              : colors.bg,
        },
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.mainContent}>
        <View style={{ flex: 1 }}>
          {mode === 'home' && <RolePicker onSelectMode={setMode} />}

          {mode === 'activity' && (
            <ActivityScreen onOpenLiveDelivery={() => setMode('rider')} />
          )}

          {mode === 'account' && (
            <AccountScreen
              initialSubView="hub"
              onSelectTab={handleSelectTab}
              onOpenMode={setMode}
              onSubViewChange={setAccountSubView}
              onSignOut={handleSignOut}
            />
          )}

          {mode === 'saved-places' && (
            <AccountScreen
              initialSubView="saved-places"
              onSelectTab={handleSelectTab}
              onOpenMode={setMode}
              onBackFromSavedPlacesToHome={() => setMode('home')}
              onSignOut={handleSignOut}
            />
          )}

          {(mode === 'request' ||
            mode === 'release' ||
            mode === 'handover') && (
            <FacilityScreen
              facilityName="Aiyetoro Central"
              mode={mode}
              onSwitchRole={() => setMode('home')}
              onOpenRider={() => setMode('rider')}
            />
          )}

          {mode === 'rider' && (
            <RiderScreen
              riderName="Ade Okafor"
              onSwitchRole={() => setMode('home')}
              onOpenHandover={() => setMode('handover')}
            />
          )}
        </View>

        {showDock && (
          <FloatingDock
            activeTab={activeDockTab}
            onSelectTab={handleSelectTab}
          />
        )}

        {showSplash && <AnimatedSplash onFinish={handleFinishSplash} />}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppConfigProvider>
      <MainNavigator />
    </AppConfigProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) : 0,
    paddingBottom: Platform.OS === 'android' ? 10 : 0,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
  },
});
