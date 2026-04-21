/**
 * Toast ligero. Un provider monta una capa absoluta y expone `showToast`.
 * Se puede llamar desde cualquier parte con `useToast().show("mensaje")`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "./Text";
import { colors } from "@/lib/theme";

type ToastKind = "info" | "success" | "error";

type ToastShow = (
  message: string,
  opts?: { kind?: ToastKind; durationMs?: number }
) => void;

const Ctx = createContext<{ show: ToastShow } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string>("");
  const [kind, setKind] = useState<ToastKind>("info");
  const y = useSharedValue(80);
  const opacity = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    y.value = withTiming(80, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 });
  }, [y, opacity]);

  const show: ToastShow = useCallback(
    (message, opts) => {
      if (timer.current) clearTimeout(timer.current);
      setMsg(message);
      setKind(opts?.kind ?? "info");
      opacity.value = withTiming(1, { duration: 220 });
      y.value = withSpring(0, { damping: 15, stiffness: 220 });
      const dur = opts?.durationMs ?? 2600;
      timer.current = setTimeout(() => {
        runOnJS(hide)();
      }, dur);
    },
    [hide, opacity, y]
  );

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  const bg =
    kind === "success"
      ? colors.accent
      : kind === "error"
        ? colors.brand
        : colors.ink;

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 100,
            alignItems: "center",
          },
          style,
        ]}
      >
        <View
          style={{
            backgroundColor: bg,
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderRadius: 9999,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            maxWidth: "100%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Ionicons
            name={
              kind === "success"
                ? "checkmark-circle"
                : kind === "error"
                  ? "alert-circle"
                  : "information-circle"
            }
            size={18}
            color="#fff"
          />
          <Text style={{ color: "#fff", fontWeight: "600", flexShrink: 1 }}>
            {msg}
          </Text>
        </View>
      </Animated.View>
    </Ctx.Provider>
  );
}

export function useToast(): { show: ToastShow } {
  const ctx = useContext(Ctx);
  if (!ctx) return { show: () => {} };
  return ctx;
}
