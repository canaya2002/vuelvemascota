/**
 * Chat del canal seleccionado. Polling cada 6s (definido en useChat). En
 * Fase futura: real-time con Supabase Realtime.
 */

import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, View } from "react-native";
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
} from "@/components/ui";
import { Bubble } from "@/components/chat/Bubble";
import { useChat, useEnviarMensaje, useMe } from "@/lib/hooks";
import { colors } from "@/lib/theme";
import type { ChatCanal } from "@vuelvecasa/shared";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";

export default function ChatCanal() {
  const { canal } = useLocalSearchParams<{ canal: string }>();
  const c = canal as ChatCanal;
  const me = useMe();
  const query = useChat(c);
  const send = useEnviarMensaje(c);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      setTimeout(
        () => listRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  }, [query.data?.length]);

  const submit = async () => {
    if (text.trim().length < 1) return;
    try {
      await send.mutateAsync(text.trim());
      setText("");
      haptics.light();
    } catch (err) {
      haptics.error();
      Alert.alert("No se envió", errorMessage(err));
    }
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
          <H2 style={{ fontSize: 22 }}>
            #{c}
          </H2>
        </View>

        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : (query.data ?? []).length === 0 ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="Sin mensajes aún"
            description="Sé el primero en escribir."
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
              return <Bubble mensaje={item} mine={mine} />;
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
            placeholder={`Escribe en #${c}...`}
            multiline
            value={text}
            onChangeText={setText}
            containerStyle={{ flex: 1 }}
            style={{ minHeight: 44, maxHeight: 120 }}
          />
          <Pressable
            onPress={submit}
            disabled={send.isPending || text.trim().length < 1}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                text.trim().length < 1 ? colors.line : colors.brand,
            }}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
    </Screen>
  );
}
