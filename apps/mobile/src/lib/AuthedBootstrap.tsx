/**
 * Corre efectos que solo tienen sentido cuando el usuario está autenticado:
 *  - register push token en el backend
 *  - escuchar deep links
 *
 * Se monta dentro del grupo (tabs) para que solo corra tras auth gate.
 */

import type { ReactNode } from "react";
import { usePushRegistration, useDeepLinks } from "./hooks";

export function AuthedBootstrap({ children }: { children: ReactNode }) {
  usePushRegistration();
  useDeepLinks();
  return <>{children}</>;
}
