/**
 * Input con estilo unificado. Soporta label + helper/error text.
 */

import { forwardRef } from "react";
import {
  TextInput,
  type TextInputProps,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "./Text";
import { colors, presets } from "@/lib/theme";

type Props = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, helper, error, containerStyle, style, ...rest },
  ref
) {
  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text
          variant="eyebrow"
          style={{ color: colors.muted, textTransform: "none" }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        style={[
          presets.input,
          error ? { borderColor: colors.brand } : null,
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={{ color: colors.brand, fontSize: 13 }}>{error}</Text>
      ) : helper ? (
        <Text style={{ color: colors.muted, fontSize: 13 }}>{helper}</Text>
      ) : null}
    </View>
  );
});
