/**
 * Gallery con swipe horizontal e indicadores de página.
 * Usa ScrollView paged para simplicidad (suficiente para 2-6 fotos).
 */

import { useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { CasoFoto } from "@vuelvecasa/shared";
import { colors } from "@/lib/theme";

type Props = { fotos: CasoFoto[]; height?: number };

export function Gallery({ fotos, height = 320 }: Props) {
  const [idx, setIdx] = useState(0);
  const { width } = Dimensions.get("window");
  const ref = useRef<ScrollView>(null);

  if (fotos.length === 0) {
    return (
      <View
        style={{
          height,
          backgroundColor: colors.line,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="image-outline" size={48} color={colors.muted} />
      </View>
    );
  }

  return (
    <View style={{ position: "relative", height }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          if (i !== idx) setIdx(i);
        }}
        scrollEventThrottle={16}
      >
        {fotos.map((f) => (
          <Image
            key={f.id}
            source={{ uri: f.url }}
            style={{ width, height }}
            contentFit="cover"
          />
        ))}
      </ScrollView>

      {fotos.length > 1 ? (
        <View
          style={{
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {fotos.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === idx ? 22 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i === idx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
