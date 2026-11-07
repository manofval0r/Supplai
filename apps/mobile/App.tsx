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
import { type DockTab } from './components/FloatingDock';
import { FacilityScreen } from './screens/FacilityScreen';
import { RiderScreen } from './screens/RiderScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { AccountScreen } from './screens/AccountScreen';
import { AppConfigProvider, useAppConfig } from './lib/theme';

function MainNavigator() {
  const { colors, isDark } = useAppConfig();
  const [mode, setMode] = useState<AppMode>('home');

  const handleSelectTab = useCallback((tab: DockTab) => {
    setMode(tab);
  }, []);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: mode === 'rider' ? '#e8ecf2' : colors.bg },
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.mainContent}>
        {mode === 'home' && (
          <RolePicker onSelectMode={setMode} onSelectTab={handleSelectTab} />
        )}

        {mode === 'activity' && (
          <ActivityScreen
            onOpenLiveDelivery={() => setMode('rider')}
            onSelectTab={handleSelectTab}
          />
        )}

        {mode === 'account' && (
          <AccountScreen initialSubView="hub" onSelectTab={handleSelectTab} />
        )}

        {mode === 'saved-places' && (
          <AccountScreen
            initialSubView="saved-places"
            onSelectTab={handleSelectTab}
            onBackFromSavedPlacesToHome={() => setMode('home')}
          />
        )}

        {(mode === 'request' || mode === 'release' || mode === 'handover') && (
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
