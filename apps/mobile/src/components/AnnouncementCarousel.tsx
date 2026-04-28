/**
 * AnnouncementCarousel — banner rotativo con cross-fade suave.
 *
 * Diseño:
 *  - Auto-rota cada N segundos (default 5s).
 *  - Transición opacity 0 → 1 con curva suave (no slide rudo).
 *  - Pausa al tocar (te da chance de leer y tap).
 *  - Cada anuncio es navegable a una ruta.
 *  - Indicadores de progreso minimales abajo (puntitos).
 *
 * Ojo: Reanimated 3 worklets — sin importar `react-native-worklets` separado.
 */

import { useEffect, useRef, useState } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { colors } from "@/lib/theme";
import { Text } from "./ui";
import * as haptics from "@/lib/haptics";

export type Announcement = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Tono del badge del icono. */
  tone?: "brand" | "success" | "ink";
  /** Línea principal — mantenla corta, ~50 chars máx. */
  title: string;
  /** Subtexto opcional, ~70 chars. */
  description?: string;
  href?: string;
};

type Props = {
  items: Announcement[];
  intervalMs?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnnouncementCarousel({
  items,
  intervalMs = 5000,
  style,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const opacity = useSharedValue(1);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const timer = setInterval(() => {
      // Fade out → swap → fade in
      opacity.value = withTiming(
        0,
        { duration: 320, easing: Easing.out(Easing.quad) },
        (finished) => {
          if (!finished) return;
          // Update index on JS thread via runOnJS would be cleaner, but a
          // simple setTimeout with native fade works for this use case.
        }
      );
      setTimeout(() => {
        const next = (indexRef.current + 1) % items.length;
        setIndex(next);
        opacity.value = withTiming(1, {
          duration: 480,
          easing: Easing.out(Easing.cubic),
        });
      }, 340);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, paused, intervalMs, opacity]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (items.length === 0) return null;

  const item = items[index];
  const toneBg =
    item.tone === "success"
      ? colors.successSoft
      : item.tone === "ink"
        ? colors.bgAlt
        : colors.brandSoft;
  const toneFg =
    item.tone === "success"
      ? colors.success
      : item.tone === "ink"
        ? colors.ink
        : colors.brandInk;

  return (
    <View style={style}>
      <Pressable
        onPressIn={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
        onPress={() => {
          if (!item.href) return;
          haptics.tap();
          router.push(item.href as never);
        }}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          minHeight: 76,
          shadowColor: colors.ink,
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: toneBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Animated.View style={fadeStyle}>
            <Ionicons name={item.icon} size={22} color={toneFg} />
          </Animated.View>
        </View>

        <Animated.View style={[fadeStyle, { flex: 1 }]}>
          <Text
            style={{
              fontSize: 14.5,
              fontWeight: "700",
              color: colors.ink,
              letterSpacing: -0.2,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text
              style={{
                fontSize: 12.5,
                color: colors.inkSoft,
                marginTop: 2,
                lineHeight: 17,
              }}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}
        </Animated.View>

        {item.href ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.bgAlt,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-forward" size={14} color={colors.inkSoft} />
          </View>
        ) : null}
      </Pressable>

      {items.length > 1 ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
            marginTop: 10,
          }}
        >
          {items.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => {
                opacity.value = withTiming(0, { duration: 200 }, () => {});
                setTimeout(() => {
                  setIndex(i);
                  opacity.value = withTiming(1, { duration: 360 });
                }, 220);
                haptics.light();
              }}
              hitSlop={6}
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === index ? colors.brand : colors.lineStrong,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
