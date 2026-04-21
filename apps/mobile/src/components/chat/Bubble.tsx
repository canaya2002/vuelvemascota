import { View } from "react-native";
import { Body, Text } from "@/components/ui";
import type { ChatMensaje } from "@vuelvecasa/shared";
import { colors } from "@/lib/theme";
import { relativeTime } from "@/lib/format";

type Props = { mensaje: ChatMensaje; mine: boolean };

export function Bubble({ mensaje, mine }: Props) {
  return (
    <View
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "82%",
        marginBottom: 4,
      }}
    >
      {!mine && mensaje.autor_nombre ? (
        <Text
          style={{
            fontSize: 11,
            color: colors.muted,
            marginBottom: 2,
            marginLeft: 6,
          }}
        >
          {mensaje.autor_nombre}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: mine ? colors.brand : colors.surface,
          borderRadius: 18,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomRightRadius: mine ? 4 : 18,
          borderBottomLeftRadius: mine ? 18 : 4,
          borderWidth: mine ? 0 : 1,
          borderColor: colors.line,
        }}
      >
        <Body
          style={{
            color: mine ? "#fff" : colors.ink,
            fontSize: 15,
          }}
        >
          {mensaje.cuerpo}
        </Body>
      </View>
      <Text
        style={{
          fontSize: 10,
          color: colors.muted,
          marginTop: 2,
          alignSelf: mine ? "flex-end" : "flex-start",
          marginHorizontal: 6,
        }}
      >
        {relativeTime(mensaje.created_at)}
      </Text>
    </View>
  );
}
