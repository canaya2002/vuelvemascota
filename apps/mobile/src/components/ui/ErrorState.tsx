import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Body, H3 } from "./Text";
import { Button } from "./Button";
import { colors } from "@/lib/theme";

type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Algo salió mal",
  description = "Revisa tu conexión e inténtalo de nuevo.",
  onRetry,
}: Props) {
  return (
    <View
      style={{
        paddingVertical: 48,
        alignItems: "center",
        gap: 12,
      }}
    >
      <Ionicons name="warning-outline" size={40} color={colors.brand} />
      <H3 style={{ textAlign: "center" }}>{title}</H3>
      <Body style={{ textAlign: "center", maxWidth: 320 }}>{description}</Body>
      {onRetry ? (
        <Button
          label="Reintentar"
          variant="outline"
          onPress={onRetry}
          style={{ marginTop: 4 }}
        />
      ) : null}
    </View>
  );
}
