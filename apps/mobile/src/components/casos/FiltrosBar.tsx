import { ScrollView, View } from "react-native";
import { Chip } from "@/components/ui";
import type { CasoTipo, CasoEspecie } from "@vuelvecasa/shared";

type Filtros = {
  tipo?: CasoTipo;
  especie?: CasoEspecie;
};

type Props = {
  value: Filtros;
  onChange: (next: Filtros) => void;
};

const TIPOS: { label: string; value: CasoTipo }[] = [
  { label: "Perdidas", value: "perdida" },
  { label: "Encontradas", value: "encontrada" },
  { label: "Avistamientos", value: "avistamiento" },
];

const ESPECIES: { label: string; value: CasoEspecie }[] = [
  { label: "Perros", value: "perro" },
  { label: "Gatos", value: "gato" },
  { label: "Otros", value: "otro" },
];

export function FiltrosBar({ value, onChange }: Props) {
  return (
    <View style={{ gap: 10, paddingVertical: 4 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        <Chip
          label="Todo"
          selected={!value.tipo}
          onPress={() => onChange({ ...value, tipo: undefined })}
        />
        {TIPOS.map((t) => (
          <Chip
            key={t.value}
            label={t.label}
            selected={value.tipo === t.value}
            onPress={() =>
              onChange({
                ...value,
                tipo: value.tipo === t.value ? undefined : t.value,
              })
            }
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        <Chip
          label="Todas las especies"
          selected={!value.especie}
          onPress={() => onChange({ ...value, especie: undefined })}
        />
        {ESPECIES.map((e) => (
          <Chip
            key={e.value}
            label={e.label}
            selected={value.especie === e.value}
            onPress={() =>
              onChange({
                ...value,
                especie: value.especie === e.value ? undefined : e.value,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
