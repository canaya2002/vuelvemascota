import Link from "next/link";
import Script from "next/script";
import { SITE } from "@/lib/site";

export type Crumb = { label: string; href: string };

export function Breadcrumbs({
  items,
  ldId = "ld-breadcrumbs",
  hideUI = false,
}: {
  items: Crumb[];
  ldId?: string;
  hideUI?: boolean;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      ...items.map((c, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: c.label,
        item: `${SITE.url}${c.href}`,
      })),
    ],
  };
  return (
    <>
      <Script
        id={ldId}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      {!hideUI && (
        <nav aria-label="Ruta" className="vc-container pt-4 pb-0">
          <ol className="flex flex-wrap gap-1.5 text-xs text-[var(--muted)]">
            <li>
              <Link href="/" className="hover:text-[var(--ink)]">
                Inicio
              </Link>
              <span className="mx-1.5">/</span>
            </li>
            {items.map((c, i) => (
              <li key={c.href}>
                {i === items.length - 1 ? (
                  <span className="text-[var(--ink)] font-medium">{c.label}</span>
                ) : (
                  <>
                    <Link href={c.href} className="hover:text-[var(--ink)]">
                      {c.label}
                    </Link>
                    <span className="mx-1.5">/</span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </>
  );
}
