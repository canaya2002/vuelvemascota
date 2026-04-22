/**
 * Sign-in / Sign-up por email con código de 6 dígitos. Aurora en fondo,
 * card glass con inputs grandes y animaciones de paso a paso.
 */

import { useState } from "react";
import { Alert, View } from "react-native";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
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

export default function EmailAuthScreen() {
  const { isLoaded: siReady, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: suReady, signUp, setActive: setSignUpActive } = useSignUp();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [busy, setBusy] = useState(false);

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
        /* usuario no existe, intentamos sign up */
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
        }
      } else {
        const res = await signUp!.attemptEmailAddressVerification({ code });
        if (res.status === "complete" && res.createdSessionId) {
          await setSignUpActive!({ session: res.createdSessionId });
          router.replace("/(tabs)");
        }
      }
    } catch (err) {
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
                  glow={email.includes("@")}
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
                  glow={code.length === 6}
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
