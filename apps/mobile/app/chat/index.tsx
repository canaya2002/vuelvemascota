import { Pressable, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  Body,
  Card,
  Eyebrow,
  IconButton,
  Text,
} from "@/components/ui";
import { colors } from "@/lib/theme";
import type { ChatCanal } from "@vuelvecasa/shared";

const CANALES: {
  value: ChatCanal;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  desc: string;
}[] = [
  {
    value: "general",
    label: "General",
    icon: "chatbubbles",
    desc: "Conversación abierta con la comunidad.",
  },
  {
    value: "urgencias",
    label: "Urgencias",
    icon: "alert-circle",
    desc: "Casos que necesitan atención inmediata.",
  },
  {
    value: "veterinarias",
    label: "Veterinarias",
    icon: "medkit",
    desc: "Dudas y coordinación con veterinarias aliadas.",
  },
  {
    value: "rescatistas",
    label: "Rescatistas",
    icon: "paw",
    desc: "Coordinación entre voluntarios y refugios.",
  },
];

export default function ChatIndex() {
  return (
    <Screen edges={["top"]} scroll>
      <View style={{ marginBottom: 12 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 14, paddingBottom: 60 }}>
        <Eyebrow>Chat</Eyebrow>
        <H2>Canales de la comunidad.</H2>

        {CANALES.map((c) => (
          <Link key={c.value} href={`/chat/${c.value}` as never} asChild>
            <Pressable>
              <Card>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.brandSoft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name={c.icon} size={20} color={colors.brandInk} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: colors.ink,
                      }}
                    >
                      {c.label}
                    </Text>
                    <Body style={{ fontSize: 13, color: colors.muted }}>
                      {c.desc}
                    </Body>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.muted}
                  />
                </View>
              </Card>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
