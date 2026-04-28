/**
 * Donar — pantalla nativa premium.
 *
 * Flow:
 *  1. El usuario elige monto, causa y recurrencia con UI nativa (no WebView).
 *  2. Al tocar "Donar", llamamos POST /api/donar/checkout.
 *  3. La respuesta trae una URL de Stripe Checkout. La abrimos con
 *     `expo-web-browser` (Safari in-app, sesión segura).
 *  4. Cuando el usuario completa el cobro o cierra el sheet, volvemos a la
 *     pantalla con un mensaje de "te llegará confirmación por email".
 *
 * Razones del rediseño:
 *  - WebView con la /donar de la web rompía la consistencia visual de la app.
 *  - Pantalla nativa = transiciones más rápidas, gestos iOS, accesibilidad.
 *  - Stripe Checkout sigue siendo el procesador (PCI compliance), solo
 *    cambiamos la "puerta de entrada".
 */

import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import {
  Screen,
  IconButton,
  Text,
  H1,
  Body,
  Eyebrow,
  Card,
  PremiumButton,
} from "@/components/ui";
import { colors } from "@/lib/theme";
import { API_URL } from "@/lib/constants";
import * as haptics from "@/lib/haptics";

type Causa = "fondo" | "emergencia" | "rescate";

const PRESET_AMOUNTS = [100, 250, 500, 1000];

const CAUSAS: { value: Causa; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  {
    value: "fondo",
    label: "Fondo comunitario",
    icon: "people-outline",
    desc: "Se asigna a los casos más urgentes de la semana.",
  },
  {
    value: "emergencia",
    label: "Emergencias veterinarias",
    icon: "medical-outline",
    desc: "Cirugías, hospitalización y atención urgente.",
  },
  {
    value: "rescate",
    label: "Rescatistas aliados",
    icon: "paw-outline",
    desc: "Recursos para rescatistas verificados.",
  },
];

export default function DonarScreen() {
  const [amount, setAmount] = useState<number>(250);
  const [custom, setCustom] = useState<string>("");
  const [recurrente, setRecurrente] = useState(false);
  const [causa, setCausa] = useState<Causa>("fondo");
  const [submitting, setSubmitting] = useState(false);

  const effective = custom ? Number(custom) : amount;
  const validAmount = Number.isFinite(effective) && effective >= 20;

  async function handleDonate() {
    if (!validAmount) {
      Alert.alert("Monto inválido", "El monto mínimo es $20 MXN.");
      return;
    }
    setSubmitting(true);
    haptics.medium();
    try {
      const res = await fetch(`${API_URL}/api/donar/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: effective,
          recurrente,
          causa,
          currency: "mxn",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("No pudimos iniciar el pago", data?.error ?? "Intenta de nuevo en un momento.");
        return;
      }
      if (data?.preview) {
        // Stripe no configurado en server — mensaje suave.
        Alert.alert(
          "Estamos activando el cobro",
          data.message ??
            "Te avisaremos por email cuando esté disponible. Mientras, puedes apoyar compartiendo casos.",
        );
        return;
      }
      if (data?.url) {
        const result = await WebBrowser.openBrowserAsync(data.url, {
          dismissButtonStyle: "close",
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          showTitle: false,
          enableBarCollapsing: true,
          toolbarColor: colors.bg,
          controlsColor: colors.brand,
        });
        if (result.type === "cancel" || result.type === "dismiss") {
          // No sabemos si pagó o canceló — Stripe tiene la verdad. Solo
          // damos confirmación tranquila.
          Alert.alert(
            "Donación registrada",
            "Si completaste el pago, recibirás un email con el resumen en los próximos minutos. ¡Gracias por apoyar!",
          );
        }
        return;
      }
      Alert.alert("Algo no respondió", "Intenta nuevamente en un momento.");
    } catch (err) {
      Alert.alert(
        "Sin conexión",
        err instanceof Error ? err.message : "Revisa tu internet e intenta de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen edges={["top"]} padded={false}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow style={{ color: colors.brandInk }}>Donaciones · Pago seguro Stripe</Eyebrow>
        <H1 style={{ marginTop: 10, fontSize: 34, lineHeight: 38, letterSpacing: -0.5 }}>
          Tu apoyo, ayuda real.
        </H1>
        <Body style={{ marginTop: 12, color: colors.inkSoft, fontSize: 15.5, lineHeight: 22 }}>
          Cada peso financia veterinaria de emergencia, alimento, traslados y
          rescate de casos verificados. Transparencia desde el primer peso.
        </Body>

        {/* --- Monto --- */}
        <SectionLabel>Monto en pesos</SectionLabel>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {PRESET_AMOUNTS.map((n) => {
            const selected = !custom && amount === n;
            return (
              <Pressable
                key={n}
                onPress={() => {
                  setAmount(n);
                  setCustom("");
                  haptics.light();
                }}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: selected ? colors.ink : colors.line,
                  backgroundColor: selected ? colors.ink : colors.surface,
                  minWidth: 78,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: selected ? "#fff" : colors.ink,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  ${n}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            marginTop: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: custom ? colors.ink : colors.line,
            borderRadius: 14,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: "600", color: colors.muted, marginRight: 6 }}>
            $
          </Text>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="Otro monto"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            inputMode="numeric"
            style={{
              flex: 1,
              paddingVertical: 14,
              fontSize: 17,
              color: colors.ink,
              fontWeight: "600",
            }}
          />
          <Text style={{ color: colors.muted, fontSize: 13 }}>MXN</Text>
        </View>

        {/* --- Causa --- */}
        <SectionLabel>Destino</SectionLabel>
        <View style={{ gap: 10, marginTop: 12 }}>
          {CAUSAS.map((c) => {
            const selected = causa === c.value;
            return (
              <Pressable
                key={c.value}
                onPress={() => {
                  setCausa(c.value);
                  haptics.light();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: selected ? colors.brand : colors.line,
                  backgroundColor: selected ? colors.brandSoft : colors.surface,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: selected ? colors.brand : colors.bgAlt,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={c.icon}
                    size={20}
                    color={selected ? "#fff" : colors.brandInk}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15.5, fontWeight: "700", color: colors.ink }}>
                    {c.label}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 2 }}>
                    {c.desc}
                  </Text>
                </View>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: selected ? colors.brand : colors.lineStrong,
                    backgroundColor: selected ? colors.brand : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selected ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* --- Recurrente --- */}
        <SectionLabel>Frecuencia</SectionLabel>
        <Card style={{ marginTop: 12, padding: 0 }}>
          <Pressable
            onPress={() => {
              setRecurrente((v) => !v);
              haptics.light();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.ink }}>
                Donación mensual
              </Text>
              <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 2, lineHeight: 18 }}>
                Se cobra cada 30 días. Cancela cuando quieras desde tu correo.
              </Text>
            </View>
            <Switch
              value={recurrente}
              onValueChange={(v) => {
                setRecurrente(v);
                haptics.light();
              }}
              trackColor={{ false: colors.line, true: colors.brand }}
              thumbColor="#fff"
              ios_backgroundColor={colors.line}
            />
          </Pressable>
        </Card>

        {/* --- Trust signals --- */}
        <View style={{ marginTop: 24, gap: 10 }}>
          {[
            { icon: "shield-checkmark-outline", text: "Pago procesado por Stripe — no guardamos tu tarjeta." },
            { icon: "list-outline", text: "Cada donación queda registrada y rastreable." },
            { icon: "close-circle-outline", text: "Sin comisiones ocultas. Cancela mensual cuando quieras." },
          ].map((row) => (
            <View
              key={row.text}
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
            >
              <Ionicons
                // @ts-expect-error string typed for brevity
                name={row.icon}
                size={17}
                color={colors.success}
                style={{ marginTop: 2 }}
              />
              <Text style={{ flex: 1, fontSize: 13.5, color: colors.inkSoft, lineHeight: 19 }}>
                {row.text}
              </Text>
            </View>
          ))}
        </View>

        {/* --- CTA --- */}
        <View style={{ marginTop: 32 }}>
          <PremiumButton
            label={
              validAmount
                ? `Donar $${effective.toLocaleString("es-MX")} MXN${recurrente ? " /mes" : ""}`
                : "Elige un monto"
            }
            block
            size="lg"
            loading={submitting}
            disabled={!validAmount || submitting}
            onPress={handleDonate}
          />
          <Text
            style={{
              marginTop: 12,
              textAlign: "center",
              fontSize: 12,
              color: colors.muted,
              lineHeight: 17,
            }}
          >
            Al continuar te llevamos al checkout seguro de Stripe.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        marginTop: 32,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: colors.muted,
      }}
    >
      {children}
    </Text>
  );
}
