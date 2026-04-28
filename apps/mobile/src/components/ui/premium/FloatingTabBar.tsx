import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { colors } from "@/lib/theme";
import * as haptics from "@/lib/haptics";
import { Text } from "../Text";
import { GradientFill } from "./GradientFill";

type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<string, { focused: IconName; unfocused: IconName; label: string }> = {
  index: { focused: "home", unfocused: "home-outline", label: "Inicio" },
  casos: { focused: "paw", unfocused: "paw-outline", label: "Casos" },
  reportar: { focused: "add", unfocused: "add", label: "Reportar" },
  alertas: { focused: "notifications", unfocused: "notifications-outline", label: "Alertas" },
  perfil: { focused: "person-circle", unfocused: "person-circle-outline", label: "Perfil" },
};

/**
 * FloatingTabBar — custom tab bar rendered as a glass pill floating above
 * the bottom safe area. Active tab gets a gradient "blob" highlighter that
 * springs between positions.
 */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const count = state.routes.length;
  const indicatorX = useSharedValue(state.index);

  useEffect(() => {
    indicatorX.value = withSpring(state.index, { damping: 18, stiffness: 180 });
  }, [indicatorX, state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${(indicatorX.value / count) * 100}%`,
    width: `${100 / count}%`,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: 14,
        paddingBottom: Platform.OS === "ios" ? 26 : 14,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 36,
          overflow: "hidden",
          shadowColor: "#0a1a2b",
          shadowOpacity: 0.22,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 16 },
          elevation: 14,
        }}
      >
        {Platform.OS === "ios" ? (
          <BlurView intensity={72} tint="light" style={StyleSheet.absoluteFillObject} />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(255,255,255,0.92)" },
            ]}
          />
        )}

        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: 36,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "rgba(255,255,255,0.8)",
          }}
          pointerEvents="none"
        />

        {/* Animated gradient indicator */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 7,
              bottom: 7,
              borderRadius: 22,
              paddingHorizontal: 4,
            },
            indicatorStyle,
          ]}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 22,
              overflow: "hidden",
              marginHorizontal: 5,
              shadowColor: colors.brand,
              shadowOpacity: 0.4,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 5 },
              elevation: 8,
            }}
          >
            <GradientFill preset="brand" style={StyleSheet.absoluteFillObject} />
          </View>
        </Animated.View>

        <View style={{ flexDirection: "row", paddingVertical: 7, paddingHorizontal: 4 }}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const spec = ICONS[route.name] ?? { focused: "ellipse", unfocused: "ellipse-outline", label: route.name };
            const focused = state.index === index;

            const onPress = () => {
              haptics.tap();
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : typeof options.title === "string"
                  ? options.title
                  : spec.label;

            return (
              <TabItem
                key={route.key}
                focused={focused}
                iconFocused={spec.focused}
                iconUnfocused={spec.unfocused}
                label={label}
                onPress={onPress}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabItem({
  focused,
  iconFocused,
  iconUnfocused,
  label,
  onPress,
  accessibilityLabel,
}: {
  focused: boolean;
  iconFocused: IconName;
  iconUnfocused: IconName;
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const scale = useSharedValue(focused ? 1 : 0.94);
  const lift = useSharedValue(focused ? -2 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.94, { damping: 14, stiffness: 220 });
    lift.value = withTiming(focused ? -2 : 0, { duration: 260 });
  }, [focused, lift, scale]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  const iconColor = focused ? "#ffffff" : colors.inkSoft;
  const textColor = focused ? "#ffffff" : colors.inkSoft;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 4,
      }}
    >
      <Animated.View
        style={[
          { alignItems: "center", gap: 3 },
          animated,
        ]}
      >
        <Ionicons
          name={focused ? iconFocused : iconUnfocused}
          size={20}
          color={iconColor}
        />
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: textColor,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
