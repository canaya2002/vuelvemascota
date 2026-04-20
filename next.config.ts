import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Supabase Storage público (fotos de casos). Cubre cualquier proyecto.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Clerk avatars (UserButton).
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Long-cache for public assets we control.
        source: "/generales/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Canonical URL hygiene — common variants → clean slug.
      { source: "/home", destination: "/", permanent: true },
      { source: "/inicio", destination: "/", permanent: true },
      { source: "/waitlist", destination: "/registro", permanent: true },
      { source: "/register", destination: "/registro", permanent: true },
      { source: "/donate", destination: "/donar", permanent: true },
      { source: "/faqs", destination: "/faq", permanent: true },
      { source: "/aliados", destination: "/veterinarias", permanent: false },
      { source: "/refugios", destination: "/rescatistas", permanent: true },
      { source: "/como", destination: "/como-funciona", permanent: true },
      { source: "/privacy", destination: "/privacidad", permanent: true },
      { source: "/terms", destination: "/terminos", permanent: true },
      {
        source: "/perdido",
        destination: "/mascota-perdida",
        permanent: true,
      },
      {
        source: "/encontrado",
        destination: "/mascota-encontrada",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
