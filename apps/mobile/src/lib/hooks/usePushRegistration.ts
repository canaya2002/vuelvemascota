/**
 * Cuando el usuario queda autenticado, registramos el Expo push token en el
 * backend. Si cierra sesión, lo desregistramos. Se ejecuta una vez por
 * cambio de sesión — TanStack Query lo mantiene idempotente.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

import { useApi } from "../api";
import {
  registerPushWithBackend,
  unregisterPushWithBackend,
} from "../push";

export function usePushRegistration() {
  const { isSignedIn } = useAuth();
  const api = useApi();
  const tokenRef = useRef<string | null>(null);
  const lastSignedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (isSignedIn === lastSignedRef.current) return;
    lastSignedRef.current = isSignedIn ?? null;

    if (isSignedIn) {
      (async () => {
        tokenRef.current = await registerPushWithBackend(api);
      })();
    } else if (tokenRef.current) {
      unregisterPushWithBackend(api, tokenRef.current);
      tokenRef.current = null;
    }
  }, [isSignedIn, api]);

  // Deep link cuando el usuario toca una notificación.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | { url?: string; casoSlug?: string }
          | undefined;
        if (data?.url) {
          router.push(data.url as never);
        } else if (data?.casoSlug) {
          router.push(`/casos/${data.casoSlug}` as never);
        }
      }
    );
    return () => sub.remove();
  }, []);
}
