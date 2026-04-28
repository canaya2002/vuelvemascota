/**
 * Input premium nativo. Diseño:
 *
 *  - Card flotante con borde sutil que se intensifica al focus.
 *  - Label arriba en uppercase mini (estilo Apple/Linear).
 *  - Highlight ring suave al enfocar (no glow chillón).
 *  - Error state: borde brand + texto pequeño debajo.
 *  - Icono leading opcional con espacio reservado.
 *  - Trailing slot para iconos action (eye toggle, clear, etc.).
 *  - Animación de focus con react-native-reanimated.
 */

import { forwardRef, useState, type ReactNode } from "react";
import {
  TextInput,
  type TextInputProps,
  View,
  type StyleProp,
  type ViewStyle,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./Text";
import { colors } from "@/lib/theme";

type Props = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Icono a la izquierda del input (Ionicons o cualquier ReactNode). */
  leading?: ReactNode;
  /** Icono / botón al final (eye toggle, clear, etc.). */
  trailing?: ReactNode;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  {
    label,
    helper,
    error,
    containerStyle,
    style,
    leading,
    trailing,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: focus.value * 0.18,
    transform: [{ scale: 0.98 + focus.value * 0.02 }],
  }));

  return (
    <View style={[{ gap: 7 }, containerStyle]}>
      {label ? (
        <Text
          style={{
            fontSize: 11.5,
            fontWeight: "700",
            color: error ? colors.brand : colors.muted,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      ) : null}

      <View>
        {/* Halo anillado al focus (debajo del card). */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              borderRadius: 16,
              backgroundColor: error ? colors.brand : colors.ink,
            },
            ringStyle,
          ]}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: error
              ? colors.brand
              : focused
                ? colors.ink
                : colors.line,
            paddingHorizontal: leading ? 12 : 14,
            // Sombra muy sutil cuando NO focused (eleva del fondo cream)
            shadowColor: colors.ink,
            shadowOpacity: focused ? 0 : 0.04,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 0,
          }}
        >
          {leading ? (
            <View style={{ marginRight: 10, opacity: 0.7 }}>{leading}</View>
          ) : null}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.muted}
            selectionColor={colors.brand}
            cursorColor={colors.brand}
            style={[
              {
                flex: 1,
                paddingVertical: Platform.OS === "ios" ? 14 : 11,
                fontSize: 16,
                color: colors.ink,
                fontWeight: "500",
                letterSpacing: -0.005,
              },
              style,
            ]}
            onFocus={(e) => {
              setFocused(true);
              focus.value = withTiming(1, { duration: 200 });
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              focus.value = withTiming(0, { duration: 200 });
              onBlur?.(e);
            }}
            {...rest}
          />
          {trailing ? <View style={{ marginLeft: 8 }}>{trailing}</View> : null}
        </View>
      </View>

      {error ? (
        <Text
          style={{
            color: colors.brand,
            fontSize: 12.5,
            fontWeight: "500",
            marginTop: 1,
          }}
        >
          {error}
        </Text>
      ) : helper ? (
        <Text style={{ color: colors.muted, fontSize: 12.5, marginTop: 1 }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
});
