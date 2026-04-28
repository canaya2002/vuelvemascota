/**
 * Auth con email + password.
 *
 * Flow:
 *   1. Pantalla "credentials": email + password (+ nombre solo en sign-up).
 *      - Tap "Iniciar sesión" → signIn.create con password. Si OK → /(tabs).
 *      - Tap "Crear cuenta"  → signUp.create con password +
 *        prepareEmailAddressVerification → step "code".
 *   2. Pantalla "code": el código de 6 dígitos solo verifica el email.
 *      Tras attemptEmailAddressVerification status "complete" → /(tabs).
 *
 * Errores se mostrarán específicos: "email ya en uso", "password muy
 * corta", "código inválido", etc. — usando los códigos de Clerk.
 */

import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
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

type Step = "credentials" | "code";

function isClerkErrorCode(err: unknown, code: string): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { errors?: Array<{ code?: string }> };
  return Array.isArray(e.errors) && e.errors.some((x) => x?.code === code);
}

export default function EmailAuthScreen() {
  const { isSignedIn } = useAuth();
  const { isLoaded: siReady, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: suReady, signUp, setActive: setSignUpActive } = useSignUp();

  const [step, setStep] = useState<Step>("credentials");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  // Sesión viva en cualquier momento → salir de auth.
  useEffect(() => {
    if (isSignedIn) router.replace("/(tabs)");
  }, [isSignedIn]);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validPassword = password.length >= 8;
  const validFirstName = mode === "signIn" || firstName.trim().length >= 2;
  const canSubmit = validEmail && validPassword && validFirstName && !busy;

  const handleSignIn = async () => {
    if (!siReady || !canSubmit) return;
    setBusy(true);
    try {
      const res = await signIn.create({
        identifier: email,
        password,
        strategy: "password",
      });
      if (res.status === "complete" && res.createdSessionId) {
        await setSignInActive!({ session: res.createdSessionId });
        router.replace("/(tabs)");
        return;
      }
      Alert.alert(
        "No pudimos completar el inicio",
        `Estado: ${res.status}. Intenta de nuevo o usa "Crear cuenta".`
      );
    } catch (err) {
      // Si el usuario no existe en Clerk, sugerimos crear cuenta.
      if (
        isClerkErrorCode(err, "form_identifier_not_found") ||
        isClerkErrorCode(err, "form_password_incorrect")
      ) {
        Alert.alert(
          "Datos no coinciden",
          "Revisa tu email y contraseña. Si es la primera vez, toca \"Crear cuenta\"."
        );
        return;
      }
      Alert.alert("No pudimos iniciar sesión", errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async () => {
    if (!suReady || !canSubmit) return;
    setBusy(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName.trim(),
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("signUp");
      setStep("code");
    } catch (err) {
      if (isClerkErrorCode(err, "form_identifier_exists")) {
        Alert.alert(
          "Ese email ya tiene cuenta",
          "Toca \"Iniciar sesión\" con tu contraseña existente."
        );
        return;
      }
      if (isClerkErrorCode(err, "form_password_pwned")) {
        Alert.alert(
          "Contraseña insegura",
          "Esa contraseña aparece en filtraciones públicas. Elige otra."
        );
        return;
      }
      if (isClerkErrorCode(err, "form_password_length_too_short")) {
        Alert.alert(
          "Contraseña muy corta",
          "Mínimo 8 caracteres."
        );
        return;
      }
      Alert.alert("No pudimos crear tu cuenta", errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!suReady || code.length !== 6) return;
    setBusy(true);
    try {
      const res = await signUp!.attemptEmailAddressVerification({ code });
      if (res.status === "complete" && res.createdSessionId) {
        await setSignUpActive!({ session: res.createdSessionId });
        router.replace("/(tabs)");
        return;
      }
      Alert.alert(
        "Verificación incompleta",
        `Estado: ${res.status}. Solicita un código nuevo.`
      );
    } catch (err) {
      if (
        isClerkErrorCode(err, "verification_already_verified") ||
        isClerkErrorCode(err, "session_exists")
      ) {
        // Ya está verificado de un intento previo. Si hay sesión activa,
        // useEffect de isSignedIn redirige. Si no, mejor pedir login.
        Alert.alert(
          "Email ya verificado",
          "Tu cuenta ya está activa. Inicia sesión con tu contraseña."
        );
        setStep("credentials");
        setMode("signIn");
        setCode("");
        return;
      }
      if (isClerkErrorCode(err, "form_code_incorrect")) {
        Alert.alert("Código incorrecto", "Revísalo o pide uno nuevo.");
        return;
      }
      Alert.alert("Verificación falló", errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    if (!suReady) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert("Código enviado", `Revisa ${email}.`);
    } catch (err) {
      Alert.alert("No pudimos reenviar", errorMessage(err));
    }
  };

  /* ---------------------------- UI ----------------------------- */

  return (
    <Screen edges={["top", "bottom"]} padded scroll>
      <AuroraBackground variant="sunrise" />

      <View style={{ paddingTop: 8, marginBottom: 16 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <AnimatedEntry delay={40}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <PulseDot size={6} color={colors.brand} />
          <Eyebrow>
            {step === "credentials"
              ? mode === "signIn"
                ? "Iniciar sesión"
                : "Crear cuenta"
              : "Verifica tu email"}
          </Eyebrow>
        </View>
      </AnimatedEntry>

      <AnimatedEntry delay={120}>
        <H1
          style={{
            fontSize: 30,
            letterSpacing: -0.8,
            marginBottom: 14,
            lineHeight: 36,
          }}
        >
          {step === "credentials"
            ? mode === "signIn"
              ? "Bienvenido de vuelta."
              : "Crea tu cuenta."
            : "Código por email."}
        </H1>
      </AnimatedEntry>

      <AnimatedEntry delay={180}>
        <Body
          style={{
            color: colors.inkSoft,
            fontSize: 14,
            marginBottom: 20,
            lineHeight: 20,
          }}
        >
          {step === "credentials"
            ? mode === "signIn"
              ? "Entra con tu email y contraseña."
              : "Te mandaremos un código de 6 dígitos para verificar tu email."
            : `Lo enviamos a ${email}.`}
        </Body>
      </AnimatedEntry>

      {/* Toggle Sign-in / Sign-up */}
      {step === "credentials" ? (
        <AnimatedEntry delay={210}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.bgAlt,
              borderRadius: 12,
              padding: 4,
              marginBottom: 18,
            }}
          >
            <ModePill
              active={mode === "signIn"}
              label="Iniciar sesión"
              onPress={() => setMode("signIn")}
            />
            <ModePill
              active={mode === "signUp"}
              label="Crear cuenta"
              onPress={() => setMode("signUp")}
            />
          </View>
        </AnimatedEntry>
      ) : null}

      <AnimatedEntry delay={240}>
        <GlassSurface radius={22}>
          <View style={{ padding: 18, gap: 14 }}>
            {step === "credentials" ? (
              <>
                {mode === "signUp" ? (
                  <Input
                    label="Tu nombre"
                    placeholder="Cómo te llamas"
                    autoCapitalize="words"
                    autoComplete="name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                ) : null}
                <Input
                  label="Correo electrónico"
                  placeholder="tu@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  value={email}
                  onChangeText={(v) => setEmail(v.trim())}
                />
                <View>
                  <Input
                    label="Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={10}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: 38,
                      padding: 4,
                    }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.muted}
                    />
                  </Pressable>
                </View>
                <PremiumButton
                  label={mode === "signIn" ? "Entrar" : "Crear cuenta"}
                  block
                  size="lg"
                  loading={busy}
                  disabled={!canSubmit}
                  onPress={mode === "signIn" ? handleSignIn : handleSignUp}
                />
                {mode === "signIn" ? (
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Recuperar contraseña",
                        "Próximamente desde la app. Por ahora ingresa a vuelvecasa.com/entrar para resetearla."
                      )
                    }
                    hitSlop={6}
                    style={{ alignSelf: "center", marginTop: 4 }}
                  >
                    <Text
                      style={{
                        color: colors.brandInk,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <>
                <Input
                  label="Código"
                  placeholder="123456"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={code}
                  onChangeText={setCode}
                  style={{
                    fontSize: 22,
                    letterSpacing: 6,
                    textAlign: "center",
                  }}
                />
                <PremiumButton
                  label="Verificar y entrar"
                  block
                  size="lg"
                  loading={busy}
                  disabled={code.length !== 6}
                  onPress={verifyCode}
                />
                <Pressable
                  onPress={resendCode}
                  hitSlop={6}
                  style={{ alignSelf: "center", marginTop: 4 }}
                >
                  <Text
                    style={{
                      color: colors.brandInk,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Reenviar código
                  </Text>
                </Pressable>
                <PremiumButton
                  label="Cambiar correo"
                  variant="ghost"
                  block
                  onPress={() => {
                    setStep("credentials");
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
            Autenticación segura · cifrado extremo a extremo
          </Text>
        </View>
      </AnimatedEntry>
    </Screen>
  );
}

function ModePill({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 9,
        borderRadius: 8,
        backgroundColor: active ? colors.surface : "transparent",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: active ? "700" : "500",
          color: active ? colors.ink : colors.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
