import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { PwaRegister } from "@/components/PwaRegister";
import { ScrollProgress } from "@/components/motion";
import { SITE, CITIES } from "@/lib/site";
import { FLAGS } from "@/lib/flags";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans-local",
  subsets: ["latin"],
  display: "swap",
});

const display = Fraunces({
  variable: "--font-display-local",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Reporta, encuentra y ayuda a mascotas en México`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    // Core Mexico queries
    "mascota perdida México",
    "mascota encontrada México",
    "perro perdido",
    "gato perdido",
    "reportar mascota perdida",
    "cómo encontrar a mi mascota",
    "buscar perro perdido",
    "buscar gato perdido",
    // Cities
    "perro perdido CDMX",
    "gato perdido Guadalajara",
    "mascota perdida Monterrey",
    "perro perdido Puebla",
    "mascota encontrada Querétaro",
    "perro perdido Mérida",
    "gato perdido Tijuana",
    "mascota perdida León",
    "mascota perdida Toluca",
    "mascota perdida Cancún",
    // Zonas MX amplias
    "perro perdido área metropolitana Monterrey",
    "gato perdido zona metropolitana Guadalajara",
    "mascota perdida Estado de México",
    "mascota perdida Puebla Cholula",
    "mascota perdida Playa del Carmen",
    "mascota perdida San Luis Potosí",
    "mascota perdida Aguascalientes",
    "mascota perdida Oaxaca",
    "mascota perdida Veracruz",
    "mascota perdida Chihuahua",
    "mascota perdida Hermosillo",
    "mascota perdida Torreón",
    "mascota perdida Saltillo",
    "mascota perdida Morelia",
    "mascota perdida Ciudad Juárez",
    "mascota perdida Pachuca",
    "mascota perdida Cuernavaca",
    "mascota perdida Culiacán",
    // Action-based
    "alertas mascotas colonia",
    "alerta perro perdido cerca",
    "hogar temporal mascota",
    "hogar temporal perro",
    "hogar temporal gato",
    "ayuda para rescate animal",
    "rescate animal México",
    "donar a rescate animal",
    "refugio mascotas México",
    "veterinaria mascota encontrada",
    // Community
    "foro mascotas perdidas",
    "comunidad rescate animal México",
    "chat ayuda rescate mascotas",
    "experiencias reencuentro mascotas",
    "consejos dueños perros y gatos",
    // Long-tail
    "encontré un perro qué hago",
    "encontré un gato qué hago",
    "cómo reportar una mascota perdida",
    "cómo activar alertas mascotas",
    "red de rescatistas México",
    "plataforma rescate mascotas gratis",
    "dónde reportar mascota perdida México",
    // Brand
    "VuelveaCasa",
    "vuelvecasa",
    "vuelvecasa.com",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "/",
    languages: {
      "es-MX": "/",
      "es": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: SITE.name,
    title: `${SITE.name} — Reporta, encuentra y ayuda a mascotas en México`,
    description: SITE.description,
    url: SITE.url,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — Red comunitaria para mascotas perdidas en México`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Reporta, encuentra y ayuda a mascotas en México`,
    description: SITE.description,
    images: ["/opengraph-image"],
    creator: "@vuelvecasa",
    site: "@vuelvecasa",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      ...(process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : {}),
      ...(process.env.META_DOMAIN_VERIFICATION
        ? { "facebook-domain-verification": process.env.META_DOMAIN_VERIFICATION }
        : {}),
      ...(process.env.TIKTOK_DEVELOPERS_VERIFICATION
        ? { "tiktok-developers-site-verification": process.env.TIKTOK_DEVELOPERS_VERIFICATION }
        : {}),
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  category: "community",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "geo.region": "MX",
    "geo.placename": "México",
    "geo.position": "23.6345;-102.5528",
    ICBM: "23.6345, -102.5528",
    "article:publisher": SITE.url,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1a2b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: ["Vuelve a Casa", "Vuelvecasa", "Vuelve a Casa MX"],
  url: SITE.url,
  logo: {
    "@type": "ImageObject",
    url: `${SITE.url}/icon.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE.url}/opengraph-image`,
  sameAs: [
    SITE.social.instagram,
    SITE.social.tiktok,
    SITE.social.facebook,
    SITE.social.x,
  ],
  foundingDate: "2026-01-01",
  foundingLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressCountry: "MX",
      addressLocality: "Ciudad de México",
    },
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: SITE.contact.email,
      contactType: "customer support",
      areaServed: "MX",
      availableLanguage: ["Spanish", "es-MX"],
    },
    {
      "@type": "ContactPoint",
      email: SITE.contact.prensa,
      contactType: "press",
      areaServed: "MX",
      availableLanguage: ["Spanish", "es-MX"],
    },
  ],
  areaServed: { "@type": "Country", name: "Mexico" },
  knowsAbout: [
    "Mascotas perdidas",
    "Rescate animal",
    "Alertas comunitarias por zona",
    "Hogar temporal para mascotas",
    "Donaciones a rescatistas",
    "Veterinarias aliadas",
    "Avistamientos de mascotas",
    "Reportes hiperlocales",
    "Comunidad de rescatistas México",
  ],
  knowsLanguage: ["es-MX", "es"],
  slogan: SITE.tagline,
  description: SITE.description,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  alternateName: "VuelveaCasa MX",
  url: SITE.url,
  inLanguage: "es-MX",
  publisher: { "@id": `${SITE.url}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE.url}/casos?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  url: SITE.url,
  applicationCategory: "SocialNetworkingApplication",
  operatingSystem: "Any (Web)",
  browserRequirements: "Requires JavaScript. Mejor experiencia en navegadores modernos.",
  inLanguage: "es-MX",
  description: SITE.description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "MXN",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Reporte de mascotas perdidas",
    "Alertas por zona geográfica",
    "Hogar temporal",
    "Donaciones transparentes",
    "Directorio de aliados verificados",
    "Matching entre casos perdidas y encontradas",
    "Foros comunitarios moderados",
    "Chat de ayuda rápida por canales",
  ],
  areaServed: CITIES.map((c) => ({
    "@type": "City",
    name: c.name,
    containedInPlace: { "@type": "AdministrativeArea", name: c.state },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tree = (
    <html
      lang="es-MX"
      className={`${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Script
          id="ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script
          id="ld-webapp"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-[var(--ink)] focus:px-4 focus:py-2 focus:rounded-full focus:shadow"
        >
          Saltar al contenido
        </a>
        <ScrollProgress />
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
        <VercelAnalytics />
        <PwaRegister />
      </body>
    </html>
  );

  if (FLAGS.auth) {
    return (
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: "#b8264a",
            colorText: "#0a1a2b",
            borderRadius: "12px",
          },
        }}
        signInUrl="/entrar"
        signUpUrl="/crear-cuenta"
        signInFallbackRedirectUrl="/panel"
        signUpFallbackRedirectUrl="/panel"
      >
        {tree}
      </ClerkProvider>
    );
  }

  return tree;
}
