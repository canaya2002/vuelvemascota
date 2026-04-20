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
import { SITE } from "@/lib/site";
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
    "mascota perdida",
    "mascota encontrada",
    "perro perdido",
    "gato perdido",
    "reportar mascota",
    "rescate animal México",
    "ayuda para mascotas",
    "alertas de mascotas",
    "hogar temporal perro",
    "donar rescate animal",
    "refugio mascotas México",
    "encontré un perro",
    "encontré un gato",
    "cómo encontrar a mi mascota",
    "veterinaria mascota encontrada",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "/",
    languages: {
      "es-MX": "/",
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
  },
  robots: {
    index: true,
    follow: true,
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
  },
  manifest: "/site.webmanifest",
  category: "community",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1f33" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/icon.png`,
  sameAs: [SITE.social.instagram, SITE.social.tiktok, SITE.social.facebook, SITE.social.x],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: SITE.contact.email,
      contactType: "customer support",
      areaServed: "MX",
      availableLanguage: ["Spanish"],
    },
  ],
  areaServed: { "@type": "Country", name: "Mexico" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  inLanguage: "es-MX",
  publisher: {
    "@type": "Organization",
    name: SITE.name,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE.url}/buscar?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tree = (
    <html lang="es-MX" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen flex flex-col">
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-[var(--ink)] focus:px-4 focus:py-2 focus:rounded-full focus:shadow"
        >
          Saltar al contenido
        </a>
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
            colorPrimary: "#ff5a36",
            colorText: "#0b1f33",
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
