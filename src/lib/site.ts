import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://agentlytics.duckdns.org").replace(/\/$/, "");

export const SITE_NAME = "Quarry";

export const SITE_TAGLINE = "Autonomous AI Data Analyst for Documents, Tables & Databases";

export const SITE_TITLE = `${SITE_NAME} - ${SITE_TAGLINE}`;

export const SITE_DESCRIPTION =
  "Quarry is an autonomous AI data analyst that investigates your CSV, Excel, PDF documents, PostgreSQL, and MongoDB data in plain English. Get instant charts, reports, and cited dashboards.";

export const SITE_KEYWORDS = [
  "Quarry AI",
  "AI data analyst",
  "autonomous data analysis agent",
  "AI data analysis tool",
  "chat with CSV",
  "AI spreadsheet analyzer",
  "chat with Excel",
  "analyze Excel with AI",
  "chat with PDF",
  "AI PDF analyzer",
  "AI text file analyzer",
  "PostgreSQL AI analytics",
  "MongoDB AI analytics",
  "natural language database query",
  "AI dashboard generator",
  "AI chart generator",
  "AI report generator",
  "multi-agent data analysis",
  "autonomous business intelligence",
  "enterprise AI data assistant",
];

export const THEME_COLOR = "#C96442";

export const BACKGROUND_COLOR = "#F6F5EE";

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function privatePageMetadata(title: string, { follow = false }: { follow?: boolean } = {}): Metadata {
  return {
    title,
    robots: { index: false, follow, nocache: true, googleBot: { index: false, follow } },
    alternates: { canonical: null },
  };
}
