/**
 * Términos y condiciones — pantalla nativa.
 * Sincronizado a mano con la versión web (src/app/terminos).
 */

import { LegalScreen } from "@/components/legal/LegalScreen";

export default function TerminosScreen() {
  return (
    <LegalScreen
      eyebrow="Términos y condiciones"
      title="Las reglas para usar VuelveaCasa."
      subtitle="Al usar la app, aceptas estos términos. Última actualización: 28 abril 2026."
      sections={[
        {
          heading: "Sobre el servicio",
          body: "VuelveaCasa es una plataforma comunitaria mexicana para reportar mascotas perdidas o encontradas, recibir alertas en tu zona, ofrecer hogar temporal y apoyar rescates verificados. El servicio es gratuito para usuarios finales — solo cobramos comisiones de Stripe en donaciones.",
        },
        {
          heading: "Quién puede usarla",
          body: "Tienes que ser mayor de edad o usar la app con consentimiento de un tutor. No se permite crear cuentas falsas, suplantar identidad o usar la red para fines distintos al rescate y reporte de mascotas.",
        },
        {
          heading: "Tu cuenta",
          body: "Eres responsable de mantener tu contraseña segura y de toda la actividad que ocurra desde tu cuenta. Si sospechas un acceso no autorizado, avísanos a hola@vuelvecasa.com de inmediato.",
        },
        {
          heading: "Contenido que publicas",
          body: "Cuando publicas un caso, fotos, comentarios o cualquier información:",
          bullets: [
            "Garantizas que tienes derecho a hacerlo (que las fotos son tuyas o tienes permiso).",
            "Nos otorgas licencia limitada para mostrar tu contenido en la plataforma y, si autorizas, en redes sociales para difundir el caso.",
            "El contenido pasa por moderación automática (texto y fotos). Reservamos el derecho de remover contenido que viole estas normas.",
          ],
        },
        {
          heading: "Conducta",
          body: "Está prohibido:",
          bullets: [
            "Publicar contenido falso, engañoso o con intención de fraude.",
            "Acosar, amenazar o difamar a otros usuarios.",
            "Usar la plataforma para vender, traspasar o regalar animales fuera del flujo de rescate/adopción.",
            "Solicitar datos bancarios o personales fuera del flujo oficial.",
            "Hacer scraping, ingeniería inversa o intentar romper la seguridad.",
          ],
        },
        {
          heading: "Donaciones",
          body: "Las donaciones se procesan exclusivamente en nuestro sitio web con Stripe — la app móvil no procesa pagos. Son voluntarias y no desbloquean ni amplían funciones del app: todas las funciones están disponibles para todos los usuarios sin distinción. VuelveaCasa no es donataria autorizada por SAT, por lo que las donaciones no son deducibles de impuestos y no emitimos CFDI deducible. Cada donación se asigna al fondo común o al caso específico que elegiste y publicamos reportes periódicos de transparencia.",
        },
        {
          heading: "Avisos importantes",
          body: "VuelveaCasa NO sustituye atención veterinaria de emergencia, autoridades competentes ni servicios de rescate profesional. Es una red comunitaria de apoyo. Para emergencias graves contacta a tu veterinaria de cabecera, asociaciones aliadas o autoridades locales.",
        },
        {
          heading: "Limitación de responsabilidad",
          body: "Hacemos lo posible por mantener el servicio disponible y preciso, pero no garantizamos resultados específicos (encontrar a tu mascota, recaudar un monto, etc.). No somos responsables por interacciones entre usuarios fuera de la plataforma — verifica siempre la identidad de quien dice tener a tu mascota antes de compartir datos sensibles o hacer entregas.",
        },
        {
          heading: "Cambios al servicio",
          body: "Podemos modificar funcionalidades, agregar planes pagados o cerrar el servicio con aviso razonable. Si los cambios afectan derechos sustanciales, te avisamos por email con al menos 30 días de anticipación.",
        },
        {
          heading: "Ley aplicable",
          body: "Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia se resuelve en los tribunales de la Ciudad de México, salvo que la ley te dé un fuero específico distinto.",
        },
      ]}
      footer="¿Dudas? Escríbenos a hola@vuelvecasa.com. VuelveaCasa MX · México · Hecho con cariño por las mascotas."
    />
  );
}
