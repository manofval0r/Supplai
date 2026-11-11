import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useColorScheme } from 'react-native';

export const palette = {
  midnight: '#071811',
  forest: '#0B5240',
  orange: '#FF8A4C',
  yellow: '#FFC700',
  pink: '#F6B7C7',
  sky: '#A8DDF0',
  lavender: '#D4C5F1',
  mint: '#BFE5D0',
  cobalt: '#0B5240',
  lime: '#FFC700',
  limeInk: '#17140C',
  red: '#B42318',
  green: '#0B5240',
};

export const designTokens = {
  colors: {
    ...palette,
    cream: '#FFF4D6',
    white: '#FFFFFF',
    black: '#000000',
    ink: '#111410',
    muted: '#4B5A51',
    onBright: '#111410',
    bodyOnBright: '#302419',
    line: '#D8CBB1',
  },
  font: {
    family: 'Inter',
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semi: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, section: 88 },
  radius: { sm: 12, md: 20, lg: 24, pill: 999 },
  border: { card: 2, ink: '#111410' },
  motion: { fast: 150, base: 250 },
} as const;

export const ui = {
  ink: designTokens.colors.ink,
  mute: designTokens.colors.muted,
  line: designTokens.colors.line,
  accent: palette.forest,
  cobalt: palette.forest,
  lime: palette.yellow,
  green: palette.forest,
  red: palette.red,
  fillSoft: designTokens.colors.cream,
  tint: palette.mint,
  font: designTokens.font,
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
  forest: string;
  orange: string;
  yellow: string;
  pink: string;
  sky: string;
  lavender: string;
  mint: string;
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
  bg: designTokens.colors.cream,
  bgSoft: '#FFF0CC',
  tile: '#ffffff',
  tileHover: '#FFF9E8',
  surface: '#ffffff',
  ink: designTokens.colors.ink,
  mute: designTokens.colors.muted,
  line: designTokens.colors.line,
  forest: palette.forest,
  orange: palette.orange,
  yellow: palette.yellow,
  pink: palette.pink,
  sky: palette.sky,
  lavender: palette.lavender,
  mint: palette.mint,
  cobalt: palette.forest,
  cobaltSoft: '#DDECE4',
  lime: palette.yellow,
  limeInk: '#17140C',
  artStroke: palette.forest,
  artFill: '#DDECE4',
  artHighlight: palette.yellow,
  dockBg: 'rgba(255, 255, 255, 0.94)',
  dockBorder: 'rgba(17, 20, 16, 0.16)',
  dockActiveBg: palette.forest,
  dockActiveInk: '#ffffff',
  red: palette.red,
  heroTileBg: palette.forest,
  heroSubColor: 'rgba(255, 255, 255, 0.82)',
};

export const darkColors: ThemeColors = {
  bg: '#081811',
  bgSoft: '#0D2118',
  tile: '#13271E',
  tileHover: '#1B3428',
  surface: '#102219',
  ink: '#F8F5EC',
  mute: '#C4CEC5',
  line: '#30463A',
  forest: '#16745A',
  orange: '#FF9A64',
  yellow: '#FFD44D',
  pink: '#F6B7C7',
  sky: '#A8DDF0',
  lavender: '#D4C5F1',
  mint: '#BFE5D0',
  cobalt: '#16745A',
  cobaltSoft: 'rgba(22, 116, 90, 0.25)',
  lime: '#FFD44D',
  limeInk: '#17140C',
  artStroke: '#BFE5D0',
  artFill: 'rgba(22, 116, 90, 0.36)',
  artHighlight: '#FFD44D',
  dockBg: 'rgba(19, 39, 30, 0.96)',
  dockBorder: 'rgba(255, 255, 255, 0.09)',
  dockActiveBg: '#FFD44D',
  dockActiveInk: '#17140C',
  red: '#FF8A80',
  heroTileBg: '#0B5240',
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
    canvas: designTokens.colors.cream,
    surface: '#ffffff',
    ink: designTokens.colors.ink,
    muted: designTokens.colors.muted,
    mutedLight: '#68756D',
    line: designTokens.colors.line,
    primary: palette.forest,
    primaryDeep: '#071811',
    primarySoft: '#DDECE4',
    green: palette.forest,
    greenSoft: '#DDECE4',
    amber: palette.orange,
    amberSoft: '#FFF0CC',
    red: palette.red,
    redSoft: '#FCE4DF',
    neutralSoft: designTokens.colors.cream,
  },
  borders: {
    thin: 1.5,
    normal: 2,
    thick: 3,
    color: designTokens.border.ink,
  },
  radii: {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 24,
    full: designTokens.radius.pill,
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
