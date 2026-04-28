/**
 * Sign-in / Sign-up por email con código de 6 dígitos.
 *
 * Manejo robusto de los estados de Clerk:
 * - "complete" + createdSessionId → setActive + ir a tabs.
 * - "missing_requirements" → la verificación funcionó pero Clerk pide más
 *   datos (firstName/lastName según Settings); auto-completamos con un
 *   nombre derivado del email para que el usuario no se quede varado.
 * - "verification_already_verified" / "session_exists" → la cuenta ya está
 *   creada de un intento previo; intentamos cerrar el flow en vez de
 *   mostrar un "código inválido" engañoso.
 * - useAuth().isSignedIn watch → si en cualquier momento Clerk reporta
 *   sesión activa, navegamos a tabs aunque el flow local no haya cerrado.
 */

import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { useAuth, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H1,
  Body,
  Text,
  Input,
  IconButton,
  AuroraBackground,
  AnimatedEntry,
  GlassSurface,
  PremiumButton,
  PulseDot,
  Eyebrow,
} from "@/components/ui";
import { colors } from "@/lib/theme";
import { errorMessage } from "@/lib/errors";

type Step = "email" | "code";

/** Acepta el shape { errors: [{code, message}] } de Clerk y matchea por código. */
function isClerkErrorCode(err: unknown, code: string): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { errors?: Array<{ code?: string }> };
  return Array.isArray(e.errors) && e.errors.some((x) => x?.code === code);
}

/** Genera un firstName a partir del local-part del email — Clerk a veces
 *  pide firstName como required y bloquea el signup si falta. */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "Usuario";
}

export default function EmailAuthScreen() {
  const { isSignedIn } = useAuth();
  const { isLoaded: siReady, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: suReady, signUp, setActive: setSignUpActive } = useSignUp();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [busy, setBusy] = useState(false);

  // Si en cualquier momento Clerk reporta sesión viva, salimos de la
  // pantalla de auth — cubre los casos donde un flow anterior dejó la
  // sesión activa pero la pantalla no se enteró.
  useEffect(() => {
    if (isSignedIn) router.replace("/(tabs)");
  }, [isSignedIn]);

  const sendCode = async () => {
    if (!siReady || !suReady || !email.includes("@")) return;
    setBusy(true);
    try {
      try {
        const attempt = await signIn.create({
          identifier: email,
          strategy: "email_code",
        });
        const emailFactor = attempt.supportedFirstFactors?.find(
          (f) => f.strategy === "email_code"
        ) as { emailAddressId: string } | undefined;
        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          setMode("signIn");
          setStep("code");
          return;
        }
      } catch {
        /* usuario no existe → caemos al sign up */
      }

      await signUp.create({ emailAddress: email });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("signUp");
      setStep("code");
    } catch (err) {
      Alert.alert("No pudimos enviar el código", errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /** Si la verificación quedó en `missing_requirements`, completamos con
   *  un firstName derivado del email para cerrar el flow automáticamente. */
  const completeSignUpIfNeeded = async (): Promise<boolean> => {
    if (!signUp) return false;
    try {
      const updated = await signUp.update({
        firstName: nameFromEmail(email),
      });
      if (updated.status === "complete" && updated.createdSessionId) {
        await setSignUpActive!({ session: updated.createdSessionId });
        router.replace("/(tabs)");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const verifyCode = async () => {
    setBusy(true);
    try {
      if (mode === "signIn") {
        const res = await signIn!.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
        if (res.status === "complete" && res.createdSessionId) {
          await setSignInActive!({ session: res.createdSessionId });
          router.replace("/(tabs)");
          return;
        }
        Alert.alert(
          "Verificación incompleta",
          "Pudimos validar tu código pero la sesión no quedó activa. Intenta de nuevo en unos segundos."
        );
        return;
      }

      // SIGN UP
      const res = await signUp!.attemptEmailAddressVerification({ code });
      if (res.status === "complete" && res.createdSessionId) {
        await setSignUpActive!({ session: res.createdSessionId });
        router.replace("/(tabs)");
        return;
      }
      // Email verificado pero faltan campos requeridos en Clerk Settings.
      if (res.status === "missing_requirements") {
        const ok = await completeSignUpIfNeeded();
        if (ok) return;
        Alert.alert(
          "Casi listo",
          "Tu cuenta se creó pero falta un dato. Vuelve a 'Cambiar correo', poné el mismo email y completaremos automáticamente."
        );
        return;
      }
      Alert.alert(
        "Verificación incompleta",
        `Estado: ${res.status}. Intenta solicitar el código de nuevo.`
      );
    } catch (err) {
      // Caso típico: el usuario ya verificó en un intento anterior.
      // En vez de mostrar "código inválido", intentamos cerrar el flow
      // de signup. El useEffect de isSignedIn redirige si hay sesión.
      if (
        isClerkErrorCode(err, "verification_already_verified") ||
        isClerkErrorCode(err, "session_exists") ||
        isClerkErrorCode(err, "form_identifier_exists")
      ) {
        const ok = await completeSignUpIfNeeded();
        if (ok) return;
        Alert.alert(
          "Tu cuenta ya está verificada",
          "Volvé al paso de email y pedí un nuevo código — esta vez te llevamos directo adentro."
        );
        setStep("email");
        setCode("");
        return;
      }
      Alert.alert("Código inválido", errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={["top", "bottom"]} padded>
      <AuroraBackground variant="sunrise" />

      <View style={{ paddingTop: 8, marginBottom: 16 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <AnimatedEntry delay={40}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <PulseDot size={6} color={colors.brand} />
          <Eyebrow>
            {step === "email" ? "Entra con email" : "Verifica el código"}
          </Eyebrow>
        </View>
      </AnimatedEntry>

      <AnimatedEntry delay={120}>
        <H1 style={{ fontSize: 30, letterSpacing: -0.8, marginBottom: 14 }}>
          {step === "email" ? "¿Cuál es tu correo?" : "Código de acceso"}
        </H1>
      </AnimatedEntry>

      <AnimatedEntry delay={180}>
        <Body style={{ color: colors.inkSoft, fontSize: 14, marginBottom: 20 }}>
          {step === "email"
            ? "Te mandamos un código de 6 dígitos."
            : `Lo enviamos a ${email}.`}
        </Body>
      </AnimatedEntry>

      <AnimatedEntry delay={240}>
        <GlassSurface radius={22}>
          <View style={{ padding: 18, gap: 14 }}>
            {step === "email" ? (
              <>
                <Input
                  label="Correo electrónico"
                  placeholder="tu@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
                <PremiumButton
                  label="Enviar código"
                  block
                  size="lg"
                  loading={busy}
                  disabled={!email.includes("@")}
                  onPress={sendCode}
                />
              </>
            ) : (
              <>
                <Input
                  label="Código"
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                  style={{ fontSize: 22, letterSpacing: 6, textAlign: "center" }}
                />
                <PremiumButton
                  label="Entrar"
                  block
                  size="lg"
                  loading={busy}
                  disabled={code.length !== 6}
                  onPress={verifyCode}
                />
                <PremiumButton
                  label="Cambiar correo"
                  variant="ghost"
                  block
                  onPress={() => {
                    setStep("email");
                    setCode("");
                  }}
                />
              </>
            )}
          </View>
        </GlassSurface>
      </AnimatedEntry>

      <AnimatedEntry delay={320}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 18,
          }}
        >
          <Ionicons name="lock-closed" size={12} color={colors.muted} />
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            Autenticación segura con cifrado extremo.
          </Text>
        </View>
      </AnimatedEntry>
    </Screen>
  );
}
