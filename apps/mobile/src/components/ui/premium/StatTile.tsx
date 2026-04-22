import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "../Text";
import { colors } from "@/lib/theme";
import { GradientFill } from "./GradientFill";
import { TiltPressable } from "./TiltPressable";

type Tone = "brand" | "sunrise" | "ocean" | "forest";

type Props = {
  label: string;
  value: number;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: Tone;
  onPress?: () => void;
  delay?: number;
  subtitle?: string;
};

/**
 * StatTile — hero metric card with animated reveal and gradient accent.
 */
export function StatTile({
  label,
  value,
  icon = "sparkles",
  tone = "brand",
  onPress,
  delay = 0,
  subtitle,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, t]);

  const appear = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * 14 }, { scale: 0.97 + 0.03 * t.value }],
  }));

  const presetKey = tone === "brand" ? "brand" : tone === "ocean" ? "ocean" : tone === "forest" ? "forest" : "sunrise";

  return (
    <Animated.View style={[{ flex: 1 }, appear]}>
      <TiltPressable
        onPress={onPress}
        style={{
          flex: 1,
          borderRadius: 28,
          overflow: "hidden",
          shadowColor: "#0a1a2b",
          shadowOpacity: 0.1,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 12 },
          elevation: 6,
        }}
      >
        <View
          style={{
            borderRadius: 28,
            overflow: "hidden",
            backgroundColor: "rgba(255,255,255,0.88)",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "rgba(255,255,255,0.7)",
            paddingVertical: 18,
            paddingHorizontal: 18,
            minHeight: 122,
            justifyContent: "space-between",
          }}
        >
          <GradientFill
            preset={presetKey}
            style={{
              position: "absolute",
              top: -38,
              right: -38,
              width: 116,
              height: 116,
              borderRadius: 58,
              opacity: 0.85,
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.85)",
              }}
            >
              <Ionicons name={icon} size={15} color={colors.brandInk} />
            </View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: colors.inkSoft,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {label}
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: 40,
                fontWeight: "800",
                color: colors.ink,
                letterSpacing: -1,
                lineHeight: 46,
              }}
            >
              {value}
            </Text>
            {subtitle ? (
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      </TiltPressable>
    </Animated.View>
  );
}
