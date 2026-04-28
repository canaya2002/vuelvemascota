/**
 * Detalle de caso. Incluye:
 *  - Gallery con swipe
 *  - Datos principales (raza, color, señas, contacto)
 *  - Mapa con pin si hay coords
 *  - Lista de avistamientos
 *  - CTAs: compartir, reportar avistamiento, llamar/whatsapp
 */

import { useCallback } from "react";
import {
  Alert,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  Body,
  Button,
  IconButton,
  LoadingState,
  ErrorState,
  Card,
} from "@/components/ui";
import { Gallery } from "@/components/casos/Gallery";
import { EstadoBadge } from "@/components/casos/EstadoBadge";
import { Map } from "@/components/map/Map";
import { useCaso } from "@/lib/hooks";
import { colors } from "@/lib/theme";
import { fmtDate, relativeTime } from "@/lib/format";
import { shareCaso } from "@/lib/share";
import * as haptics from "@/lib/haptics";

export default function CasoDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const query = useCaso(slug);
  const caso = query.data?.caso;
  const avistamientos = query.data?.avistamientos ?? [];

  const share = useCallback(async () => {
    if (!caso) return;
    haptics.light();
    await shareCaso(caso);
  }, [caso]);

  const call = (num: string) => {
    Linking.openURL(`tel:${num}`).catch(() =>
      Alert.alert("No se pudo llamar", num)
    );
  };

  const whatsapp = (num: string) => {
    const clean = num.replace(/[^\d]/g, "");
    Linking.openURL(`https://wa.me/${clean}`).catch(() =>
      Alert.alert("No se pudo abrir WhatsApp", num)
    );
  };

  if (query.isPending) {
    return (
      <Screen edges={["top"]}>
        <LoadingState label="Cargando caso..." />
      </Screen>
    );
  }
  if (query.isError || !caso) {
    return (
      <Screen edges={["top"]}>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={colors.brand}
          />
        }
      >
        <View style={{ position: "relative" }}>
          <Gallery fotos={caso.fotos} />
          <View
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 52 : 16,
              left: 16,
              right: 16,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <IconButton onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </IconButton>
            <IconButton onPress={share}>
              <Ionicons name="share-outline" size={20} color={colors.ink} />
            </IconButton>
          </View>
        </View>

        <View style={{ padding: 20, gap: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <EstadoBadge tipo={caso.tipo} estado={caso.estado} />
            <Body style={{ fontSize: 12, color: colors.muted }}>
              {relativeTime(caso.created_at)}
            </Body>
          </View>

          <H2>{caso.nombre ?? "Mascota sin nombre"}</H2>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[caso.especie, caso.raza, caso.color, caso.tamano, caso.sexo]
              .filter(Boolean)
              .map((tag, i) => (
                <View
                  key={i}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 9999,
                    backgroundColor: colors.line,
                  }}
                >
                  <Body style={{ fontSize: 12, color: colors.inkSoft }}>
                    {tag}
                  </Body>
                </View>
              ))}
          </View>

          {caso.descripcion ? (
            <Body style={{ color: colors.ink, lineHeight: 22 }}>
              {caso.descripcion}
            </Body>
          ) : null}

          {caso.senas ? (
            <Card>
              <Body style={{ fontWeight: "700", marginBottom: 4 }}>Señas</Body>
              <Body>{caso.senas}</Body>
            </Card>
          ) : null}

          {caso.lat != null && caso.lng != null ? (
            <Map
              lat={Number(caso.lat)}
              lng={Number(caso.lng)}
              height={220}
              pinColor={
                caso.tipo === "encontrada"
                  ? colors.accent
                  : caso.tipo === "avistamiento"
                    ? colors.sky
                    : colors.brand
              }
            />
          ) : null}

          <Card>
            <View style={{ gap: 8 }}>
              <InfoRow icon="location" label="Zona">
                {caso.ciudad}
                {caso.colonia ? ` · ${caso.colonia}` : ""}
              </InfoRow>
              <InfoRow icon="calendar" label="Fecha">
                {fmtDate(caso.fecha_evento)}
              </InfoRow>
              {caso.tiene_chip ? (
                <InfoRow icon="hardware-chip" label="Microchip">
                  Sí tiene
                </InfoRow>
              ) : null}
              {caso.tiene_collar ? (
                <InfoRow icon="ribbon" label="Collar">
                  Sí tiene
                </InfoRow>
              ) : null}
            </View>
          </Card>

          {(caso.contacto_telefono || caso.contacto_whatsapp) ? (
            <View style={{ gap: 10 }}>
              {caso.contacto_whatsapp ? (
                <Button
                  label="WhatsApp"
                  variant="primary"
                  block
                  leading={
                    <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                  }
                  onPress={() => whatsapp(caso.contacto_whatsapp as string)}
                />
              ) : null}
              {caso.contacto_telefono ? (
                <Button
                  label="Llamar"
                  variant="outline"
                  block
                  leading={<Ionicons name="call" size={18} color={colors.ink} />}
                  onPress={() => call(caso.contacto_telefono as string)}
                />
              ) : null}
            </View>
          ) : null}

          <Button
            label="Reportar avistamiento"
            variant="dark"
            block
            size="lg"
            leading={<Ionicons name="eye" size={18} color="#fff" />}
            onPress={() => router.push(`/avistamiento/${caso.slug}` as never)}
          />

          {avistamientos.length > 0 ? (
            <View style={{ gap: 10, marginTop: 8 }}>
              <Body style={{ fontWeight: "700", fontSize: 16 }}>
                Avistamientos recientes
              </Body>
              {avistamientos.slice(0, 5).map((a) => (
                <Card key={a.id} style={{ padding: 12 }}>
                  <Body style={{ fontSize: 13, color: colors.muted }}>
                    {relativeTime(a.created_at)}
                  </Body>
                  <Body style={{ marginTop: 4 }}>{a.descripcion}</Body>
                </Card>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
      }}
    >
      <Ionicons name={icon} size={16} color={colors.brand} />
      <Body style={{ color: colors.muted, minWidth: 70 }}>{label}</Body>
      <Body style={{ color: colors.ink, flex: 1 }}>{children}</Body>
    </View>
  );
}
