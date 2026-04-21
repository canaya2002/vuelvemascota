/**
 * Convierte un link con dominio propio (https://vuelvecasa.com/casos/abc) o
 * esquema custom (vuelvecasa://casos/abc) a una ruta interna de Expo Router.
 *
 * Soportamos:
 *  - /casos/:slug
 *  - /foros/:id
 *  - /chat/:canal
 *  - /donar
 */

import { useEffect } from "react";
import * as Linking from "expo-linking";
import { router } from "expo-router";

function parseAndNavigate(rawUrl: string | null) {
  if (!rawUrl) return;
  let path: string | null = null;
  try {
    if (rawUrl.startsWith("vuelvecasa://")) {
      path = rawUrl.replace("vuelvecasa://", "/");
    } else if (rawUrl.includes("vuelvecasa.com")) {
      const url = new URL(rawUrl);
      path = url.pathname;
    } else {
      return;
    }
  } catch {
    return;
  }
  if (!path || !path.startsWith("/")) return;

  const clean = path.split("?")[0];
  if (/^\/casos\/[^/]+$/.test(clean)) {
    router.push(clean as never);
  } else if (/^\/foros\/[^/]+$/.test(clean)) {
    router.push(clean as never);
  } else if (/^\/chat\/[^/]+$/.test(clean)) {
    router.push(clean as never);
  } else if (clean === "/donar") {
    router.push("/donar" as never);
  }
}

export function useDeepLinks() {
  useEffect(() => {
    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) parseAndNavigate(initial);
    })();
    const sub = Linking.addEventListener("url", (ev) =>
      parseAndNavigate(ev.url)
    );
    return () => sub.remove();
  }, []);
}
