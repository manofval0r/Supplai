import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { ui, useAppConfig } from '../lib/theme';
import { Art, HomeCorridorScene } from './LineArt';

export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const { reduceMotion } = useAppConfig();

  const masterOpacity = useRef(new Animated.Value(1)).current;
  const skyTranslateY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const hillsTranslateY = useRef(new Animated.Value(30)).current;
  const corridorTranslateY = useRef(new Animated.Value(0)).current;
  const corridorScale = useRef(new Animated.Value(1.06)).current;

  const cloudDriftA = useRef(new Animated.Value(0)).current;
  const cloudDriftB = useRef(new Animated.Value(0)).current;
  const curbScroll = useRef(new Animated.Value(0)).current;
  const exitingRef = useRef(false);

  const triggerExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;

    if (reduceMotion) {
      onFinish();
      return;
    }

    Animated.parallel([
      Animated.timing(skyTranslateY, {
        toValue: -46,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 0.92,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.timing(hillsTranslateY, {
        toValue: 90,
        duration: 520,
        useNativeDriver: true,
      }),
      // Morph the splash bottom corridor directly into the Home screen's bottom corridor slot
      Animated.spring(corridorTranslateY, {
        toValue: -18,
        useNativeDriver: true,
        stiffness: 180,
        damping: 22,
        mass: 0.8,
      }),
      Animated.spring(corridorScale, {
        toValue: 1,
        useNativeDriver: true,
        stiffness: 180,
        damping: 22,
        mass: 0.8,
      }),
      Animated.timing(masterOpacity, {
        toValue: 0,
        duration: 540,
        delay: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, [
    reduceMotion,
    onFinish,
    skyTranslateY,
    logoScale,
    hillsTranslateY,
    corridorTranslateY,
    corridorScale,
    masterOpacity,
  ]);

  useEffect(() => {
    // Entrance spring for logo & bottom 2D landscape
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        stiffness: 210,
        damping: 18,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.spring(hillsTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        stiffness: 180,
        damping: 20,
      }),
    ]).start();

    // Ambient cloud & 2D art loops
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudDriftA, {
          toValue: 1,
          duration: 3600,
          useNativeDriver: true,
        }),
        Animated.timing(cloudDriftA, {
          toValue: 0,
          duration: 3600,
          useNativeDriver: true,
        }),
      ]),
    );

    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudDriftB, {
          toValue: 1,
          duration: 4200,
          useNativeDriver: true,
        }),
        Animated.timing(cloudDriftB, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: true,
        }),
      ]),
    );

    const loopCurb = Animated.loop(
      Animated.timing(curbScroll, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    );

    if (!reduceMotion) {
      loopA.start();
      loopB.start();
      loopCurb.start();
    }

    const timer = setTimeout(() => {
      triggerExit();
    }, 2350);

    return () => {
      clearTimeout(timer);
      loopA.stop();
      loopB.stop();
      loopCurb.stop();
    };
  }, [
    logoScale,
    logoOpacity,
    hillsTranslateY,
    cloudDriftA,
    cloudDriftB,
    curbScroll,
    reduceMotion,
    triggerExit,
  ]);

  const driftX1 = cloudDriftA.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 18],
  });
  const driftY1 = cloudDriftA.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  });
  const driftX2 = cloudDriftB.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -16],
  });
  const curbTranslateX = curbScroll.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -48],
  });

  // generated fence ticks for the Chowdeck-inspired horizon ridge
  const leftTicks = Array.from({ length: 18 }, (_, i) => 28 + i * 5.5);
  const rightTicks = Array.from({ length: 18 }, (_, i) => 232 + i * 5.5);

  return (
    <Animated.View style={[styles.overlay, { opacity: masterOpacity }]}>
      <Pressable style={styles.pressFill} onPress={triggerExit}>
        {/* Animated Upper Sky with 2D Clouds & Medical Line Art */}
        <Animated.View
          style={[
            styles.skyContainer,
            { transform: [{ translateY: skyTranslateY }] },
          ]}
        >
          {/* Top-left large cloud */}
          <Animated.View
            style={[
              styles.cloudTopLeft,
              { transform: [{ translateX: driftX1 }] },
            ]}
          >
            <Svg width={130} height={74} viewBox="0 0 130 74">
              <Path
                d="M18 58 H104 A16 16 0 0 0 104 28 A22 22 0 0 0 64 16 A26 26 0 0 0 16 32 A14 14 0 0 0 18 58 Z"
                fill="#1558C9"
                fillOpacity={0.22}
                stroke="#D4FF24"
                strokeOpacity={0.35}
                strokeWidth={1.5}
              />
            </Svg>
          </Animated.View>

          {/* Upper-center silhouette cloud */}
          <Animated.View
            style={[
              styles.cloudUpperCenter,
              { transform: [{ translateX: driftX2 }] },
            ]}
          >
            <Svg width={120} height={44} viewBox="0 0 120 44">
              <Path
                d="M12 36 H108 C108 24 96 18 86 20 C80 10 64 8 54 16 C44 12 30 16 26 24 C18 24 12 29 12 36 Z"
                fill="#1558C9"
                fillOpacity={0.32}
              />
            </Svg>
          </Animated.View>

          {/* Right mid cloud */}
          <Animated.View
            style={[
              styles.cloudMidRight,
              { transform: [{ translateX: driftX1 }] },
            ]}
          >
            <Svg width={90} height={36} viewBox="0 0 90 36">
              <Path
                d="M10 30 H80 C80 20 70 16 62 18 C56 10 42 10 36 17 C26 15 16 20 10 30 Z"
                fill="#1558C9"
                fillOpacity={0.26}
              />
            </Svg>
          </Animated.View>

          {/* Floating 2D Line Art in the Sky */}
          <Animated.View
            style={[
              styles.skyArtLeft,
              {
                transform: [
                  { translateY: driftY1 },
                  { translateX: driftX1 },
                  { rotate: '-12deg' },
                ],
              },
            ]}
          >
            <Art
              name="sachet"
              size={76}
              color="#D4FF24"
              fill="#1558C9"
              hlColor="rgba(21,88,201,0.45)"
              withHighlight
              opacity={0.55}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.skyArtRight,
              {
                transform: [
                  { translateY: driftY1 },
                  { translateX: driftX2 },
                  { rotate: '14deg' },
                ],
              },
            ]}
          >
            <Art
              name="pills"
              size={80}
              color="#D4FF24"
              fill="#1558C9"
              hlColor="rgba(21,88,201,0.45)"
              withHighlight
              opacity={0.55}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.skyArtRoute,
              { transform: [{ translateY: driftY1 }] },
            ]}
          >
            <Art
              name="route"
              size={72}
              color="#D4FF24"
              fill="#1558C9"
              opacity={0.35}
            />
          </Animated.View>
        </Animated.View>

        {/* Centered Brand Mark (Chowdeck-inspired layout for Supplai) */}
        <Animated.View
          style={[
            styles.centerBrand,
            {
              opacity: logoOpacity,
              transform: [{ translateY: skyTranslateY }, { scale: logoScale }],
            },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Svg width={36} height={36} viewBox="0 0 36 36">
                <Circle cx="18" cy="18" r="16" fill="#D4FF24" />
                <Path d="M4 30 L11 25 L8 21 Z" fill="#D4FF24" />
                <Path
                  d="M18 11 V25 M11 18 H25"
                  stroke="#030407"
                  strokeWidth={3.6}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <Text style={styles.brandWordmark}>Supplai</Text>
          </View>
          <View style={styles.brandTagPill}>
            <Text style={styles.brandTagText}>
              CLINIC-TO-CLINIC MEDICINE CORRIDOR
            </Text>
          </View>
        </Animated.View>

        {/* Bottom 2D Animated Horizon, Rolling Hills & Corridor Scene */}
        <View style={styles.bottomStage}>
          {/* Rolling Hills & Horizon Ridge (fades/glides on exit) */}
          <Animated.View
            style={[
              styles.hillsWrap,
              { transform: [{ translateY: hillsTranslateY }] },
            ]}
          >
            <Svg width="100%" height={175} viewBox="0 0 360 175">
              {/* Horizon vertical corridor picket ticks */}
              <G stroke="#D4FF24" strokeOpacity={0.55} strokeWidth={1.2}>
                {leftTicks.map((x, idx) => (
                  <Path
                    key={`lt-${idx}`}
                    d={`M${x} ${64 - Math.sin(idx * 0.18) * 6} V${86}`}
                  />
                ))}
                {rightTicks.map((x, idx) => (
                  <Path
                    key={`rt-${idx}`}
                    d={`M${x} ${60 + Math.sin(idx * 0.18) * 6} V${86}`}
                  />
                ))}
              </G>

              {/* Back rolling hill */}
              <Path
                d="M-20 110 Q 180 42 380 110 L380 175 L-20 175 Z"
                fill="#0A1936"
              />
              {/* Mid rolling hill */}
              <Path
                d="M-20 128 Q 110 78 250 118 T 380 120 L380 175 L-20 175 Z"
                fill="#0F2552"
              />
              {/* stylized 2D trees / canopies along the corridor */}
              <G fill="#1558C9" fillOpacity={0.55}>
                <Circle cx="52" cy="116" r="22" />
                <Circle cx="74" cy="122" r="16" />
                <Circle cx="154" cy="118" r="20" />
                <Circle cx="182" cy="115" r="23" />
                <Circle cx="288" cy="118" r="24" />
                <Circle cx="316" cy="122" r="18" />
              </G>
              {/* Foreground dark corridor stage */}
              <Rect x="0" y="126" width="360" height="49" fill="#030407" />
            </Svg>
          </Animated.View>

          {/* The Live 2D Moving Corridor Scene — positioned so it aligns with Home's bottom corridor */}
          <Animated.View
            style={[
              styles.corridorAnchor,
              {
                transform: [
                  { translateY: corridorTranslateY },
                  { scale: corridorScale },
                ],
              },
            ]}
          >
            <HomeCorridorScene forceDark height={68} />
          </Animated.View>

          {/* Animated scrolling curb bar at the very bottom (like Chowdeck's bottom track) */}
          <Animated.View
            style={[
              styles.curbWrap,
              { transform: [{ translateY: hillsTranslateY }] },
            ]}
          >
            <Animated.View
              style={[
                styles.curbStrip,
                { transform: [{ translateX: curbTranslateX }] },
              ]}
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <View key={i} style={styles.curbSegment}>
                  <View style={styles.curbLight} />
                  <View style={styles.curbDark} />
                </View>
              ))}
            </Animated.View>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#030407',
    zIndex: 999,
  },
  pressFill: {
    flex: 1,
    justifyContent: 'space-between',
  },
  skyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cloudTopLeft: {
    position: 'absolute',
    top: 18,
    left: -18,
  },
  cloudUpperCenter: {
    position: 'absolute',
    top: 138,
    alignSelf: 'center',
  },
  cloudMidRight: {
    position: 'absolute',
    top: 230,
    right: -12,
  },
  skyArtLeft: {
    position: 'absolute',
    top: 96,
    left: 26,
  },
  skyArtRight: {
    position: 'absolute',
    top: 88,
    right: 24,
  },
  skyArtRoute: {
    position: 'absolute',
    top: 190,
    left: 44,
  },
  centerBrand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWordmark: {
    fontFamily: ui.font.bold,
    fontSize: 38,
    color: '#F4F7FF',
    letterSpacing: -1.1,
    paddingRight: 4,
  },
  brandTagPill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(21, 88, 201, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(212, 255, 36, 0.35)',
  },
  brandTagText: {
    fontFamily: ui.font.bold,
    fontSize: 10,
    letterSpacing: 1.1,
    color: '#D4FF24',
  },
  bottomStage: {
    width: '100%',
    height: 195,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  hillsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
  },
  corridorAnchor: {
    width: '100%',
    paddingHorizontal: 18,
    marginBottom: 74, // Matches the Home screen corridor position right above FloatingDock
  },
  curbWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#1558C9',
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderTopColor: '#D4FF24',
  },
  curbStrip: {
    flexDirection: 'row',
    width: 700,
    height: '100%',
  },
  curbSegment: {
    flexDirection: 'row',
    width: 48,
    height: '100%',
  },
  curbLight: {
    width: 24,
    height: '100%',
    backgroundColor: '#D4FF24',
  },
  curbDark: {
    width: 24,
    height: '100%',
    backgroundColor: '#030407',
  },
});
