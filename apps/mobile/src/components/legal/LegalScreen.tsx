/**
 * LegalScreen — pantalla nativa premium para textos legales
 * (privacidad / términos / aviso). Sustituye el WebView que cargaba la
 * versión web — ahora todo es UI nativa con tipografía cuidada.
 *
 * Uso:
 *   <LegalScreen
 *     eyebrow="Aviso de privacidad"
 *     title="Cómo cuidamos tus datos."
 *     subtitle="Última actualización: 28 abr 2026."
 *     sections={[
 *       { heading: "Qué recabamos", body: "..." },
 *       ...
 *     ]}
 *   />
 */

import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  H3,
  Body,
  Text,
  Eyebrow,
  IconButton,
} from "../ui";
import { colors } from "@/lib/theme";

export type LegalSection = {
  heading: string;
  /** Texto en lenguaje plano. Saltos de línea (\n\n) se respetan. */
  body: string;
  /** Bullets opcionales que se renderan después del body. */
  bullets?: string[];
};

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  sections: LegalSection[];
  /** Texto de cierre — datos de contacto, derechos ARCO, etc. */
  footer?: string;
};

export function LegalScreen({
  eyebrow,
  title,
  subtitle,
  sections,
  footer,
}: Props) {
  return (
    <Screen edges={["top"]} padded={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 64 }}
      >
        <Eyebrow style={{ marginBottom: 8 }}>{eyebrow}</Eyebrow>
        <H1
          style={{
            fontSize: 32,
            letterSpacing: -0.7,
            lineHeight: 38,
          }}
        >
          {title}
        </H1>
        {subtitle ? (
          <Text
            style={{
              fontSize: 13,
              color: colors.muted,
              marginTop: 10,
              fontWeight: "500",
            }}
          >
            {subtitle}
          </Text>
        ) : null}

        <View style={{ marginTop: 28, gap: 28 }}>
          {sections.map((s, i) => (
            <View key={i}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    backgroundColor: colors.brandSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.brandInk,
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                </View>
                <H3
                  style={{
                    flex: 1,
                    fontSize: 19,
                    letterSpacing: -0.3,
                  }}
                >
                  {s.heading}
                </H3>
              </View>
              <Body
                style={{
                  fontSize: 15,
                  lineHeight: 23,
                  color: colors.inkSoft,
                }}
              >
                {s.body}
              </Body>
              {s.bullets && s.bullets.length > 0 ? (
                <View style={{ marginTop: 12, gap: 8 }}>
                  {s.bullets.map((b, j) => (
                    <View
                      key={j}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          backgroundColor: colors.brand,
                          marginTop: 9,
                        }}
                      />
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 14.5,
                          lineHeight: 21,
                          color: colors.inkSoft,
                        }}
                      >
                        {b}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {footer ? (
          <View
            style={{
              marginTop: 36,
              padding: 18,
              borderRadius: 16,
              backgroundColor: colors.bgAlt,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: colors.inkSoft,
              }}
            >
              {footer}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
