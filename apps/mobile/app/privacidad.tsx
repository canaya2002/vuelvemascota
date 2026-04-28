/**
 * Aviso de privacidad — pantalla nativa.
 *
 * El contenido se mantiene sincronizado a mano con la versión web
 * (src/app/privacidad). Si actualizas el texto allá, sincronizá aquí.
 * Para evitar drift en el futuro, podríamos exponer un endpoint que
 * sirva las secciones desde la DB.
 */

import { LegalScreen } from "@/components/legal/LegalScreen";

export default function PrivacidadScreen() {
  return (
    <LegalScreen
      eyebrow="Aviso de privacidad"
      title="Cómo cuidamos tus datos."
      subtitle="Última actualización: 28 abril 2026 · Aplicable a todos los servicios de VuelveaCasa MX."
      sections={[
        {
          heading: "Quiénes somos",
          body: "VuelveaCasa es una red comunitaria mexicana para reportar mascotas perdidas, encontradas y apoyar rescates. Operamos bajo la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).",
        },
        {
          heading: "Qué datos recabamos",
          body: "Solo lo necesario para que la red funcione:",
          bullets: [
            "Datos de contacto: email, nombre, teléfono opcional.",
            "Información de los casos: fotos, descripción, ubicación aproximada de extravío o hallazgo.",
            "Tu ciudad y zona de alertas (no tu ubicación en tiempo real).",
            "Datos técnicos: dispositivo, IP, tipo de sesión — para seguridad.",
            "Donaciones: monto, frecuencia y email registrado en Stripe (no guardamos datos de tarjeta).",
          ],
        },
        {
          heading: "Para qué los usamos",
          body: "Los datos sirven exclusivamente para:",
          bullets: [
            "Operar la red: publicar casos, enviar alertas, conectar a voluntarios.",
            "Notificarte sobre tu caso o casos cercanos a tu zona.",
            "Procesar donaciones y mantener la transparencia.",
            "Mejorar la app en términos de uso y rendimiento.",
            "Cumplir con obligaciones legales y proteger la integridad de la comunidad.",
          ],
        },
        {
          heading: "Con quién los compartimos",
          body: "Solo con proveedores estrictamente necesarios y bajo contratos de confidencialidad: Stripe (pagos), Clerk (autenticación), Supabase (base de datos), Resend (correos transaccionales), Mapbox (mapas). NO vendemos ni alquilamos tus datos a terceros con fines comerciales.",
        },
        {
          heading: "Cuánto tiempo los guardamos",
          body: "Los datos de tu cuenta y reportes se conservan mientras tu cuenta esté activa. Si borras tu cuenta desde Ajustes → Borrar cuenta, anonimizamos tus datos personales en menos de 24 horas. Las fotos y casos públicos quedan archivados sin información personal asociada.",
        },
        {
          heading: "Tus derechos ARCO",
          body: "Por LFPDPPP tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos personales. Puedes ejercerlos desde el correo registrado a hola@vuelvecasa.com — respondemos en máximo 20 días hábiles.",
        },
        {
          heading: "Seguridad",
          body: "Conexiones cifradas con TLS 1.3, contraseñas hasheadas con bcrypt, datos de tarjeta nunca tocan nuestros servidores (van directo a Stripe). Aun así, ningún sistema es 100% invulnerable — si detectamos cualquier incidente que te afecte, te avisamos en máximo 72 horas como exige la LFPDPPP.",
        },
        {
          heading: "Cambios a este aviso",
          body: "Si modificamos este documento de forma sustancial, te avisamos por email o notificación push antes de que entre en vigor. La versión vigente siempre está disponible en vuelvecasa.com/privacidad y desde Ajustes → Aviso de privacidad.",
        },
      ]}
      footer="¿Dudas o quieres ejercer tus derechos? Escríbenos a hola@vuelvecasa.com. VuelveaCasa MX · México."
    />
  );
}
