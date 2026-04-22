/**
 * Map — wrapper mínimo sobre @rnmapbox/maps. Soporta:
 *   - pin estático con color según tipo de caso
 *   - pin draggable (para picker de ubicación)
 *   - tap para abrir en app de mapas nativos (Maps iOS / Google Android)
 *
 * Mapbox no es soportado en web — en web renderizamos un fallback estático.
 */

import { useEffect, useMemo, useRef } from "react";
import { Linking, Platform, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import Mapbox from "@rnmapbox/maps";

import { Text } from "@/components/ui";
import { colors } from "@/lib/theme";
import { ensureMapbox, MAP_STYLE_LIGHT, MEXICO_CENTER } from "@/lib/map";

type Props = {
  lat: number;
  lng: number;
  height?: number;
  interactive?: boolean;
  onDragEnd?: (coords: { lat: number; lng: number }) => void;
  pinColor?: string;
  openInNativeMapOnTap?: boolean;
  zoom?: number;
  style?: StyleProp<ViewStyle>;
};

export function Map({
  lat,
  lng,
  height = 220,
  interactive = false,
  onDragEnd,
  pinColor = colors.brand,
  openInNativeMapOnTap = true,
  zoom = 14,
  style,
}: Props) {
  useEffect(() => {
    ensureMapbox();
  }, []);

  const cameraRef = useRef<Mapbox.Camera | null>(null);
  const center = useMemo<[number, number]>(
    () => (Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : MEXICO_CENTER),
    [lat, lng]
  );

  const openNativeMap = () => {
    const label = encodeURIComponent("Vuelvecasa");
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`
        : `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
    Linking.openURL(url).catch(() => {});
  };

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          {
            height,
            borderRadius: 18,
            overflow: "hidden",
            backgroundColor: colors.line,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Text style={{ color: colors.muted }}>
          Mapa disponible en la app móvil.
        </Text>
      </View>
    );
  }

  const content = (
    <Mapbox.MapView
      style={{ flex: 1 }}
      styleURL={MAP_STYLE_LIGHT}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      rotateEnabled={false}
      pitchEnabled={false}
      attributionEnabled
      logoEnabled={false}
      compassEnabled={false}
      scaleBarEnabled={false}
    >
      <Mapbox.Camera
        ref={(r) => {
          cameraRef.current = r;
        }}
        zoomLevel={zoom}
        centerCoordinate={center}
        animationMode="easeTo"
        animationDuration={600}
      />
      <Mapbox.PointAnnotation
        id="pin"
        coordinate={center}
        draggable={!!onDragEnd}
        onDragEnd={(e) => {
          const coords = (
            e as unknown as { geometry: { coordinates: [number, number] } }
          ).geometry.coordinates;
          onDragEnd?.({ lat: coords[1], lng: coords[0] });
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: pinColor,
            borderWidth: 3,
            borderColor: "#fff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        />
      </Mapbox.PointAnnotation>
    </Mapbox.MapView>
  );

  return (
    <View
      style={[
        {
          height,
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: colors.line,
        },
        style,
      ]}
    >
      {interactive ? (
        content
      ) : openInNativeMapOnTap ? (
        <Pressable onPress={openNativeMap} style={{ flex: 1 }}>
          <View style={{ flex: 1 }} pointerEvents="none">
            {content}
          </View>
        </Pressable>
      ) : (
        content
      )}
    </View>
  );
}
