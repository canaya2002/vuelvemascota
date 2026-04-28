/**
 * Canal global de Comunidad. En el rediseño hay un solo canal vivo
 * ("comunidad"); cualquier slug viejo (general/urgencias/...) se redirige.
 *
 * Long-press sobre un mensaje ofrece reportar y silenciar al autor.
 */

import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, View, type AlertButton } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  IconButton,
  Input,
  ErrorState,
  LoadingState,
  EmptyState,
  Text,
} from "@/components/ui";
import { Bubble } from "@/components/chat/Bubble";
import {
  useChat,
  useEnviarMensaje,
  useMe,
  useReportarMensaje,
  useSilenciar,
} from "@/lib/hooks";
import { colors } from "@/lib/theme";
import type { ChatCanal } from "@vuelvecasa/shared";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";

const TITULOS: Record<string, string> = {
  comunidad: "Comunidad",
  general: "Comunidad",
  urgencias: "Comunidad",
  veterinarias: "Comunidad",
  rescatistas: "Comunidad",
};

export default function ChatCanal() {
  const { canal } = useLocalSearchParams<{ canal: string }>();
  // Cualquier slug viejo (general/urgencias/...) cae al canal único 'comunidad'.
  const c: ChatCanal = "comunidad";
  void canal;
  const me = useMe();
  const query = useChat(c);
  const send = useEnviarMensaje(c);
  const reportar = useReportarMensaje({ canal: c });
  const silenciar = useSilenciar();
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [query.data?.length]);

  const submit = async () => {
    if (text.trim().length < 2) return;
    try {
      const r = await send.mutateAsync(text.trim());
      setText("");
      haptics.light();
      if (r.shadowed) {
        Alert.alert(
          "Tu mensaje quedó oculto",
          "Tienes una pausa temporal por reportes recientes. Solo tú lo verás hasta que vuelvas a tener buena reputación."
        );
      }
    } catch (err) {
      haptics.error();
      Alert.alert("No se envió", errorMessage(err));
    }
  };

  const handleLongPress = (mensajeId: string, autorId: string | null) => {
    haptics.medium();
    const buttons: AlertButton[] = [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Reportar",
        style: "destructive",
        onPress: async () => {
          try {
            const r = await reportar.mutateAsync({ id: mensajeId });
            if (r.silenced) {
              Alert.alert(
                "Reportado",
                "Este autor recibió suficientes reportes y queda silenciado 24h."
              );
            } else {
              Alert.alert("Reportado", "Gracias. Lo revisaremos.");
            }
          } catch (err) {
            Alert.alert("No se reportó", errorMessage(err));
          }
        },
      },
    ];
    if (autorId) {
      buttons.push({
        text: "Silenciar a este autor",
        onPress: async () => {
          try {
            await silenciar.mutateAsync(autorId);
            Alert.alert("Silenciado", "Ya no verás mensajes de este usuario.");
          } catch (err) {
            Alert.alert("No se silenció", errorMessage(err));
          }
        },
      });
    }
    Alert.alert("Opciones", "¿Qué quieres hacer con este mensaje?", buttons);
  };

  return (
    <Screen edges={["top"]} padded={false}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
        <View style={{ flex: 1 }}>
          <H2 style={{ fontSize: 22 }}>{TITULOS[c] ?? "Comunidad"}</H2>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
            Canal único · gateado por reputación
          </Text>
        </View>
      </View>

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="Aún sin mensajes"
          description="Sé respetuoso. Mantén pulsado un mensaje para reportar."
        />
      ) : (
        <FlatList
          ref={listRef}
          data={query.data ?? []}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => {
            const mine =
              (me.data?.usuario_id ?? null) === item.autor_usuario_id &&
              item.autor_usuario_id != null;
            return (
              <Bubble
                mensaje={item}
                mine={mine}
                onLongPress={
                  mine ? undefined : () => handleLongPress(item.id, item.autor_usuario_id)
                }
              />
            );
          }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 10,
            gap: 4,
          }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
        />
      )}

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.line,
          backgroundColor: colors.surface,
          padding: 12,
          flexDirection: "row",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        <Input
          placeholder="Escribe a la comunidad..."
          multiline
          value={text}
          onChangeText={setText}
          containerStyle={{ flex: 1 }}
          style={{ minHeight: 44, maxHeight: 120 }}
        />
        <Pressable
          onPress={submit}
          accessibilityLabel="Enviar mensaje"
          accessibilityRole="button"
          disabled={send.isPending || text.trim().length < 2}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              text.trim().length < 2 ? colors.line : colors.brand,
          }}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </Screen>
  );
}
