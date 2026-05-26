import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type LoadingStateProps = {
  title: string;
  subtitle?: string;
  cards?: number;
  compact?: boolean;
};

export function LoadingState({ title, subtitle, cards = 3, compact = false }: LoadingStateProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Animated.View style={[styles.pulseRing, { opacity }]} />
      <View style={styles.headerBlock}>
        <View style={styles.lineTitle} />
        <View style={styles.lineSubtitle} />
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.cardList}>
        {Array.from({ length: cards }).map((_, index) => (
          <View key={index} style={styles.card}>
            <Animated.View style={[styles.cardImage, { opacity }]} />
            <View style={styles.cardBody}>
              <Animated.View style={[styles.lineLong, { opacity }]} />
              <Animated.View style={[styles.lineMedium, { opacity }]} />
              <View style={styles.row}>
                <Animated.View style={[styles.badge, { opacity }]} />
                <Animated.View style={[styles.badgeShort, { opacity }]} />
              </View>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.label}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 18,
    gap: 14,
  },
  wrapCompact: {
    paddingVertical: 10,
  },
  pulseRing: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "rgba(245, 158, 11, 0.18)",
  },
  headerBlock: {
    gap: 10,
  },
  lineTitle: {
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.25)",
    width: "58%",
    alignSelf: "center",
  },
  lineSubtitle: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    width: "78%",
    alignSelf: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
  },
  cardList: {
    gap: 12,
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  cardImage: {
    height: 156,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
  },
  cardBody: {
    padding: 14,
    gap: 10,
  },
  lineLong: {
    height: 16,
    borderRadius: 999,
    width: "78%",
    backgroundColor: "rgba(148, 163, 184, 0.22)",
  },
  lineMedium: {
    height: 12,
    borderRadius: 999,
    width: "52%",
    backgroundColor: "rgba(148, 163, 184, 0.18)",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    height: 28,
    flex: 1,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
  },
  badgeShort: {
    height: 28,
    width: 88,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.14)",
  },
  label: {
    textAlign: "center",
    color: "#0f172a",
    fontWeight: "700",
  },
});