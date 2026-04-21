/**
 * Formulario completo para reportar un caso. Cubre los campos más comunes
 * del CasoInput — el resto se puede añadir desde la web o editar luego.
 *
 * Diseño premium: campos agrupados en secciones, progress visual, geo
 * opcional con un toque, preview de fotos con swipe.
 */

import { useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Body,
  Button,
  Card,
  Eyebrow,
  FormField,
  H2,
  Input,
  Select,
} from "@/components/ui";
import { PhotoPicker } from "./PhotoPicker";
import { LocationPickerSheet } from "@/components/map/LocationPickerSheet";
import type {
  CasoEspecie,
  CasoSexo,
  CasoTamano,
  CasoTipo,
} from "@vuelvecasa/shared";
import { ESTADOS_MX, validateCasoInput } from "@vuelvecasa/shared";
import { useCreateCaso, useCities } from "@/lib/hooks";
import { useApi } from "@/lib/api";
import { getCurrentPosition, reverseGeocode } from "@/lib/location";
import { colors } from "@/lib/theme";
import { errorMessage } from "@/lib/errors";
import type { LocalPhoto } from "@/lib/imagePicker";
import * as haptics from "@/lib/haptics";

type Props = { tipo: CasoTipo };

export function CasoForm({ tipo }: Props) {
  const api = useApi();
  const cities = useCities();
  const createCaso = useCreateCaso();

  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [especie, setEspecie] = useState<CasoEspecie>("perro");
  const [nombre, setNombre] = useState("");
  const [raza, setRaza] = useState("");
  const [color, setColor] = useState("");
  const [tamano, setTamano] = useState<CasoTamano | null>(null);
  const [sexo, setSexo] = useState<CasoSexo | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [senas, setSenas] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [colonia, setColonia] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTel, setContactoTel] = useState("");
  const [fechaEvento] = useState(() => new Date().toISOString().slice(0, 10));
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pickerOpen, setPickerOpen] = useState(false);

  const captureLocation = async () => {
    haptics.tap();
    setLoadingGeo(true);
    try {
      const c = await getCurrentPosition();
      if (!c) {
        Alert.alert("Sin ubicación", "Permite acceso o llena la zona a mano.");
        return;
      }
      setCoords(c);
      const geo = await reverseGeocode(c.lat, c.lng);
      if (geo?.city && !ciudad) setCiudad(geo.city);
      if (geo?.state && !estado) setEstado(geo.state);
      haptics.success();
    } finally {
      setLoadingGeo(false);
    }
  };

  const submit = async () => {
    const input = {
      tipo,
      especie,
      fecha_evento: fechaEvento,
      ciudad: ciudad.trim(),
      nombre: nombre.trim() || null,
      raza: raza.trim() || null,
      color: color.trim() || null,
      tamano,
      sexo,
      descripcion: descripcion.trim() || null,
      senas: senas.trim() || null,
      estado: estado || null,
      colonia: colonia.trim() || null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      contacto_nombre: contactoNombre.trim() || null,
      contacto_telefono: contactoTel || null,
      contacto_whatsapp: contactoTel || null,
    };

    const issues = validateCasoInput(input);
    if (issues.length > 0) {
      const next: Record<string, string> = {};
      for (const e of issues) next[e.field] = e.message;
      setErrors(next);
      haptics.warn();
      Alert.alert("Revisa el formulario", issues[0].message);
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
      const created = await createCaso.mutateAsync(input);
      if (photos.length > 0) {
        try {
          await api.casos.uploadPhotos(created.slug, photos);
        } catch {
          // Si la subida falla, el caso ya se creó — el usuario puede
          // reintentar desde el detalle.
        }
      }
      haptics.success();
      router.replace(`/casos/${created.slug}` as never);
    } catch (err) {
      haptics.error();
      Alert.alert("No se pudo publicar", errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ gap: 18 }}>
      <View style={{ gap: 4 }}>
        <Eyebrow style={{ color: colors.brandInk }}>
          {tipo === "perdida" ? "Reportar perdida" : "Reportar encontrada"}
        </Eyebrow>
        <H2>
          {tipo === "perdida"
            ? "Cuéntanos sobre tu mascota."
            : "Describe la mascota que encontraste."}
        </H2>
        <Body style={{ color: colors.muted }}>
          Entre más detalles, más rápido la encontramos.
        </Body>
      </View>

      <Card>
        <View style={{ gap: 14 }}>
          <FormField label="Fotos (mínimo 1)">
            <PhotoPicker photos={photos} onChange={setPhotos} />
          </FormField>
        </View>
      </Card>

      <Card>
        <View style={{ gap: 14 }}>
          <FormField label="Especie">
            <Select
              value={especie}
              onChange={(v) => setEspecie(v as CasoEspecie)}
              options={[
                { label: "Perro", value: "perro" },
                { label: "Gato", value: "gato" },
                { label: "Otra", value: "otro" },
              ]}
            />
          </FormField>

          <FormField label="Nombre (si lo tiene)">
            <Input
              placeholder="Ej. Luna"
              value={nombre}
              onChangeText={setNombre}
            />
          </FormField>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <FormField label="Raza" style={{ flex: 1 }}>
              <Input placeholder="Labrador" value={raza} onChangeText={setRaza} />
            </FormField>
            <FormField label="Color" style={{ flex: 1 }}>
              <Input placeholder="Beige" value={color} onChangeText={setColor} />
            </FormField>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <FormField label="Tamaño" style={{ flex: 1 }}>
              <Select
                value={tamano}
                onChange={(v) => setTamano(v as CasoTamano)}
                placeholder="—"
                options={[
                  { label: "Chico", value: "chico" },
                  { label: "Mediano", value: "mediano" },
                  { label: "Grande", value: "grande" },
                ]}
              />
            </FormField>
            <FormField label="Sexo" style={{ flex: 1 }}>
              <Select
                value={sexo}
                onChange={(v) => setSexo(v as CasoSexo)}
                placeholder="—"
                options={[
                  { label: "Hembra", value: "hembra" },
                  { label: "Macho", value: "macho" },
                  { label: "Desconocido", value: "desconocido" },
                ]}
              />
            </FormField>
          </View>

          <FormField label="Señas particulares">
            <Input
              placeholder="Ej. Cicatriz en la pata derecha, collar rojo."
              multiline
              numberOfLines={3}
              value={senas}
              onChangeText={setSenas}
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </FormField>

          <FormField label="Descripción" error={errors.descripcion}>
            <Input
              placeholder="Cuéntanos lo que sabemos de la mascota o del avistamiento."
              multiline
              numberOfLines={4}
              value={descripcion}
              onChangeText={setDescripcion}
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </FormField>
        </View>
      </Card>

      <Card>
        <View style={{ gap: 14 }}>
          <Eyebrow>Zona</Eyebrow>
          <FormField label="Ciudad" error={errors.ciudad}>
            <Select
              value={ciudad}
              onChange={setCiudad}
              placeholder="Selecciona ciudad"
              options={(cities.data ?? []).map((c) => ({
                label: c.name,
                value: c.name,
              }))}
            />
          </FormField>
          <FormField label="Estado" error={errors.estado}>
            <Select
              value={estado}
              onChange={setEstado}
              placeholder="Selecciona estado"
              options={ESTADOS_MX.map((e) => ({ label: e, value: e }))}
            />
          </FormField>
          <FormField label="Colonia (opcional)">
            <Input
              placeholder="Ej. Roma Norte"
              value={colonia}
              onChangeText={setColonia}
            />
          </FormField>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              label={
                coords
                  ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                  : "Mi ubicación"
              }
              variant={coords ? "outline" : "dark"}
              style={{ flex: 1 }}
              loading={loadingGeo}
              leading={
                <Ionicons
                  name={coords ? "checkmark-circle" : "location"}
                  size={18}
                  color={coords ? colors.accent : "#fff"}
                />
              }
              onPress={captureLocation}
            />
            <Button
              label="En mapa"
              variant="outline"
              style={{ flex: 1 }}
              leading={<Ionicons name="map" size={18} color={colors.ink} />}
              onPress={() => setPickerOpen(true)}
            />
          </View>
        </View>
      </Card>

      <LocationPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initial={coords}
        onConfirm={(c) => {
          setCoords({ lat: c.lat, lng: c.lng });
          if (c.city && !ciudad) setCiudad(c.city);
          if (c.state && !estado) setEstado(c.state);
        }}
      />

      <Card>
        <View style={{ gap: 14 }}>
          <Eyebrow>Contacto</Eyebrow>
          <FormField label="Tu nombre" error={errors.contacto_nombre}>
            <Input
              placeholder="Como quieres que te llamen"
              value={contactoNombre}
              onChangeText={setContactoNombre}
            />
          </FormField>
          <FormField
            label="Teléfono / WhatsApp"
            helper="Te contactarán quienes tengan pistas."
            error={errors.contacto_telefono}
          >
            <Input
              placeholder="+52..."
              keyboardType="phone-pad"
              value={contactoTel}
              onChangeText={setContactoTel}
            />
          </FormField>
        </View>
      </Card>

      <Button
        label="Publicar reporte"
        size="lg"
        block
        loading={submitting}
        onPress={submit}
      />
      <Body style={{ fontSize: 12, color: colors.muted, textAlign: "center" }}>
        Todo pasa por revisión automática para proteger a las mascotas y
        rescatistas.
      </Body>
    </View>
  );
}

