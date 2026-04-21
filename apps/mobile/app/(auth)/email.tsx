/**
 * Sign-in/Sign-up con email + código de 6 dígitos.
 *
 * Clerk Expo expone dos hooks: useSignIn / useSignUp. El usuario escribe
 * su correo, intentamos signIn primero; si no existe, caemos a signUp. En
 * ambos, Clerk manda un código al email y nosotros lo verificamos.
 */

import { useState } from "react";
import { Alert, View } from "react-native";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Screen,
  H2,
  Body,
  Button,
  Input,
  IconButton,
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
        // Intento 1: signIn con email_code
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
    <Screen edges={["top", "bottom"]} background={colors.bg} padded>
      <View style={{ paddingTop: 8, marginBottom: 16 }}>
        <IconButton onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </IconButton>
      </View>

      <View style={{ gap: 18 }}>
        {step === "email" ? (
          <>
            <H2>¿Cuál es tu correo?</H2>
            <Body>Te mandamos un código de 6 dígitos.</Body>
            <Input
              label="Correo electrónico"
              placeholder="tu@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              containerStyle={{ marginTop: 16 }}
            />
            <Button
              label="Enviar código"
              block
              size="lg"
              loading={busy}
              disabled={!email.includes("@")}
              onPress={sendCode}
              style={{ marginTop: 8 }}
            />
          </>
        ) : (
          <>
            <H2>Código de acceso</H2>
            <Body>Lo enviamos a {email}.</Body>
            <Input
              label="Código"
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
              containerStyle={{ marginTop: 16 }}
            />
            <Button
              label="Entrar"
              block
              size="lg"
              loading={busy}
              disabled={code.length !== 6}
              onPress={verifyCode}
              style={{ marginTop: 8 }}
            />
            <Button
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
    </Screen>
  );
}
