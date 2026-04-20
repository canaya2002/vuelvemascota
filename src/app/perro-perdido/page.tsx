import type { Metadata } from "next";
import { SeoHubPage } from "@/components/SeoHubPage";
import { HUBS } from "@/lib/seoContent";

const hub = HUBS["perro-perdido"];

export const metadata: Metadata = {
  title: hub.title,
  description: hub.description,
  alternates: { canonical: `/${hub.slug}` },
};

export default function Page() {
  return <SeoHubPage hub={hub} />;
}
