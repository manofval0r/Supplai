import { useState, useCallback } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { RolePicker, type AppMode } from './components/RolePicker';
import { FloatingDock, type DockTab } from './components/FloatingDock';
import { AnimatedSplash } from './components/AnimatedSplash';
import { FacilityScreen } from './screens/FacilityScreen';
import { RiderScreen } from './screens/RiderScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { AccountScreen, type AccountSubView } from './screens/AccountScreen';
import { AppConfigProvider, useAppConfig } from './lib/theme';

function MainNavigator() {
  const { colors, isDark, showSplash, setShowSplash } = useAppConfig();
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

  const showDock =
    !showSplash &&
    (mode === 'home' ||
      mode === 'activity' ||
      (mode === 'account' && accountSubView === 'hub'));

  const activeDockTab: DockTab =
    mode === 'activity' ? 'activity' : mode === 'account' ? 'account' : 'home';

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: showSplash
            ? (isDark ? '#030407' : colors.bg)
            : mode === 'rider'
              ? '#e8ecf2'
              : colors.bg,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

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
            />
          )}

          {mode === 'saved-places' && (
            <AccountScreen
              initialSubView="saved-places"
              onSelectTab={handleSelectTab}
              onOpenMode={setMode}
              onBackFromSavedPlacesToHome={() => setMode('home')}
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
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#1558C9" />
      </View>
    );
  }

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
