import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useColorScheme } from 'react-native';

export const palette = {
  midnight: '#030407',
  cobalt: '#1558C9',
  lime: '#D4FF24',
  limeInk: '#030407',
  red: '#e5484d',
  green: '#12a36b',
};

export const ui = {
  ink: '#030407',
  mute: '#646f82',
  line: '#e6e9ef',
  accent: '#1558C9',
  cobalt: '#1558C9',
  lime: '#D4FF24',
  green: '#12a36b',
  red: '#e5484d',
  fillSoft: '#eef0f4',
  tint: '#e9f0fd',
  font: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semi: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
};

export interface ThemeColors {
  bg: string;
  bgSoft: string;
  tile: string;
  tileHover: string;
  surface: string;
  ink: string;
  mute: string;
  line: string;
  cobalt: string;
  cobaltSoft: string;
  lime: string;
  limeInk: string;
  artStroke: string;
  artFill: string;
  artHighlight: string;
  dockBg: string;
  dockBorder: string;
  dockActiveBg: string;
  dockActiveInk: string;
  red: string;
  heroTileBg: string;
  heroSubColor: string;
}

export const lightColors: ThemeColors = {
  bg: '#ffffff',
  bgSoft: '#f4f6fa',
  tile: '#f2f4f8',
  tileHover: '#e8ecf4',
  surface: '#ffffff',
  ink: '#030407',
  mute: '#646f82',
  line: '#e6e9ef',
  cobalt: '#1558C9',
  cobaltSoft: '#e9f0fd',
  lime: '#D4FF24',
  limeInk: '#030407',
  artStroke: '#1558C9',
  artFill: '#dde7fb',
  artHighlight: '#D4FF24',
  dockBg: 'rgba(255, 255, 255, 0.94)',
  dockBorder: 'rgba(3, 4, 7, 0.08)',
  dockActiveBg: '#1558C9',
  dockActiveInk: '#ffffff',
  red: '#e5484d',
  heroTileBg: '#030407',
  heroSubColor: 'rgba(255, 255, 255, 0.68)',
};

export const darkColors: ThemeColors = {
  bg: '#030407',
  bgSoft: '#0b0e15',
  tile: '#10131c',
  tileHover: '#171b27',
  surface: '#0d1018',
  ink: '#f5f7fb',
  mute: '#8b95a7',
  line: '#1b2030',
  cobalt: '#1558C9',
  cobaltSoft: 'rgba(21, 88, 201, 0.22)',
  lime: '#D4FF24',
  limeInk: '#030407',
  artStroke: '#D4FF24',
  artFill: 'rgba(21, 88, 201, 0.42)',
  artHighlight: '#1558C9',
  dockBg: 'rgba(16, 19, 28, 0.94)',
  dockBorder: 'rgba(255, 255, 255, 0.09)',
  dockActiveBg: '#D4FF24',
  dockActiveInk: '#030407',
  red: '#ff5c61',
  heroTileBg: '#1558C9',
  heroSubColor: 'rgba(255, 255, 255, 0.80)',
};

export type ThemeMode = 'light' | 'dark' | 'system';

export interface SavedPlaceItem {
  name: string;
  sub: string;
}

export const DEFAULT_SAVED_PLACES: SavedPlaceItem[] = [
  { name: 'Aiyetoro Central', sub: 'Primary clinic, Ward 4, Ogun State' },
  { name: 'Demo PHC A', sub: 'Main dispensary store, Abeokuta North' },
  { name: 'Ota LGA store', sub: 'Regional cold & ambient hub' },
];

export interface AppConfigValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: ThemeColors;
  activeDelivery: boolean;
  setActiveDelivery: (v: boolean) => void;
  savedPlace: string;
  setSavedPlace: (place: string) => void;
  savedPlaces: SavedPlaceItem[];
  addSavedPlace: (place: SavedPlaceItem) => void;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  deliveryAlerts: boolean;
  setDeliveryAlerts: (v: boolean) => void;
  haptics: boolean;
  setHaptics: (v: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  shareLga: boolean;
  setShareLga: (v: boolean) => void;
  requireCode: boolean;
  setRequireCode: (v: boolean) => void;
  // Developer Menu & Simulation Controls
  uiScale: number;
  setUiScale: (scale: number) => void;
  artScale: number;
  setArtScale: (scale: number) => void;
  s: (size: number) => number;
  expectedPin: string;
  setExpectedPin: (pin: string) => void;
  courierSpeed: number;
  setCourierSpeed: (speed: number) => void;
  simCommodity: 'Zinc 20 mg' | 'ORS 20.5 g';
  setSimCommodity: (c: 'Zinc 20 mg' | 'ORS 20.5 g') => void;
  simEtaMin: number;
  setSimEtaMin: (min: number) => void;
  simOrsStock: number;
  setSimOrsStock: (qty: number) => void;
  simZincStock: number;
  setSimZincStock: (qty: number) => void;
  showSplash: boolean;
  setShowSplash: (v: boolean) => void;
  triggerSplash: () => void;
  resetDemoState: () => void;
}

const AppConfigContext = createContext<AppConfigValue>({
  themeMode: 'light',
  setThemeMode: () => {},
  isDark: false,
  colors: lightColors,
  activeDelivery: true,
  setActiveDelivery: () => {},
  savedPlace: 'Aiyetoro Central',
  setSavedPlace: () => {},
  savedPlaces: DEFAULT_SAVED_PLACES,
  addSavedPlace: () => {},
  walletBalance: 24500,
  setWalletBalance: () => {},
  deliveryAlerts: true,
  setDeliveryAlerts: () => {},
  haptics: true,
  setHaptics: () => {},
  reduceMotion: false,
  setReduceMotion: () => {},
  shareLga: true,
  setShareLga: () => {},
  requireCode: true,
  setRequireCode: () => {},
  uiScale: 1,
  setUiScale: () => {},
  artScale: 1,
  setArtScale: () => {},
  s: (n) => n,
  expectedPin: '5082',
  setExpectedPin: () => {},
  courierSpeed: 1,
  setCourierSpeed: () => {},
  simCommodity: 'Zinc 20 mg',
  setSimCommodity: () => {},
  simEtaMin: 4,
  setSimEtaMin: () => {},
  simOrsStock: 80,
  setSimOrsStock: () => {},
  simZincStock: 120,
  setSimZincStock: () => {},
  showSplash: true,
  setShowSplash: () => {},
  triggerSplash: () => {},
  resetDemoState: () => {},
});

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const sysScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [activeDelivery, setActiveDelivery] = useState<boolean>(true);
  const [savedPlace, setSavedPlace] = useState<string>('Aiyetoro Central');
  const [savedPlaces, setSavedPlaces] =
    useState<SavedPlaceItem[]>(DEFAULT_SAVED_PLACES);
  const [walletBalance, setWalletBalance] = useState<number>(24500);
  const [deliveryAlerts, setDeliveryAlerts] = useState<boolean>(true);
  const [haptics, setHaptics] = useState<boolean>(true);
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [shareLga, setShareLga] = useState<boolean>(true);
  const [requireCode, setRequireCode] = useState<boolean>(true);

  // Developer & Simulation controls
  const [uiScale, setUiScale] = useState<number>(1);
  const [artScale, setArtScale] = useState<number>(1);
  const [expectedPin, setExpectedPin] = useState<string>('5082');
  const [courierSpeed, setCourierSpeed] = useState<number>(1);
  const [simCommodity, setSimCommodity] = useState<'Zinc 20 mg' | 'ORS 20.5 g'>(
    'Zinc 20 mg',
  );
  const [simEtaMin, setSimEtaMin] = useState<number>(4);
  const [simOrsStock, setSimOrsStock] = useState<number>(80);
  const [simZincStock, setSimZincStock] = useState<number>(120);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && sysScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  const s = useCallback(
    (size: number) => Math.round(size * uiScale * 10) / 10,
    [uiScale],
  );

  const addSavedPlace = useCallback((place: SavedPlaceItem) => {
    setSavedPlaces((prev) =>
      prev.some((p) => p.name === place.name) ? prev : [...prev, place],
    );
    setSavedPlace(place.name);
  }, []);

  const triggerSplash = useCallback(() => {
    setShowSplash(true);
  }, []);

  const resetDemoState = useCallback(() => {
    setActiveDelivery(true);
    setSavedPlace('Aiyetoro Central');
    setSavedPlaces(DEFAULT_SAVED_PLACES);
    setWalletBalance(24500);
    setDeliveryAlerts(true);
    setHaptics(true);
    setReduceMotion(false);
    setShareLga(true);
    setRequireCode(true);
    setUiScale(1);
    setArtScale(1);
    setExpectedPin('5082');
    setCourierSpeed(1);
    setSimCommodity('Zinc 20 mg');
    setSimEtaMin(4);
    setSimOrsStock(80);
    setSimZincStock(120);
  }, []);

  const value = useMemo<AppConfigValue>(
    () => ({
      themeMode,
      setThemeMode,
      isDark,
      colors,
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
      s,
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
      showSplash,
      setShowSplash,
      triggerSplash,
      resetDemoState,
    }),
    [
      themeMode,
      isDark,
      colors,
      activeDelivery,
      savedPlace,
      savedPlaces,
      addSavedPlace,
      walletBalance,
      deliveryAlerts,
      haptics,
      reduceMotion,
      shareLga,
      requireCode,
      uiScale,
      artScale,
      s,
      expectedPin,
      courierSpeed,
      simCommodity,
      simEtaMin,
      simOrsStock,
      simZincStock,
      showSplash,
      triggerSplash,
      resetDemoState,
    ],
  );

  return React.createElement(AppConfigContext.Provider, { value }, children);
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}

// Keep legacy theme object for any shared helper compatibility
export const theme = {
  colors: {
    canvas: '#f8fbff',
    surface: '#ffffff',
    ink: '#030407',
    muted: '#646f82',
    mutedLight: '#8da2b5',
    line: '#e6e9ef',
    primary: '#1558C9',
    primaryDeep: '#030407',
    primarySoft: '#e9f0fd',
    green: '#12a36b',
    greenSoft: '#d1fae5',
    amber: '#f59e0b',
    amberSoft: '#fef3c7',
    red: '#e5484d',
    redSoft: '#fee2e2',
    neutralSoft: '#f1f5f9',
  },
  borders: {
    thin: 1.5,
    normal: 2,
    thick: 3,
    color: '#030407',
  },
  radii: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  shadows: {
    xs: {
      shadowColor: '#030407',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    sm: {
      shadowColor: '#030407',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    md: {
      shadowColor: '#030407',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
  },
};
