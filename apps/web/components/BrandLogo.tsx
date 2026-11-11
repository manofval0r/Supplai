import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { ui } from '../lib/theme';

export function BrandLogo({ size = 24 }: { size?: number }) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <Rect width="40" height="40" rx="11" fill="#0b1220" />
        <Path
          d="M26 13.5c0-2.5-2.6-4-6-4s-6.5 1.5-6.5 4.2c0 6.3 13 3.2 13 9.8 0 2.7-3 4.5-6.8 4.5s-6.7-1.6-6.7-4.2"
          stroke="#ffffff"
          strokeWidth={3.6}
          strokeLinecap="round"
        />
        <Path
          d="M20 4.5v5M20 30.5v5"
          stroke="#4d86ff"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.word}>{'Supplai\u00A0'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  word: {
    fontFamily: ui.font.bold,
    fontSize: 15,
    color: ui.ink,
  },
});
