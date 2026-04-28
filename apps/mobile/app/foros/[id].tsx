/**
 * Hilo con sus respuestas. Al fondo, caja para contestar.
 */

import { useState } from "react";
import { Alert, FlatList, Pressable, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Body,
  Button,
  Card,
  ErrorState,
  H2,
  IconButton,
  Input,
  LoadingState,
  Screen,
  Text,
} from "@/components/ui";
import { useHilo, useResponderHilo } from "@/lib/hooks";
import { colors } from "@/lib/theme";
import { relativeTime } from "@/lib/format";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";

export default function HiloDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useHilo(id);
  const reply = useResponderHilo(id);
  const [text, setText] = useState("");

  if (query.isPending) {
    return (
      <Screen edges={["top"]}>
        <LoadingState />
      </Screen>
    );
  }
  if (query.isError || !query.data) {
    return (
      <Screen edges={["top"]}>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  const { hilo, respuestas } = query.data;

  const submit = async () => {
    if (text.trim().length < 3) return;
    try {
      await reply.mutateAsync(text.trim());
      setText("");
      haptics.success();
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
          }}
        >
          <IconButton onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </IconButton>
        </View>

        <FlatList
          data={respuestas}
          keyExtractor={(r) => r.id}
          ListHeaderComponent={
            <View style={{ padding: 20, gap: 10 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  color: colors.brandInk,
                }}
              >
                {hilo.categoria}
              </Text>
              <H2>{hilo.titulo}</H2>
              <Body>{hilo.cuerpo}</Body>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {hilo.autor_nombre ?? "Anónimo"} · {relativeTime(hilo.created_at)}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 20 }}>
              <Card>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.ink,
                  }}
                >
                  {item.autor_nombre ?? "Anónimo"}
                </Text>
                <Body style={{ marginTop: 4 }}>{item.cuerpo}</Body>
                <Text
                  style={{ fontSize: 11, color: colors.muted, marginTop: 6 }}
                >
                  {relativeTime(item.created_at)}
                </Text>
              </Card>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 160 }}
        />

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
            placeholder="Escribe una respuesta..."
            multiline
            value={text}
            onChangeText={setText}
            containerStyle={{ flex: 1 }}
            style={{ minHeight: 44, maxHeight: 120 }}
          />
          <Pressable
            onPress={submit}
            disabled={reply.isPending || text.trim().length < 3}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                text.trim().length < 3 ? colors.line : colors.brand,
            }}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
    </Screen>
  );
}
