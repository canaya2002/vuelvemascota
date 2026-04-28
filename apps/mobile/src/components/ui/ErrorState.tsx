import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Body, H3, Text } from "./Text";
import { Button } from "./Button";
import { colors } from "@/lib/theme";

type Props = {
  title?: string;
  description?: string;
  /** Error real (de TanStack Query u otro). Si viene, mostramos su mensaje
   *  para que el usuario sepa POR QUÉ falló — no solo "algo salió mal". */
  error?: unknown;
  onRetry?: () => void;
};

function extractMessage(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const e = err as { message?: unknown };
    if (typeof e.message === "string") return e.message;
  }
  return null;
}

export function ErrorState({
  title = "No pudimos cargar esto",
  description,
  error,
  onRetry,
}: Props) {
  const errMsg = extractMessage(error);
  const finalDesc =
    description ??
    errMsg ??
    "Revisa tu conexión e inténtalo de nuevo en unos segundos.";

  return (
    <View
      style={{
        paddingVertical: 56,
        paddingHorizontal: 24,
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.brandSoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <Ionicons name="alert-circle-outline" size={32} color={colors.brandInk} />
      </View>
      <H3 style={{ textAlign: "center" }}>{title}</H3>
      <Body
        style={{
          textAlign: "center",
          maxWidth: 320,
          color: colors.inkSoft,
        }}
      >
        {finalDesc}
      </Body>
      {errMsg && description ? (
        <Text
          style={{
            fontSize: 11,
            color: colors.muted,
            textAlign: "center",
            maxWidth: 280,
            marginTop: -4,
          }}
          numberOfLines={3}
        >
          {errMsg}
        </Text>
      ) : null}
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
