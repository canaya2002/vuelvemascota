import { Badge } from "@/components/ui";
import type { CasoEstado, CasoTipo } from "@vuelvecasa/shared";

type Props = { tipo: CasoTipo; estado: CasoEstado };

export function EstadoBadge({ tipo, estado }: Props) {
  if (estado === "reencontrado") return <Badge label="Reencontrado" tone="accent" />;
  if (estado === "cerrado") return <Badge label="Cerrado" tone="muted" />;
  if (estado === "archivado") return <Badge label="Archivado" tone="muted" />;
  if (tipo === "perdida") return <Badge label="Perdida" tone="brand" />;
  if (tipo === "encontrada") return <Badge label="Encontrada" tone="accent" />;
  return <Badge label="Avistamiento" tone="sky" />;
}
