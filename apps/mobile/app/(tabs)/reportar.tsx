/**
 * Pantalla de entrada a reportar. Cada opción se presenta como una tarjeta
 * grande con gradiente, glass overlay, icono ambiental y micro-animación al
 * presionar.
 */

import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  Text,
  Eyebrow,
  AuroraBackground,
  AnimatedEntry,
  TiltPressable,
  GradientFill,
  PremiumButton,
  Hero,
  Body,
  PulseDot,
} from "@/components/ui";
import { colors } from "@/lib/theme";

export default function ReportarScreen() {
  return (
    <Screen edges={["top"]} padded={false}>
      <AuroraBackground variant="rose" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, paddingTop: 10, paddingBottom: 160 }}
      >
        <AnimatedEntry delay={40}>
          <View style={{ gap: 6, paddingHorizontal: 2, marginBottom: 18 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <PulseDot size={7} color={colors.brand} />
              <Eyebrow>Reportar</Eyebrow>
            </View>
            <H1 style={{ fontSize: 32, letterSpacing: -0.8 }}>
              ¿Qué quieres reportar?
            </H1>
            <Body style={{ color: colors.inkSoft, fontSize: 14 }}>
              Un reporte toma menos de un minuto. Avisamos a la comunidad cerca
              de inmediato.
            </Body>
          </View>
        </AnimatedEntry>

        <AnimatedEntry delay={140}>
          <OptionCard
            eyebrow="Urgencia"
            title="Perdí a mi mascota"
            description="Generamos un reporte público, avisamos a la gente cerca y activamos a la red."
            icon="search"
            cta="Empezar reporte"
            preset="brand"
            onPress={() => router.push("/reportar/perdida" as never)}
          />
        </AnimatedEntry>

        <AnimatedEntry delay={220}>
          <OptionCard
            eyebrow="Ayuda"
            title="Encontré una mascota"
            description="Ayúdanos a buscar a su familia publicando dónde la encontraste."
            icon="paw"
            cta="Publicar encuentro"
            preset="forest"
            onPress={() => router.push("/reportar/encontrada" as never)}
          />
        </AnimatedEntry>

        <AnimatedEntry delay={300}>
          <View style={{ marginTop: 18 }}>
            <Hero preset="ocean" overlay="soft">
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    fontSize: 11,
                    fontWeight: "800",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Avistamiento rápido
                </Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 16, lineHeight: 22 }}>
                ¿Viste una mascota pero no la pudiste alcanzar? Reporta el
                avistamiento en un toque.
              </Text>
              <View style={{ marginTop: 14 }}>
                <PremiumButton
                  label="Reportar avistamiento"
                  variant="glass"
                  size="md"
                  leading={<Ionicons name="flash" size={16} color={colors.ink} />}
                  onPress={() => router.push("/avistamiento" as never)}
                />
              </View>
            </Hero>
          </View>
        </AnimatedEntry>
      </ScrollView>
    </Screen>
  );
}

function OptionCard({
  eyebrow,
  title,
  description,
  icon,
  cta,
  preset,
  onPress,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  cta: string;
  preset: "brand" | "forest";
  onPress: () => void;
}) {
  return (
    <TiltPressable
      onPress={onPress}
      style={{
        borderRadius: 30,
        overflow: "hidden",
        marginBottom: 14,
        shadowColor: preset === "brand" ? colors.brand : colors.accent,
        shadowOpacity: 0.24,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 16 },
        elevation: 10,
      }}
    >
      <GradientFill preset={preset} radius={30}>
        <View style={{ padding: 22, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </Text>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Ionicons name={icon} size={22} color="#fff" />
            </View>
          </View>
          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "800",
              letterSpacing: -0.5,
              lineHeight: 28,
            }}
          >
            {title}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 20 }}>
            {description}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 9999,
                backgroundColor: "rgba(255,255,255,0.95)",
              }}
            >
              <Text style={{ color: colors.ink, fontSize: 14, fontWeight: "700" }}>
                {cta}
              </Text>
              <Ionicons name="arrow-forward" size={15} color={colors.ink} />
            </View>
          </View>
        </View>
      </GradientFill>
    </TiltPressable>
  );
}
