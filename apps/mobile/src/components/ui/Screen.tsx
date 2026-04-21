/**
 * Screen — contenedor base de cada pantalla. Añade:
 *  - SafeArea (top + bottom configurable).
 *  - Fondo (por default `bg` del theme, pero overrideable).
 *  - StatusBar adaptativo según fondo.
 *  - Scroll opcional con keyboard avoidance en iOS.
 */

import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/lib/theme";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Array<"top" | "bottom">;
  background?: string;
  statusBar?: "light" | "dark" | "auto";
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  keyboardOffset?: number;
};

export function Screen({
  children,
  scroll = false,
  edges = ["top"],
  background = colors.bg,
  statusBar = "dark",
  padded = true,
  contentStyle,
  keyboardOffset = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const top = edges.includes("top") ? insets.top : 0;
  const bottom = edges.includes("bottom") ? insets.bottom : 0;

  const innerStyle: StyleProp<ViewStyle> = [
    {
      flex: 1,
      paddingTop: top,
      paddingBottom: bottom,
      paddingHorizontal: padded ? 20 : 0,
    },
    contentStyle,
  ];

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[{ flexGrow: 1, paddingBottom: padded ? 32 : 0 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={innerStyle}>{children}</View>
    </ScrollView>
  ) : (
    <View style={innerStyle}>{children}</View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <StatusBar style={statusBar} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardOffset}
        style={{ flex: 1 }}
      >
        {content}
      </KeyboardAvoidingView>
    </View>
  );
}
