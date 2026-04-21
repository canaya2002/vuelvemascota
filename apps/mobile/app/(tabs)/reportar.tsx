/**
 * Pantalla de entrada a reportar. Pregunta el tipo — al tocar navega a la
 * pantalla del formulario correspondiente.
 */

import { router } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  Body,
  Button,
  Card,
  Eyebrow,
} from "@/components/ui";
import { colors } from "@/lib/theme";

export default function ReportarScreen() {
  return (
    <Screen scroll edges={["top"]}>
      <View style={{ gap: 18, paddingTop: 8, paddingBottom: 120 }}>
        <Eyebrow>Reportar</Eyebrow>
        <H2>¿Qué quieres reportar?</H2>

        <Card style={{ padding: 20, gap: 10 }}>
          <Ionicons name="search" size={32} color={colors.brand} />
          <Body style={{ fontSize: 17, fontWeight: "700", color: colors.ink }}>
            Perdí a mi mascota
          </Body>
          <Body style={{ color: colors.muted }}>
            Generamos un reporte público, avisamos a usuarios cerca y activamos
            a la comunidad.
          </Body>
          <Button
            label="Empezar reporte"
            block
            style={{ marginTop: 8 }}
            onPress={() => router.push("/reportar/perdida" as never)}
          />
        </Card>

        <Card style={{ padding: 20, gap: 10 }}>
          <Ionicons name="paw" size={32} color={colors.accent} />
          <Body style={{ fontSize: 17, fontWeight: "700", color: colors.ink }}>
            Encontré una mascota
          </Body>
          <Body style={{ color: colors.muted }}>
            Ayúdanos a buscar a su familia publicando la mascota que
            encontraste.
          </Body>
          <Button
            label="Publicar encuentro"
            variant="outline"
            block
            style={{ marginTop: 8 }}
            onPress={() => router.push("/reportar/encontrada" as never)}
          />
        </Card>
      </View>
    </Screen>
  );
}
