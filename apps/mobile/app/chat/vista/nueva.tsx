/**
 * Crea una vista guardada — nombre + filtros (chips) + privacidad.
 */

import { useState } from "react";
import { Alert, Pressable, Switch, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  Body,
  Card,
  Eyebrow,
  IconButton,
  Input,
  Chip,
  Text,
  Button,
} from "@/components/ui";
import { colors } from "@/lib/theme";
import { useCreateVista } from "@/lib/hooks";
import { errorMessage } from "@/lib/errors";
import * as haptics from "@/lib/haptics";
import type { CasoEspecie, CasoTipo, VistaFiltros } from "@vuelvecasa/shared";

const ESPECIES: CasoEspecie[] = ["perro", "gato", "otro"];
const TIPOS: CasoTipo[] = ["perdida", "encontrada", "avistamiento"];
const RADIOS = [2, 5, 10, 25, 50];
const RECIENTES = [24, 48, 72, 168];

export default function NuevaVista() {
  const create = useCreateVista();
  const [nombre, setNombre] = useState("");
  const [especies, setEspecies] = useState<CasoEspecie[]>([]);
  const [tipo, setTipo] = useState<CasoTipo[]>([]);
  const [radioKm, setRadioKm] = useState<number | undefined>(undefined);
  const [recientes, setRecientes] = useState<number | undefined>(undefined);
  const [ciudad, setCiudad] = useState("");
  const [colonia, setColonia] = useState("");
  const [soloVerificados, setSoloVerificados] = useState(false);
  const [publica, setPublica] = useState(false);

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const submit = async () => {
    haptics.medium();
    const filtros: VistaFiltros = {};
    if (radioKm) filtros.radio_km = radioKm;
    if (especies.length) filtros.especies = especies;
    if (tipo.length) filtros.tipo = tipo;
    if (ciudad.trim()) filtros.ciudad = ciudad.trim();
    if (colonia.trim()) filtros.colonia = colonia.trim();
    if (recientes) filtros.recientes_horas = recientes;
    if (soloVerificados) filtros.solo_verificados = true;

    try {
      const v = await create.mutateAsync({
        nombre: nombre.trim(),
        filtros,
        publica,
      });
      haptics.success();
      router.replace(`/chat/vista/${v.id}` as never);
    } catch (err) {
      haptics.error();
      Alert.alert("No se pudo crear", errorMessage(err));
    }
  };

  const valid = nombre.trim().length >= 3;

  return (
    <Screen edges={["top"]} scroll>
      <View style={{ marginBottom: 12 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 18, paddingBottom: 80 }}>
        <View>
          <Eyebrow>Nueva vista</Eyebrow>
          <H1
            style={{ fontSize: 26, letterSpacing: -0.5, marginTop: 4, lineHeight: 32 }}
          >
            Filtra solo lo que te importa.
          </H1>
        </View>

        <Card style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.muted }}>
            NOMBRE
          </Text>
          <Input
            placeholder="Ej. Perros perdidos cerca de mí"
            value={nombre}
            onChangeText={setNombre}
          />
        </Card>

        <Section title="Especie">
          <Row>
            {ESPECIES.map((e) => (
              <Chip
                key={e}
                label={cap(e)}
                selected={especies.includes(e)}
                onPress={() => setEspecies((p) => toggle(p, e))}
              />
            ))}
          </Row>
        </Section>

        <Section title="Tipo">
          <Row>
            {TIPOS.map((t) => (
              <Chip
                key={t}
                label={cap(t)}
                selected={tipo.includes(t)}
                onPress={() => setTipo((p) => toggle(p, t))}
              />
            ))}
          </Row>
        </Section>

        <Section title="Radio (requiere ubicación)">
          <Row>
            <Chip
              label="Sin radio"
              selected={radioKm === undefined}
              onPress={() => setRadioKm(undefined)}
            />
            {RADIOS.map((r) => (
              <Chip
                key={r}
                label={`${r} km`}
                selected={radioKm === r}
                onPress={() => setRadioKm(r)}
              />
            ))}
          </Row>
        </Section>

        <Section title="Recientes">
          <Row>
            <Chip
              label="Cualquier fecha"
              selected={recientes === undefined}
              onPress={() => setRecientes(undefined)}
            />
            {RECIENTES.map((h) => (
              <Chip
                key={h}
                label={h < 168 ? `${h}h` : "7d"}
                selected={recientes === h}
                onPress={() => setRecientes(h)}
              />
            ))}
          </Row>
        </Section>

        <Section title="Lugar">
          <Input placeholder="Ciudad" value={ciudad} onChangeText={setCiudad} />
          <Input
            placeholder="Colonia (opcional)"
            value={colonia}
            onChangeText={setColonia}
          />
        </Section>

        <Card style={{ gap: 8 }}>
          <Toggle
            label="Solo de cuentas verificadas"
            description="Filtra autores con badge verificado."
            value={soloVerificados}
            onChange={setSoloVerificados}
          />
          <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 4 }} />
          <Toggle
            label="Compartir como pública"
            description="Genera un enlace para que otros se suscriban (solo lectura)."
            value={publica}
            onChange={setPublica}
          />
        </Card>

        <Button
          label={create.isPending ? "Creando..." : "Crear vista"}
          variant="primary"
          block
          size="lg"
          disabled={!valid || create.isPending}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: colors.muted,
          letterSpacing: 1.4,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{children}</View>;
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onChange(!value);
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 4,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.ink }}>
          {label}
        </Text>
        {description ? (
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          haptics.tap();
          onChange(v);
        }}
        trackColor={{ false: colors.line, true: colors.brand }}
        thumbColor="#fff"
        ios_backgroundColor={colors.line}
      />
    </Pressable>
  );
}
